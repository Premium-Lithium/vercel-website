"""
Usage:
    run_campaign.py <campaign_name>

Options:
    -h --help     Show this screen.
"""

from docopt import docopt
import supabase
import yaml

# from model import Campaign
from campaign import Campaign


def main(args):
    name = args['<campaign_name>']

    campaign = Campaign(name)
    campaign.run()
    input()

    campaign_data = campaign["campaign_specific_schema"]
    tasks = get_task_execution_order_to_calc(campaign_data)
    run(tasks)



def run(task_names: list[str]):
    for name in task_names:
        task = task_mapping[name]

        args = {}
        results = task(**args)

        # todo: store intermediate results in database (in the "campaign specific schema" json blob)

        store_results_in_database(results, name)


def store_results_in_database(results: any, key: str):
    print(f"Saving results of calculating {key} to database: {results}")
    # todo: use supabase sdk to add `results` to a new key in the campaign_specific_schema json blob, named `key`


if __name__ == "__main__":
    arguments = docopt(__doc__)
    main(arguments)