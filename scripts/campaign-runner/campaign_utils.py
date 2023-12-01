from functools import wraps
from inspect import signature, Parameter


# Tasks - mapping of python function names in this file (annotated with "campaign_task"), to database column names
# to indicate that function X provides the data for column Y
task_mapping = {}


def campaign_data(name):
    def decorator(task):
        @wraps(task)
        def wrapper(*args, **kwargs):
            return task(*args, **kwargs)

        # All campaign**kwargs in function signature
        sig = signature(task)
        if not any(param.kind == Parameter.VAR_KEYWORD for param in sig.parameters.values()):
            raise TypeError(f"Campaign task {task.__name__} must have **kwargs in its parameters")

        # Attach database column name to this function to indicate what it returns
        wrapper.name = name
        task_mapping[name] =  task # todo: check order here

        return wrapper
    return decorator


@campaign_data(name="location")
def get_location(**kwargs):
    print("Getting location...")
    return 50.0, -1.0


@campaign_data(name="roofArialView")
def get_2d_roof_screenshot(location=None, **kwargs):
    print(f"Getting 2d property screenshot at {location}...")
    # todo
    return "http://the_database_bucket_here/arial_view.png"


@campaign_data(name="propertyImage3d")
def get_3d_property_screenshot(location=None, **kwargs):
    print(f"Getting 3d property screenshot at {location}...")
    # todo
    return "http://the_database_bucket_here/3d_property.png"


@campaign_data(name="potentialSavingGBP")
def calc_potential_saving(total_solar_area_m2=None, location=None, **kwargs):
    print(f"Calculating the potential saving from {total_solar_area_m2} panel area at location {location}...")
    # todo
    return 1234.0


@campaign_data(name="totalSolarAreaM2")
def get_total_solar_area_m2_from(arial_view_url=None, **kwargs):
    print(f"Getting total solar area arial screenshot at {arial_view_url}...")
    # todo
    return 22.0


@campaign_data(name="solarFlyer")
def create_flyer(potential_savings: float = None, property_image: dict = None, **kwargs):
    print(f"Creating flyer for potential savings of {potential_savings} and property image at {property_image}...")
    # todo
    return {
        "front image": "http://example.com/flyer_front.png",
        "back image": "http://example.com/flyer_back.png"
    }