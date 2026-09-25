"""Describe editable copy and image slots in the public HTML templates."""
from bs4 import BeautifulSoup
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1] / "dist"
pages = {}
for path in sorted(root.glob("*.html")):
    if path.name in {"admin.html", "admin-login.html"}:
        continue
    soup = BeautifulSoup(path.read_text(), "html.parser")
    fields = []
    for index, element in enumerate(soup.select("[data-i18n], [data-ru]")):
        section = element.find_parent("section")
        fields.append({
            "id": str(index),
            "key": element.get("data-i18n"),
            "tag": element.name,
            "section": (section.get("id") or " ".join(section.get("class", []))) if section else "Navigation / footer",
            "en": element.decode_contents(),
            "ru": element.get("data-ru", ""),
            "uz": element.get("data-uz", ""),
        })
    images = []
    for index, element in enumerate(soup.select("img")):
        if not element.get("src", "").startswith("assets/"):
            continue
        section = element.find_parent("section")
        images.append({
            "id": str(index),
            "src": element.get("src", ""),
            "alt": element.get("alt", ""),
            "section": (section.get("id") or " ".join(section.get("class", []))) if section else "Navigation / footer",
        })
    sections = []
    for index, element in enumerate(soup.select("section")):
        heading = element.find(["h1", "h2", "h3"])
        sections.append({"id": str(index), "title": heading.get_text(" ", strip=True) if heading else (element.get("id") or "Section")})
    pages[path.name] = {
        "title": soup.title.get_text(" ", strip=True).split(" | ")[0],
        "titles": {
            "en": soup.body.get("data-title-en", soup.title.get_text(" ", strip=True).split(" | ")[0]),
            "ru": soup.body.get("data-title-ru", ""),
            "uz": soup.body.get("data-title-uz", ""),
        },
        "fields": fields,
        "images": images,
        "sections": sections,
        "description": soup.find("meta", attrs={"name": "description"}).get("content", ""),
        "descriptions": {
            "en": (soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") or soup.find("meta", attrs={"name": "description"})).get_text(" ", strip=True) if soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") else soup.find("meta", attrs={"name": "description"}).get("content", ""),
            "ru": (soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p")).get("data-ru", "") if soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") else "",
            "uz": (soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p")).get("data-uz", "") if soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") else "",
        },
    }
print(json.dumps(pages, ensure_ascii=False))
