import networkx as nx
from pathlib import Path
import yaml

from campaign_utils import campaign_data


class Campaign:
    def __init__(self, name):
        definition = self._load_campaign_definition_for(name)

        # if this succeeds, then extract the outputs that we want for this campaign
        self.data = definition["campaign_specific_schema"]  # e.g "solarFlyer"


    def _load_campaign_definition_for(self, name):
        # todo: read campaign from database
        return self._dummy_campaign_defintion()


    # =========================== temp ===========================
    def _dummy_campaign_defintion(self):
        import json
        dummy_db_json_file = 'dummy_campaign.json'
        with open(dummy_db_json_file, 'r') as file:
            data = json.load(file)

        return data
    # =========================== temp ===========================


    def run(self):
        data_ordering = self._calc_data_fetch_order_to_calc_outputs()
        print(data_ordering)

        missing_data = self._find_missing_data(data_ordering)

        if missing_data:
            raise NotImplementedError("CampaignData class does not provided the ability to fetch all data. Please implement the following functions: " + ", ".join(missing_data))
            return


    def _calc_data_fetch_order_to_calc_outputs(self):
        dependency_graph = self._load_data_dependency_graph()
        required_inputs = self._get_required_inputs_from(dependency_graph)
        ordered_required_inputs = self._calc_fetch_order_for(required_inputs, dependency_graph)

        return ordered_required_inputs


    def _load_data_dependency_graph(self):
        deps_file = Path(__file__).parent / "data_dependencies.yml"
        data_deps = self._load_data_deps_from(deps_file)

        dependency_graph = nx.DiGraph()

        for data, dependencies in data_deps.items():
            dependency_graph.add_node(data)

            for dep in dependencies:
                dependency_graph.add_edge(dep, data)

        return dependency_graph


    def _load_data_deps_from(self, yml_file: Path):
        with open(yml_file, 'r') as file:
            data = yaml.load(file, Loader=yaml.FullLoader)

        return data


    def _get_required_inputs_from(self, dependency_graph):
        outputs = self.data

        required_inputs = set()
        queue = list(outputs)

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


    def _find_missing_data(self, data_ordering):
        # 1. Work out what data collection functions *are* implemented
        missing_data = []

        for data in data_ordering:
            if data not in self.data:
                missing_data.append(data)

        return missing_data