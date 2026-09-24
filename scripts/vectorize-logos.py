"""Convert the supplied and partner-site flat logo artwork to scalable paths."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "dist" / "assets"


def paths(mask: np.ndarray, epsilon: float = 0.28) -> str:
    contours, _ = cv2.findContours(mask.astype("uint8") * 255, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    result = []
    for contour in contours:
        if cv2.contourArea(contour) < 1.5:
            continue
        points = cv2.approxPolyDP(contour, epsilon, True).reshape(-1, 2)
        if len(points) < 3:
            continue
        result.append("M" + " ".join(f"{x},{y}" if i == 0 else f"L{x},{y}" for i, (x, y) in enumerate(points)) + "Z")
    return " ".join(result)


def save(name: str, width: int, height: int, layers: list[tuple[str, np.ndarray]]) -> None:
    body = "".join(f'<path fill="{color}" fill-rule="evenodd" d="{paths(mask)}"/>' for color, mask in layers)
    (ROOT / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img">{body}</svg>')


im = np.asarray(Image.open(ROOT / "strategic-logo.png").convert("RGB"))
dark = np.max(im, axis=2) < 150
save("strategic-logo.svg", im.shape[1], im.shape[0], [("#171717", dark)])

im = np.asarray(Image.open(ROOT / "dtech-logo.png").convert("RGBA"))
red = (im[:, :, 0] > 100) & (im[:, :, 0] > im[:, :, 1] * 1.8) & (im[:, :, 3] > 125)
black = (np.max(im[:, :, :3], axis=2) < 80) & (im[:, :, 3] > 125)
white = (np.min(im[:, :, :3], axis=2) > 190) & (im[:, :, 3] > 125)
save("dtech-logo.svg", im.shape[1], im.shape[0], [("#ba2027", red), ("#151515", black), ("#ffffff", white)])

im = np.asarray(Image.open(ROOT / "near-logo.png").convert("RGBA"))
white = (np.min(im[:, :, :3], axis=2) > 200) & (im[:, :, 3] > 125)
orange = (im[:, :, 0] > 160) & (im[:, :, 1] < 150) & (im[:, :, 2] < 100) & (im[:, :, 3] > 125)
save("near-logo.svg", im.shape[1], im.shape[0], [("#ffffff", white), ("#ea5d24", orange)])

im = np.asarray(Image.open(ROOT / "buckeye-logo.jpg").convert("RGB"))
white = (np.min(im, axis=2) > 75) & ((np.max(im, axis=2) - np.min(im, axis=2)) < 70)
orange = (im[:, :, 0] > 75) & (im[:, :, 0] > im[:, :, 1] * 1.45) & (im[:, :, 1] > im[:, :, 2] * 1.1)
save("buckeye-logo.svg", im.shape[1], im.shape[0], [("#f3f2ee", white), ("#c77942", orange)])
