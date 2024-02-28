import json
import sys
import re

def json_normalizer(file_name):
    with open(file_name, 'r') as f:
        data = json.load(f)

    dic = {}
    dic["filmes"] = []
    dic["atores"] = []
    dic["generos"] = []

    id_filme = 1
    id_ator = 1
    id_genero = 1
    for item in data:
        filme = {}

        filme["id"] = id_filme
        if item.get("title"):
            filme["title"] = item["title"]
        else:
            filme["title"] = "None No Title"
            nome_filme = "None No Title"
        if item.get("year"):
            filme["year"] = item["year"]
        else:
            filme["year"] = -1
        if item.get("cast"):
            filme["cast"] = item["cast"]
            for at in item["cast"]:
                if at not in [a["name"] for a in dic["atores"]]:
                    ator = {}
                    ator["id"] = id_ator
                    ator["name"] = at
                    ator["filmes"] = []
                    ator["filmes"].append((item["title"], id_filme))
                    dic["atores"].append(ator)
                    id_ator += 1
                else:
                    for a in dic["atores"]:
                        if a["name"] == at:
                            a["filmes"].append((item["title"], id_filme))
        else:
            filme["cast"] = []
        if item.get("genres"):
            filme["genres"] = item["genres"]
            for g in item["genres"]:
                if g not in [g["name"] for g in dic["generos"]]:
                    genero = {}
                    genero["id"] = id_genero
                    genero["name"] = g
                    genero["filmes"] = []
                    genero["filmes"].append((item["title"], id_filme))
                    dic["generos"].append(genero)
                    id_genero += 1
                else:
                    for g_stored in dic["generos"]:
                        if g_stored["name"] == g:
                            g_stored["filmes"].append((item["title"], id_filme))
        else:
            filme["genres"] = []
        
        dic["filmes"].append(filme)
        id_filme += 1
    
    normalized_file_name = re.search(r'/?(.*)\.json$', file_name)
    with open(normalized_file_name.group(1) + "_normalized.json", 'w') as f:
        json.dump(dic, f, indent=4)

if __name__ == "__main__":

    json_normalizer(sys.argv[1])



