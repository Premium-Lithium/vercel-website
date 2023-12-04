from campaign_utils import campaign_task


# @campaign_task(name="location")
# def get_location(**kwargs):
#     print("Getting location...")
#     return 50.0, -1.0


# @campaign_task(name="roofArialView")
# def get_2d_roof_screenshot(location=None, **kwargs):
#     print(f"Getting 2d property screenshot at {location}...")
#     # todo
#     return "http://the_database_bucket_here/arial_view.png"


@campaign_task(name="propertyImage3d")
def get_3d_property_screenshot(location=None, **kwargs):
    print(f"Getting 3d property screenshot at {location}...")
    # todo
    return "http://the_database_bucket_here/3d_property.png"


@campaign_task(name="potentialSavingGBP")
def calc_potential_saving(total_solar_area_m2=None, location=None, **kwargs):
    print(f"Calculating the potential saving from {total_solar_area_m2} panel area at location {location}...")
    # todo
    return 1234.0


@campaign_task(name="totalSolarAreaM2")
def get_total_solar_area_m2_from(arial_view_url=None, **kwargs):
    print(f"Getting total solar area arial screenshot at {arial_view_url}...")
    # todo
    return 22.0


@campaign_task(name="solarFlyer")
def create_flyer(potential_savings: float = None, property_image: dict = None, **kwargs):
    print(f"Creating flyer for potential savings of {potential_savings} and property image at {property_image}...")
    # todo
    return {
        "front image": "http://example.com/flyer_front.png",
        "back image": "http://example.com/flyer_back.png"
    }