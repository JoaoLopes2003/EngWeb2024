import json
import sys
import re

def json_normalizer(file_name):
    with open(file_name, 'r') as f:
        data = json.load(f)

    dic = {}
    dic["compositores"] = []
    dic["periodos"] = []

    id_periodo = 1
    for item in data["compositores"]:
        nome_periodo = item["periodo"]

        if nome_periodo not in [a["nome"] for a in dic["periodos"]]:
            periodo ={}
            periodo["id"] = id_periodo
            periodo["nome"] = nome_periodo
            periodo["compositores"] = set()
            periodo["compositores"].add(item["id"])
            dic["periodos"].append(periodo)
            item["periodo"] = id_periodo
            id_periodo += 1
        else:
            for a in dic["periodos"]:
                if a["nome"] == nome_periodo:
                    item["periodo"] = a["id"]
                    a["compositores"].add(item["id"])
        
        dic["compositores"].append(item)
    
    for periodo in dic["periodos"]:
        periodo["compositores"] = list(periodo["compositores"])
    
    normalized_file_name = re.search(r'/?(.*)\.json$', file_name)
    with open(normalized_file_name.group(1) + "_normalized.json", 'w') as f:
        json.dump(dic, f, indent=4)

if __name__ == "__main__":

    json_normalizer(sys.argv[1])
