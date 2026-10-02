#!/usr/bin/env python3
"""build-cards-pdf.py — printable sheets of the card deck, front and back.

Printed double-sided on US Letter with the printer's usual setting, "flip on
long edge", each card's back lands exactly behind its front. Turn a cut card
over like a page and its back reads the right way up.

How the backs line up: flipping a sheet on its long edge mirrors it left to
right, so each back sits in the mirrored column of the same row. Cards set
sideways on the sheet (the large size) also turn the other way on the back,
so that turning the cut card over keeps its top at the top.

Two sizes:
  cards-large.pdf     2 per sheet, about 5.1 x 7.9 in, easy to read
  cards-standard.pdf  4 per sheet, about 3.3 x 5.1 in, an oracle-card size

Run:  python3 cards/build-cards-pdf.py      Needs:  pip3 install pymupdf
"""
import os
import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")
OUT = os.path.join(HERE, "pdf")
W, H = 612, 792            # US Letter, in points (72 to the inch)
RATIO = 1056 / 1632         # card width to height
GAP = 18                    # space between cards
NOTE = "Print double-sided  ·  Flip on long edge  ·  Actual size (100%), no scaling"
INK = (0.55, 0.37, 0.32)


def card(n, side):  # n from 1 to 12, side "front" or "back"
    return os.path.join(IMG, "c%02d.jpg" % ((n - 1) * 2 + (1 if side == "front" else 2)))


def crop_marks(page, r):
    """Short cut marks just outside each corner of a card."""
    off, ln = 3, 11
    for x, dx in ((r.x0, -1), (r.x1, 1)):
        for y, dy in ((r.y0, -1), (r.y1, 1)):
            page.draw_line((x + dx * off, y), (x + dx * (off + ln), y), color=INK, width=0.5)
            page.draw_line((x, y + dy * off), (x, y + dy * (off + ln)), color=INK, width=0.5)


def note(page, y):
    page.insert_textbox(fitz.Rect(0, y, W, y + 10), NOTE, fontsize=6.5, fontname="helv",
                        color=INK, align=fitz.TEXT_ALIGN_CENTER)


def large():
    """Two cards to a sheet, set sideways, one above the other."""
    cw = (H - 2 * 18 - GAP) / 2          # the card's width runs down the sheet
    ch = cw / RATIO                       # its height runs across
    x0 = (W - ch) / 2
    ys = [(H - 2 * cw - GAP) / 2 + k * (cw + GAP) for k in range(2)]
    doc = fitz.open()
    for s in range(0, 12, 2):
        doc.new_page(width=W, height=H); doc.new_page(width=W, height=H)
        front, back = doc[-2], doc[-1]
        for k, n in enumerate((s + 1, s + 2)):
            r = fitz.Rect(x0, ys[k], x0 + ch, ys[k] + cw)
            front.insert_image(r, filename=card(n, "front"), rotate=90)
            crop_marks(front, r)
            # The back: same row, mirrored across (centred, so the same
            # place), and turned the other way.
            back.insert_image(fitz.Rect(W - r.x1, r.y0, W - r.x0, r.y1), filename=card(n, "back"), rotate=270)
        note(front, H - 13)
    return doc, (cw / 72, ch / 72)


def standard():
    """Four cards to a sheet, upright, two by two."""
    ch = (H - 2 * 18 - GAP) / 2
    cw = ch * RATIO
    xs = [(W - 2 * cw - GAP) / 2 + k * (cw + GAP) for k in range(2)]
    ys = [18 + k * (ch + GAP) for k in range(2)]
    doc = fitz.open()
    for s in range(0, 12, 4):
        doc.new_page(width=W, height=H); doc.new_page(width=W, height=H)
        front, back = doc[-2], doc[-1]
        for k in range(4):
            n, col, row = s + k + 1, k % 2, k // 2
            r = fitz.Rect(xs[col], ys[row], xs[col] + cw, ys[row] + ch)
            front.insert_image(r, filename=card(n, "front"))
            crop_marks(front, r)
            back.insert_image(fitz.Rect(W - r.x1, r.y0, W - r.x0, r.y1), filename=card(n, "back"))
        note(front, H - 13)
    return doc, (cw / 72, ch / 72)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, build in (("cards-large", large), ("cards-standard", standard)):
        doc, (w, h) = build()
        doc.set_metadata({"title": "The Pregnancy and Birth Mandala, cards to print", "author": "Erin Singleton"})
        path = os.path.join(OUT, name + ".pdf")
        doc.save(path, deflate=True, garbage=3)
        print(f"{name}.pdf  {doc.page_count // 2} sheets  cards {w:.2f} x {h:.2f} in  {os.path.getsize(path) // 1024} KB")
