"""Describe editable copy and image slots in the public HTML templates."""
from bs4 import BeautifulSoup, NavigableString
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1] / "dist"
pages = {}
for path in sorted(root.glob("*.html")):
    if path.name in {"admin.html", "admin-login.html"}:
        continue
    soup = BeautifulSoup(path.read_text(), "html.parser")
    section_nodes = soup.select("section")
    section_ids = {id(section): str(index) for index, section in enumerate(section_nodes)}
    def section_id(element):
        section = element.find_parent("section")
        return section_ids.get(id(section), "global") if section else "global"
    field_nodes = soup.select("[data-i18n], [data-ru]")
    image_nodes = soup.select("img")
    link_nodes = soup.select("a[href]")
    card_nodes = soup.select("article")
    card_ids = {id(card): str(index) for index, card in enumerate(card_nodes)}
    field_ids = {id(field): str(index) for index, field in enumerate(field_nodes)}
    fields = []
    for index, element in enumerate(field_nodes):
        section = element.find_parent("section")
        card = element.find_parent("article")
        fields.append({
            "id": str(index),
            "key": element.get("data-i18n"),
            "tag": element.name,
            "section": (section.get("id") or " ".join(section.get("class", []))) if section else "Navigation / footer",
            "sectionId": section_id(element),
            "cardId": card_ids.get(id(card)) if card else None,
            "en": element.decode_contents(),
            "ru": element.get("data-ru", ""),
            "uz": element.get("data-uz", ""),
        })
    images = []
    for index, element in enumerate(image_nodes):
        if not element.get("src", "").startswith("assets/"):
            continue
        section = element.find_parent("section")
        images.append({
            "id": str(index),
            "src": element.get("src", ""),
            "alt": element.get("alt", ""),
            "section": (section.get("id") or " ".join(section.get("class", []))) if section else "Navigation / footer",
            "sectionId": section_id(element),
            "cardId": card_ids.get(id(element.find_parent("article"))) if element.find_parent("article") else None,
        })
    links = []
    for index, element in enumerate(link_nodes):
        section = element.find_parent("section")
        card = element.find_parent("article")
        links.append({
            "id": str(index),
            "href": element.get("href", ""),
            "text": element.get_text(" ", strip=True)[:120] or element.get("aria-label", "") or "Link",
            "section": (section.get("id") or " ".join(section.get("class", []))) if section else "Navigation / footer",
            "sectionId": section_id(element),
            "cardId": card_ids.get(id(card)) if card else None,
            "card": card.find(["h2", "h3", "h4"]).get_text(" ", strip=True) if card and card.find(["h2", "h3", "h4"]) else "",
            "isButton": bool(set(element.get("class", [])) & {"primary-link", "secondary-link", "text-link", "nav-contact", "button", "card-link"}) or bool(element.find_parent(attrs={"class": "hero-actions"})),
            "fieldId": next((field_ids[id(field)] for field in element.descendants if id(field) in field_ids), None),
        })
    cards = []
    for index, element in enumerate(card_nodes):
        heading = element.find(["h2", "h3", "h4"])
        section = element.find_parent("section")
        cards.append({
            "id": str(index),
            "title": heading.get_text(" ", strip=True) if heading else "Card",
            "section": (section.get("id") or " ".join(section.get("class", []))) if section else "Page",
            "sectionId": section_id(element),
            "imageIds": [str(i) for i, image in enumerate(image_nodes) if image in element.descendants],
            "linkIds": [str(i) for i, link in enumerate(link_nodes) if link in element.descendants],
            "fieldIds": [str(i) for i, field in enumerate(field_nodes) if field in element.descendants],
        })
    sections = []
    for index, element in enumerate(section_nodes):
        heading = element.find(["h1", "h2", "h3"])
        fallback = element.get("id") or next((name for name in element.get("class", []) if name != "section-pad"), "Section")
        heading_field = None
        if heading:
            heading_field = heading if id(heading) in field_ids else (heading.find(attrs={"data-i18n": True}) or heading.find(attrs={"data-ru": True}))
        sections.append({"id": str(index), "sourceId": element.get("id", ""), "title": heading.get_text(" ", strip=True) if heading else fallback.replace("-", " ").title(), "headingFieldId": field_ids.get(id(heading_field)) if heading_field else None})
    extra_text = []
    for node in list(soup.body.descendants):
        if not isinstance(node, NavigableString) or not node.strip():
            continue
        parent = node.parent
        if not parent or parent.name in {"script", "style", "noscript", "svg"} or parent.find_parent(["script", "style", "noscript", "svg"]):
            continue
        if parent.get("aria-hidden") == "true" or parent.find_parent(attrs={"aria-hidden": "true"}):
            continue
        if parent.has_attr("data-i18n") or parent.has_attr("data-ru") or parent.find_parent(attrs={"data-i18n": True}) or parent.find_parent(attrs={"data-ru": True}):
            continue
        value = str(node)
        if not value.strip(" \n\t\r·↗←→•0123456789"):
            continue
        index = str(len(extra_text))
        extra_text.append({"id": index, "en": value.strip(), "sectionId": section_id(parent), "tag": parent.name})
        if parent.name in {"option", "textarea"}:
            parent["data-cms-copy"] = index
        else:
            span = soup.new_tag("span")
            span["data-cms-copy"] = index
            span.string = value
            node.replace_with(span)
    for link in links:
        element = link_nodes[int(link["id"])]
        copy = element.find(attrs={"data-cms-copy": True})
        link["extraTextId"] = copy.get("data-cms-copy") if copy else None
    pages[path.name] = {
        "title": soup.title.get_text(" ", strip=True).split(" | ")[0],
        "titles": {
            "en": soup.body.get("data-title-en", soup.title.get_text(" ", strip=True).split(" | ")[0]),
            "ru": soup.body.get("data-title-ru", ""),
            "uz": soup.body.get("data-title-uz", ""),
        },
        "fields": fields,
        "images": images,
        "links": links,
        "cards": cards,
        "sections": sections,
        "extraText": extra_text,
        "html": str(soup),
        "description": soup.find("meta", attrs={"name": "description"}).get("content", ""),
        "descriptions": {
            "en": (soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") or soup.find("meta", attrs={"name": "description"})).get_text(" ", strip=True) if soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") else soup.find("meta", attrs={"name": "description"}).get("content", ""),
            "ru": (soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p")).get("data-ru", "") if soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") else "",
            "uz": (soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p")).get("data-uz", "") if soup.select_one(".subhero-lead") or soup.select_one(".hero-copy p") else "",
        },
    }
print(json.dumps(pages, ensure_ascii=False))
