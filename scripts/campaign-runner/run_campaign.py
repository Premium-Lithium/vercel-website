"""
Usage:
    run_campaign.py <campaign_name>

Options:
    -h --help     Show this screen.
"""

from docopt import docopt

from campaign import Campaign


def main(args):
    name = args['<campaign_name>']

    campaign = Campaign(name)
    campaign.run()


if __name__ == "__main__":
    arguments = docopt(__doc__)
    main(arguments)