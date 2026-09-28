import requests

def search_wikimedia(query):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrlimit": 3,
        "prop": "imageinfo",
        "iiprop": "url|size|ext",
    }
    r = requests.get(url, params=params)
    return r.json()

print(search_wikimedia("Obelisco Buenos Aires"))
