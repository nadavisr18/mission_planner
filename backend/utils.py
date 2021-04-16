import json

def get_dictionary():
    with open(f"temp_files\\dictionary.json", 'r') as file:
        data = json.load(file)
    return data