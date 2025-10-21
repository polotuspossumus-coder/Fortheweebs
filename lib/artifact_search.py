import os

def search_artifacts(query, filters=None):
    if filters is None:
        filters = {}
    results = []
    vault_path = "./vault/"
    for root, _, files in os.walk(vault_path):
        for file in files:
            if query.lower() in file.lower():
                if all(f in file for f in filters.values()):
                    results.append(os.path.join(root, file))
    return results
