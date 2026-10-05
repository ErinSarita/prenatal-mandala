#!/usr/bin/env python3
"""add-questions.py — set each card's question on the back of the card.

Each month's imprint answers a question the baby may hold (see the guidebook,
"What is an imprint?"). The question sits at the foot of the card's back,
above the footer, where the practices that answer it end. Written in the
card's own fonts: a small label in Mulish, the question in Marcellus.

The untouched card images live in img/orig/. This reads from there and
writes img/, so it can be run again safely after changing a question.

Run:  python3 cards/add-questions.py      Needs:  pip3 install pillow
Then rebuild the printable sheets:  python3 cards/build-cards-pdf.py
"""
import os, shutil
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
IMG, ORIG, FONTS = (os.path.join(HERE, p) for p in ("img", "img/orig", "fonts"))

# One question per card, in the baby's voice. Keep in step with the mandala
# (index.html, EDUCATOR) and the guidebook (pages.js, QUESTIONS).
QUESTIONS = [
    "Am I wanted?", "Am I welcome?", "Is it safe to be here?",
    "When I reach out, will someone meet me?", "Is my world a kind place?", "Can I rest here?",
    "Can I trust those around me?", "Will I be held as space grows tight?", "Will I be given time?",
    "Can I make it through?", "Is it safe to arrive?", "Do I belong here, with you?"]

BG, LABEL, INK, RULE = (251, 243, 241), (168, 69, 46), (90, 42, 32), (230, 210, 211)


def font(name, size, weight=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    if weight:
        f.set_variation_by_name(weight)
    return f


def spaced(draw, xy_center, text, f, fill, tracking):
    """Draw letter-spaced text centred on a point."""
    widths = [draw.textlength(ch, font=f) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x, y = xy_center[0] - total / 2, xy_center[1]
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=f, fill=fill, anchor="lm")
        x += w + tracking


def content_bounds(im):
    """The footer rule near the bottom, and the last line of content above it."""
    w, h = im.size
    px = im.load()
    def busy(y):
        return sum(1 for x in range(80, w - 80, 3) if sum(abs(px[x, y][i] - BG[i]) for i in range(3)) > 40)
    rule = next(y for y in range(h - 61, h - 300, -1) if busy(y) > 250)
    last = next(y for y in range(rule - 6, 200, -1) if busy(y) > 2)
    return rule, last


def main():
    if not os.path.isdir(ORIG):  # first run: keep the untouched images
        os.makedirs(ORIG)
        for n in range(1, 25):
            shutil.copy2(os.path.join(IMG, "c%02d.jpg" % n), ORIG)
    label_f = font("Mulish.ttf", 21, b"Bold")
    q_f = font("Marcellus-Regular.ttf", 40)
    for k, q in enumerate(QUESTIONS):
        name = "c%02d.jpg" % (k * 2 + 2)  # the back of card k+1
        im = Image.open(os.path.join(ORIG, name)).convert("RGB")
        w, _ = im.size
        rule, last = content_bounds(im)
        d = ImageDraw.Draw(im)
        mid = (last + rule) / 2
        if rule - last >= 150:
            # room to spare: a short rule, the label, then the question
            d.line((w / 2 - 28, mid - 40, w / 2 + 28, mid - 40), fill=RULE, width=2)
            spaced(d, (w / 2, mid - 14), "HER QUESTION", label_f, LABEL, 3.5)
            d.text((w / 2, mid + 22), q, font=q_f, fill=INK, anchor="mm")
        else:
            # a tight card: label and question only, closer together
            spaced(d, (w / 2, mid - 17), "HER QUESTION", label_f, LABEL, 3.5)
            d.text((w / 2, mid + 15), q, font=q_f, fill=INK, anchor="mm")
        im.save(os.path.join(IMG, name), quality=92)
        print(f"{name}  {q}")


if __name__ == "__main__":
    main()
