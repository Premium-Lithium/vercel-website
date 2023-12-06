from inspect import signature

from data_deps import data_dependencies
import inspect
import tasks


# Get a list of all the functions and their arguments in temp_tasks.py
existing_tasks = { name: obj for name, obj in inspect.getmembers(tasks) if inspect.isfunction(obj) }


def getter_func_name(data_name: str) -> str:
    return f"get_{data_name}"


# Iterate through each of the functions we need to implement
for name, required_params in data_dependencies.items():
    required_task_name = getter_func_name(name)

    # If we can't find the required task, then tell the user it needs to be implemented
    if required_task_name not in existing_tasks.keys():
        raise ValueError(f"Could not find function named `{required_task_name}`")

    # We've found the task, check it has the correct arguments
    else:
        existing_args = list(signature(existing_tasks[required_task_name]).parameters.keys())

        if not all(param in existing_args for param in required_params):
            raise ValueError(f"Function {required_task_name} has incorrect arguments:\nExpected: {required_params}\nFound: {existing_args}")