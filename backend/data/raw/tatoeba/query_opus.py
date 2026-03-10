import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(src, trg):
    url = f"https://opus.nlpl.eu/api/corpus?source={src}&target={trg}"
    try:
        with urllib.request.urlopen(url, context=ctx) as response:
            data = json.loads(response.read().decode())
            for c in data.get('corpora', []):
                if c.get('corpus') == 'Tatoeba':
                    print("Found Tatoeba:", c.get('url'))
    except Exception as e:
        print("Error fetching", url, ":", e)

fetch('vi', 'zh')
fetch('zh', 'vi')
