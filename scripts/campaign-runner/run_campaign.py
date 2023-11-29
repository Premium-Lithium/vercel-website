"""
Usage:
    run_campaign.py <campaign_name>

Options:
    -h --help     Show this screen.
"""

from docopt import docopt


def main(args):
    campaign_name = args['<campaign_name>']
    start_campaign(campaign_name)


def start_campaign(campaign_name):
    print(f"Starting campaign: {campaign_name}")


if __name__ == "__main__":
    arguments = docopt(__doc__)
    main(arguments)
