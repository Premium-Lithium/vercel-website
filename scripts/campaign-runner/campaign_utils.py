from functools import wraps
from inspect import signature, Parameter


task_mapping = {}


def campaign_task(name):
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
        task_mapping[name] =  task

        return wrapper
    return decorator