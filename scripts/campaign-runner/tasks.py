def get_location():
    print("Getting location...")
    return 50.0, -1.0


def get_roofArialView(location):
    print(f"Getting 2d property screenshot at location '{location}'...")
    # todo
    return "http://the_database_bucket_here/arial_view.png"


def get_propertyImage3d(location):
    print(f"Getting 3d property screenshot at location: '{location}'...")
    # todo
    return "http://the_database_bucket_here/3d_property.png"


def get_potentialSavingGBP(totalSolarAreaM2, location):
    print(f"Calculating the potential saving from solar area: '{totalSolarAreaM2}' panel area at location '{location}'...")
    # todo
    return 1234.0


def  get_totalSolarAreaM2(roofArialView):
    print(f"Getting total solar area arial screenshot at roof view '{roofArialView}'...")
    # todo
    return 22.0


def get_solarFlyer(potentialSavingGBP: float, propertyImage3d: dict):
    print(f"Creating flyer for potential savings of {potentialSavingGBP} and property image at {propertyImage3d}...")
    # todo
    return {
        "front image": "http://example.com/flyer_front.png",
        "back image": "http://example.com/flyer_back.png"
    }