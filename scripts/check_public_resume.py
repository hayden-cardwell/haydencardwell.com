"""Reject a public resume containing unmasked contact details."""
from pathlib import Path
import re

from pypdf import PdfReader
from pypdf.generic import IndirectObject, StreamObject

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "public/docs/hayden-cardwell-resume.pdf"
RETIRED = ROOT / "public/docs/haydencardwellcybersecurityengineer-pub.pdf"
PHONE = re.compile(r"(?<!\d)(?:\+?1[-. ]*)?(?:\(\d{3}\)|\d{3})[-. ]*\d{3}[-. ]*\d{4}(?!\d)")


def check():
    assert PDF.is_file(), "The sanitized public resume is missing"
    assert not RETIRED.exists(), "The retired resume must not be published"
    reader = PdfReader(PDF)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert "admin@cardwell.cloud" in text, "Use the public contact email"
    assert re.search(r"\d\*{2}-\*{3}-\*{3}\d", text), "Mask every phone digit except the first and last"
    assert "Certified Falcon Administrator" in text
    assert "Certified SIEM Engineer" in text
    visited = set()

    def inspect(value):
        if isinstance(value, IndirectObject):
            key = (value.idnum, value.generation)
            if key in visited:
                return
            visited.add(key)
            inspect(value.get_object())
        elif isinstance(value, dict):
            if isinstance(value, StreamObject):
                data = value.get_data()
                assert b"@optiv.com" not in data.lower(), "Work email found in a PDF stream"
            for item in value.values():
                inspect(item)
        elif isinstance(value, (list, tuple)):
            for item in value:
                inspect(item)
        elif isinstance(value, str):
            assert "@optiv.com" not in value.lower(), "Work email found in PDF text or metadata"
            assert not PHONE.search(value), "Unmasked phone found in PDF text or links"

    inspect(reader.trailer)
    # Include objects not reached by the page tree, such as obsolete annotations.
    for generation, objects in reader.xref.items():
        for number in objects:
            if number:
                inspect(IndirectObject(number, generation, reader))
    assert "@optiv.com" not in text.lower() and not PHONE.search(text)
    print("Public resume privacy check passed")


if __name__ == "__main__":
    check()
