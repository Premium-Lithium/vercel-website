import networkx as nx
from pathlib import Path
import yaml
import supabase

import tasks
from campaign_utils import getter_func_name
from data_deps import data_dependencies

from supabase import create_client, Client


# todo: add production supabase url and key
url: str = "http://localhost:54321" # url: str = os.environ.get("SUPABASE_URL")
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" # key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)


class Campaign:
    def __init__(self, name):
        # todo: check if this succeeds
        definition = self._load_campaign_definition_for(name)

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


    # def _generate_function_template_for(self, func_name: str, args: list[str]):
    #     arg_string = ', '.join([f"{arg}=None" for arg in args]) + ', ' if args else ''

    #     decorator = f"@campaign_task(name=\"{func_name}\")"
    #     definition = f"def get_{func_name}({arg_string}**kwargs):"
    #     body = f"{func_name} = \"todo\""

    #     return f"{decorator}\n\t{definition}\n\t\t{body}\n\t\t# implementation here\n\t\treturn {func_name}"


    def _fetch_data_in(self, data_ordering: list[str]):
        # Get all the customers associated with this campaign
        campaign_items = supabase.table('campaign_customers').select("*").eq('campaign_id', self._id).execute()
        campaign_data = campaign_items.data

        if not campaign_data:
            raise ValueError(f"Could not fetch campaign items for campaign {self._id}")

        # For each customer record that we have
        for customer in campaign_data:

            # For each of the tasks that we want to run
            for data_name in data_ordering:
                task = getattr(tasks, getter_func_name(data_name))

                # Work out what the task requires
                required_arg_names = data_dependencies[data_name]
                print(f"Calculating {data_name}{' which requires ' + ', '.join([arg for arg in required_arg_names]) if required_arg_names else ''}")

                args = self._extract_data_from(customer, required_arg_names)

                # Call the task with the required arguments
                results = task(**args)

                # todo: store intermediate results in database (in the "campaign specific schema" json blob)

                # store_results_in_database(results, name)


    def _extract_data_from(self, customer_db_row: dict[str, any], data: list[str]) -> dict[str, any]:
        # Some items of data are common to all campaigns e.g address, others are stored in campaign specific data
        campaign_independent_data = [ "address" ]

        args = {}

        for data_name in data:
            if data_name in campaign_independent_data:
                value = customer_db_row.get(data_name, None)
            else:
                value = customer_db_row['campaign_specific_data'].get(data_name, None)

            if value is None:
                raise ValueError(f"Could not find data '{data_name}' in customer record")

            args[data_name] = value

        return args


    def _store_results_in_database(self, results: any, key: str):
        print(f"Saving results of calculating {key} to database: {results}")
        # todo: use supabase sdk to add `results` to a new key in the campaign_specific_schema json blob, named `key`


    def _calc_data_fetch_order_to_calc_outputs(self):
        dependency_graph = self._create_data_dependency_graph()
        required_inputs = self._get_required_inputs_from(dependency_graph)
        ordered_required_inputs = self._calc_fetch_order_for(required_inputs, dependency_graph)

        return ordered_required_inputs


    def _create_data_dependency_graph(self) -> nx.DiGraph:
        global data_dependencies

        dependency_graph = nx.DiGraph()

        for data, dependencies in data_dependencies.items():
            dependency_graph.add_node(data)

            for dep in dependencies:
                dependency_graph.add_edge(dep, data)

        return dependency_graph


    def _load_data_deps(self) -> dict[str, list[str]]:
        deps_file: Path = Path(__file__).parent / "data_dependencies.yml"

        with open(deps_file, 'r') as file:
            data = yaml.load(file, Loader=yaml.FullLoader)

        return data


    def _get_required_inputs_from(self, dependency_graph):
        required_inputs = set()
        queue = list(self._outputs)

        while queue:
            data = queue.pop()

            if data not in required_inputs:
                required_inputs.add(data)
                queue.extend([pred for pred in dependency_graph.predecessors(data)])

        return required_inputs


    def _calc_fetch_order_for(self, required_inputs, dependency_graph):
        subG = dependency_graph.subgraph(required_inputs)

        try:
            return list(nx.topological_sort(subG))
        except nx.NetworkXUnfeasible:
            raise ValueError("Data dependencies form a cycle, cannot determine execution order!")


    # def _find_unimplemented_tasks_in(self, task_ordering):
    #     missing_data = []

    #     for data in task_ordering:
    #         if data not in task_mapping:
    #             missing_data.append(data)

    #     return missing_data