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
    def __init__(self, name) -> None:
        # todo: check if this succeeds
        definition = self._load_campaign_definition_for(name)

        self._name = name
        self._output = definition["campaign_specific_schema"]
        self._id = definition["campaign_id"]


    def _load_campaign_definition_for(self, name) -> dict[str, any]:
        request = supabase.table('campaign_master').select("campaign_id, campaign_specific_schema").eq('campaign_name', name).execute()

        campaign_def = request.data
        if not campaign_def:
            raise ValueError(f"Could not find campaign named '{name}'")

        if len(campaign_def) > 1:
            print("Warning: found multiple campaigns with the same name, using the first one")

        return campaign_def[0]


    def run(self) -> None: # todo: could this return a bool to indicate success?
        dependency_graph = self._create_data_dependency_graph()
        data_ordering = self._calc_data_retrieval_order(dependency_graph)
        self._retrieve_data_in(data_ordering)


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


    def _calc_data_retrieval_order(self, dependency_graph) -> list[str]:
        try:
            return list(nx.topological_sort(dependency_graph))
        except nx.NetworkXUnfeasible:
            raise ValueError("Data dependencies form a cycle, cannot determine execution order.")


    def _fetch_data_in(self, data_ordering: list[str]) -> None:
        campaign_data_table = supabase.table('campaign_customers')
        campaign_items = campaign_data_table.select("*").eq('campaign_id', self._id).execute()

        campaign_data = campaign_items.data

        if not campaign_data:
            raise ValueError(f"Could not fetch campaign items for campaign '{self._name}'")

        for customer in campaign_data:
            customer_data = customer
            customer_data['campaign_specific_data'] = customer_data['campaign_specific_data'] or {}

            for data_name in data_ordering:
                dependency_names = data_dependencies[data_name]

                if not dependency_names:
                    continue

                args = self._extract_task_args_from(customer_data, dependency_names)
                task = getattr(tasks, getter_func_name(data_name))
                data = task(**args)

                customer_data['campaign_specific_data'][data_name] = data

            data, count = campaign_data_table.update(customer_data).eq('customer_id', customer['customer_id']).execute()


    def _extract_task_args_from(self, customer_data: dict[str, any], data: list[str]) -> dict[str, any]:
        args = {}

        for data_name in data:
            value = customer_data.get(data_name, None)

            if value is None:
                value = customer_data['campaign_specific_data'].get(data_name, None)

            if value is None:
                raise ValueError(f"Could not find data '{data_name}' in customer record")

            args[data_name] = value

        return args