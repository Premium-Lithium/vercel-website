"""
Usage:
    run_campaign.py <campaign_name>

Options:
    -h --help     Show this screen.
"""

from docopt import docopt
import networkx as nx
from pathlib import Path
import yaml

from model import Campaign

# temp
from datetime import date
#


def main(args):
    name = args['<campaign_name>']
    campaign = get_campaign(name)

    if could_not_find(campaign):
        print(f"Could not find campaign named {name}")
        return

    print(campaign)

    campaign_data = campaign["campaign_specific_schema"]
    tasks = get_task_execution_order_to_calc(campaign_data)
    run(tasks)


def get_campaign(name):
    # sample_campaign = Campaign(
    #     campaign_id="c123",
    #     campaign_name="Sevenoaks",
    #     start_date=date(2023, 12, 1),
    #     end_date=date(2023, 12, 30),
    #     area="London",
    #     volume=5000,
    #     unit_rate=1.5,
    #     content_links={"link1": "http://example.com/content1", "link2": "http://example.com/content2"},
    #     campaign_specific_schema={"key1": "value1", "key2": "value2"},
    #     audit_criteria=[1, 2, 3]
    # )

    # todo: read campaign from database
    return dummy_campaign_entry()


def dummy_campaign_entry():
    import json
    dummy_db_json_file = 'campaign.json'
    with open(dummy_db_json_file, 'r') as file:
        data = json.load(file)

    return data


def could_not_find(campaign):
    return campaign is None


def create_graph(processes):
    G = nx.DiGraph()

    for process, dependencies in processes.items():
        G.add_node(process)  # Ensure all processes are added as nodes
        for dep in dependencies:
            G.add_edge(dep, process)

    return G


def get_task_execution_order_to_calc(outputs):
    # temp - load these from the data
    processes = load_processes_from("tasks.yml")
    # temp

    G = create_graph(processes)
    required_processes = find_required_tasks(G, outputs)

    subG = G.subgraph(required_processes)

    try:
        return list(nx.topological_sort(subG))
    except nx.NetworkXUnfeasible:
        raise ValueError("Required processes form a cycle, cannot determine execution order!")


def load_processes_from(yml_file_path: str):
    with open(yml_file_path, 'r') as file:
        data = yaml.load(file, Loader=yaml.FullLoader)

    return data


def find_required_tasks(graph, outputs):
    required = set()
    queue = list(outputs)

    while queue:
        task = queue.pop()

        if task not in required:
            required.add(task)
            queue.extend([pred for pred in graph.predecessors(task)])

    return required


def run(task_names: list[str]):
    tasks = {
    }


    for name in task_names:
        task = tasks[name]

        # 2. Store intermediate results in database (in the "campaign specific schema" json blob)
        args = {}
        results = task(args)

        store_results_in_database(results, name)

        print(f"Running task {task}")


def location():
    return 50.0, -1.0


def get_2d_roof_screenshot(location):
    pass


def property_screenshot_3d(location):
    pass

# total_solar_area:
#   - 2d_roof_screenshot

# potential_saving:
#   - total_solar_area
#   - location

# flyer_info:
#   - potential_saving
#   - 3d_property_screenshot

def store_results_in_database(task_name, results):
    print(f"Saving results of calculating {task_name} to database: {results}")


if __name__ == "__main__":
    arguments = docopt(__doc__)
    main(arguments)