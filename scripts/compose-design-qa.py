"""Compose source/implementation boards used by the Product Design QA pass."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / "design"
PREVIEW = ROOT / "preview"
OUTPUT = ROOT / "design-qa"

PAIRS = {
    "warm": (DESIGN / "theme-warm-paper-reference.png", PREVIEW / "warm.png"),
    "moonlit": (DESIGN / "theme-moonlit-reference.png", PREVIEW / "moonlit.png"),
    "atelier": (DESIGN / "theme-atelier-reference.png", PREVIEW / "atelier.png"),
}


def label(image: Image.Image, text: str) -> Image.Image:
    bar = 38
    canvas = Image.new("RGB", (image.width, image.height + bar), "#f4f0e8")
    canvas.paste(image.convert("RGB"), (0, bar))
    draw = ImageDraw.Draw(canvas)
    draw.text((14, 11), text, fill="#2f2d2a", font=ImageFont.load_default())
    return canvas


def join(left: Image.Image, right: Image.Image) -> Image.Image:
    gap = 18
    canvas = Image.new("RGB", (left.width + right.width + gap, max(left.height, right.height)), "#c9c3b9")
    canvas.paste(left, (0, 0))
    canvas.paste(right, (left.width + gap, 0))
    return canvas


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for theme, (source_path, implementation_path) in PAIRS.items():
        source = Image.open(source_path).convert("RGB")
        implementation = Image.open(implementation_path).convert("RGB")
        if implementation.size != source.size:
            implementation = implementation.resize(source.size, Image.Resampling.LANCZOS)

        full = join(label(source, "SOURCE REFERENCE"), label(implementation, "IMPLEMENTATION"))
        full.save(OUTPUT / f"{theme}-comparison.jpg", quality=88, optimize=True)

        crop_box = (250, 210, 1420, 960)
        focus = join(
            label(source.crop(crop_box), "SOURCE FOCUS"),
            label(implementation.crop(crop_box), "IMPLEMENTATION FOCUS"),
        )
        focus.save(OUTPUT / f"{theme}-focus.jpg", quality=90, optimize=True)


if __name__ == "__main__":
    main()
