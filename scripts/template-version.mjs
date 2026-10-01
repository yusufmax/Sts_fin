import crypto from "node:crypto";

// CMS overrides are stored by element position (field 12, link 5, card 3...). This version
// changes whenever those positions can shift, so overrides saved for an older template
// are not applied to the wrong elements of a new one.
export function templateVersion(page) {
  const structure = {
    fields: page.fields.map(field => [field.tag, field.sectionId, field.cardId]),
    images: page.images.map(image => [image.id, image.sectionId, image.cardId]),
    links: page.links.map(link => [link.sectionId, link.cardId, link.isButton]),
    cards: page.cards.map(card => card.sectionId),
    sections: page.sections.length,
    extraText: page.extraText.map(item => [item.tag, item.sectionId]),
  };
  return crypto.createHash("sha256").update(JSON.stringify(structure)).digest("hex").slice(0, 16);
}
