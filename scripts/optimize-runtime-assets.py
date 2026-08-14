"""Create compact WebP assets for the browser bundle from design masters."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
DESIGN = ROOT / "design"
SOURCE = DESIGN / "assets"
OUTPUT = DESIGN / "runtime"


def convert(source: Path, target: Path, size: tuple[int, int], *, alpha: bool) -> None:
    with Image.open(source) as image:
        prepared = image.convert("RGBA" if alpha else "RGB")
        if alpha:
            transparent_mask = prepared.getchannel("A").point(lambda value: 255 if value == 0 else 0)
            prepared.paste((0, 0, 0, 0), mask=transparent_mask)
        prepared.thumbnail(size, Image.Resampling.LANCZOS)
        target.parent.mkdir(parents=True, exist_ok=True)
        if alpha:
            prepared.save(target, "PNG", optimize=True, compress_level=9)
        else:
            prepared.save(target, "WEBP", quality=78, method=6)
        print(f"{target.name}: {prepared.width}x{prepared.height}")


convert(DESIGN / "sleeping-cat-cropped.png", OUTPUT / "warm-cat.png", (420, 240), alpha=True)
convert(SOURCE / "moonlit-guardian-v2.png", OUTPUT / "moonlit-guardian.png", (360, 420), alpha=True)
convert(SOURCE / "moonlit-sleeper-v2.png", OUTPUT / "moonlit-sleeper.png", (720, 360), alpha=True)
convert(SOURCE / "atelier-tuxedo-v2.png", OUTPUT / "atelier-tuxedo.png", (360, 520), alpha=True)
convert(SOURCE / "warm-paper-texture.png", OUTPUT / "warm-paper-texture.webp", (768, 768), alpha=False)
convert(SOURCE / "moonlit-paper-texture.png", OUTPUT / "moonlit-paper-texture.webp", (768, 768), alpha=False)
convert(SOURCE / "atelier-paper-texture.png", OUTPUT / "atelier-paper-texture.webp", (768, 768), alpha=False)
