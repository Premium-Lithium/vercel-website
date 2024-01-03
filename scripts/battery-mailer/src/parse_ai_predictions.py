import argparse
import csv

def main():
    if not args.filename.endswith('.csv'):
        print('TypeError: File must be a .csv')
        return
    with open(args.filename, newline='') as f:
        reader = csv.reader(f, dialect="unix")
        for row in reader:
            if row[0] == 'panel_lon_lat': continue
            latitude = float(row[0].split(', ')[1].rstrip(')'))
            longitude = float(row[0].split(', ')[0].lstrip('('))
            area = float(row[1])
            google_earth_link = row[2]
            google_maps_link = row[3]
            print(latitude,longitude,area,google_earth_link,google_maps_link)
            


if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog="python parse_ai_predictions", description="Parses AI predictions of Solar Panels, and optionally adds them to a database.")
    parser.add_argument('filename', type=str, help="A file to parse")
    parser.add_argument('-db', '--database', action="store_true", default=False, help="Store the parsed predictions into a database. (default: False)")
    parser.add_argument('-v', '--verbose', action="store_true")
    args = parser.parse_args()
    main()