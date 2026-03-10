import urllib.request
import bz2
import os
import tarfile
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    ("https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2", "cmn_sentences.tsv.bz2"),
    ("https://downloads.tatoeba.org/exports/per_language/vie/vie_sentences.tsv.bz2", "vie_sentences.tsv.bz2"),
    ("https://downloads.tatoeba.org/exports/links.tar.bz2", "links.tar.bz2")
]

out_dir = r"e:\Code-Fun\learning-chinese\backend\data\raw\tatoeba"

def download(url, filename):
    path = os.path.join(out_dir, filename)
    if not os.path.exists(path):
        print("Downloading", url, "...")
        with urllib.request.urlopen(url, context=ctx) as response, open(path, 'wb') as out_file:
            out_file.write(response.read())
    return path

cmn_bz2 = download(urls[0][0], urls[0][1])
vie_bz2 = download(urls[1][0], urls[1][1])
links_tar = download(urls[2][0], urls[2][1])

print("Files downloaded.")
