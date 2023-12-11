import networkx as nx
from pathlib import Path
import yaml
import supabase

import tasks
from campaign_utils import getter_func_name
from data_deps import data_dependencies

from supabase import create_client, Client

import matplotlib.pyplot as plt


# todo: add production supabase url and key
url: str = "http://localhost:54321" # url: str = os.environ.get("SUPABASE_URL")
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" # key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)


class Campaign:
    def __init__(self, name):
        # todo: check if this succeeds
        definition = self._load_campaign_definition_for(name)

        self._name = name
        self._outputs = definition["campaign_specific_schema"]  # e.g "solarFlyer"
        self._id = definition["campaign_id"]


    def _load_campaign_definition_for(self, name):
        request = supabase.table('campaign_master').select("campaign_id, campaign_specific_schema").eq('campaign_name', name).execute()

        campaign_def = request.data
        if not campaign_def:
            raise ValueError(f"Could not find campaign named '{name}'")

        if len(campaign_def) > 1:
            print("Warning: found multiple campaigns with the same name, using the first one")

        return campaign_def[0]


    def run(self):
        data_ordering = self._calc_data_fetch_order_to_calc_outputs()
        self._fetch_data_in(data_ordering)


    def _calc_data_fetch_order_to_calc_outputs(self):
        dependency_graph = self._create_data_dependency_graph()

        # plt.figure(figsize=(12, 8))
        # nx.draw(dependency_graph, with_labels=True, node_color='lightblue',
        #         node_size=2000, font_size=10, font_weight='bold', arrowstyle='->', arrowsize=20)
        # plt.title("Graph Visualization")
        # plt.show()
        # input()

        # todo: implement this function
        # if not path_from_inputs_to_outputs(dependency_graph):
        #     raise ValueError("Cannot calculate outputs, no path from inputs to outputs.")

        # required_inputs = self._get_required_inputs_from(dependency_graph)
        ordered_required_inputs = self._calc_fetch_order_for(dependency_graph)

        return ordered_required_inputs


    def _create_data_dependency_graph(self) -> nx.DiGraph:
        dependency_graph = nx.DiGraph()
        visited = set()

        def add_dependencies(node):
            if node not in visited:
                visited.add(node)
                dependencies = data_dependencies.get(node, [])
                for dep in dependencies:
                    dependency_graph.add_edge(dep, node)
                    add_dependencies(dep)

        for output in self._outputs:
            add_dependencies(output)

        return dependency_graph


    def _calc_fetch_order_for(self, dependency_graph):
        # subG = dependency_graph.subgraph(required_inputs)

        try:
            return list(nx.topological_sort(dependency_graph))
        except nx.NetworkXUnfeasible:
            raise ValueError("Data dependencies form a cycle, cannot determine execution order!")


    def _fetch_data_in(self, data_ordering: list[str]):
        campaign_data_table = supabase.table('campaign_customers')

        campaign_items = campaign_data_table.select("*").eq('campaign_id', self._id).execute()
        campaign_data = campaign_items.data

        if not campaign_data:
            raise ValueError(f"Could not fetch campaign items for campaign '{self._name}'")

        for customer in campaign_data:
            campaign_specific_data = customer['campaign_specific_data']

            for data_name in data_ordering:
                required_arg_names = data_dependencies[data_name]

                data = {}

                if required_arg_names:
                    args = self._extract_data_from(campaign_specific_data, required_arg_names)
                    task = getattr(tasks, getter_func_name(data_name))
                    data = task(**args)
                else:
                    data = customer.get(data_name, None)

                campaign_specific_data = self._add_results_to(campaign_specific_data, data, data_name)

            self._update_campaign_specific_data_in(campaign_data_table, customer["customer_id"], campaign_specific_data)


    def _extract_data_from(self, campaign_specific_data: dict[str, any], data: list[str]) -> dict[str, any]:
        args = {}

        for data_name in data:
            value = campaign_specific_data.get(data_name, None)

            if value is None:
                raise ValueError(f"Could not find data '{data_name}' in customer record")

            args[data_name] = value

        return args


    def _add_results_to(self, campaign_specific_data, results: dict[any, any], name: str) -> dict[str, any]:
        if campaign_specific_data:
            campaign_specific_data[name] = results
        else:
            campaign_specific_data = { name: results }

        return campaign_specific_data


    def _update_campaign_specific_data_in(self, campaign_data_table, customer_id: str, campaign_specific_data: dict[str, any]):
        print(f"updating campaign_specific_data to {campaign_specific_data}")
        data, count = campaign_data_table.update({ 'campaign_specific_data': campaign_specific_data }).eq('customer_id', customer_id).execute()
        print(f"updated {count} rows, data: {data}")

        # todo: check errors here