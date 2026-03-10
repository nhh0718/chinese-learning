import bz2
import tarfile
import os
import json

base_dir = r"e:\Code-Fun\learning-chinese\backend\data\raw\tatoeba"
cmn_path = os.path.join(base_dir, "cmn_sentences.tsv.bz2")
vie_path = os.path.join(base_dir, "vie_sentences.tsv.bz2")
links_path = os.path.join(base_dir, "links.tar.bz2")
out_path = os.path.join(base_dir, "tatoeba_cmn_vie.json")

print("Loading CMN sentences...")
cmn_dict = {}
with bz2.open(cmn_path, "rt", encoding="utf-8") as f:
    for line in f:
        parts = line.strip().split('\t')
        if len(parts) >= 3:
            cmn_dict[parts[0]] = parts[2]
print(f"Loaded {len(cmn_dict)} CMN sentences.")

print("Loading VIE sentences...")
vie_dict = {}
with bz2.open(vie_path, "rt", encoding="utf-8") as f:
    for line in f:
        parts = line.strip().split('\t')
        if len(parts) >= 3:
            vie_dict[parts[0]] = parts[2]
print(f"Loaded {len(vie_dict)} VIE sentences.")

print("Reading links and matching...")
pairs = []
seen = set()

with tarfile.open(links_path, "r:bz2") as tar:
    for member in tar.getmembers():
        if member.name.endswith(".csv"):
            f = tar.extractfile(member)
            if f:
                for line in f:
                    parts = line.decode('utf-8').strip().split('\t')
                    if len(parts) >= 2:
                        id1, id2 = parts[0], parts[1]
                        
                        # case 1: id1 is CMN, id2 is VIE
                        if id1 in cmn_dict and id2 in vie_dict:
                            pair = (cmn_dict[id1], vie_dict[id2])
                            if pair not in seen:
                                pairs.append({"chinese": pair[0], "vietnamese": pair[1]})
                                seen.add(pair)
                        
                        # case 2: id1 is VIE, id2 is CMN
                        elif id1 in vie_dict and id2 in cmn_dict:
                            pair = (cmn_dict[id2], vie_dict[id1])
                            if pair not in seen:
                                pairs.append({"chinese": pair[0], "vietnamese": pair[1]})
                                seen.add(pair)

print(f"Found {len(pairs)} CMN-VIE pairs.")

print("Saving to JSON...")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(pairs, f, ensure_ascii=False, indent=2)

print("Done processing Tatoeba data.")
