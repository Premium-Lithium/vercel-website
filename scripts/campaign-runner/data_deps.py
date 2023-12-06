from pathlib import Path
import yaml


def load_data_deps() -> dict[str, list[str]]:
    deps_file = Path(__file__).parent / "data_dependencies.yml"

    with open(deps_file, 'r') as file:
        data = yaml.load(file, Loader=yaml.FullLoader)

    return data


data_dependencies = load_data_deps()