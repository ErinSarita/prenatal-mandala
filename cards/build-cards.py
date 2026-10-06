#!/usr/bin/env python3
"""build-cards.py — draw the twelve cards, front and back, from cards.json.

Each card is laid out as a small web page at its printed size, 528 × 816
CSS pixels (about 3.7 × 5.7 inches at the deck's proportions), and
photographed in a headless Chrome at twice that, so the images are sharp in
print. The words live in cards.json; change them there and run this again.

Front, from the center of the mandala out, as the rings run:
  Your baby · You · Your circle (the circle of support) · Good to know
Back: the practices, one for your own healing, and the baby's question.

Writes img/c01.jpg ... img/c24.jpg (odd numbers are fronts) and the small
thumbnails in img/t/. Then raise CARD_V in pages.js, so browsers fetch the
new images, and rebuild the printable sheets:  python3 cards/build-cards-pdf.py

Run:  python3 cards/build-cards.py
Needs:  pip3 install playwright pillow  and  python3 -m playwright install chromium
"""
import base64, html, json, math, os
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG, FONTS = os.path.join(HERE, "img"), os.path.join(HERE, "fonts")
W, H = 528, 816

# The rings of the little wheel, from the center out, as on the mandala:
# baby, mother, the circle of support, educator, practices. Radii follow the
# mandala's own, scaled to the card; the rings bow outward like its scallops,
# and the practices are petals.
RINGS = [(16.5, 27.5, "#FFC9BC"), (28.5, 41, "#FCA59B"), (42, 52.5, "#F5A882"), (53.5, 63, "#EE866F"), (64, 78.5, "#E35F43")]
CURVE, GAP = 4.2, 1.4          # how far each edge bows out, and the gap between slices, in degrees
CENTER, SEED = "#F2A291", "#FFF7F1"   # the baby at the center, always lit, and her Seed of Life
DOT = {"baby": "#FFD3C8", "you": "#FCA59B", "circle": "#F5A882", "know": "#EE866F", "practice": "#E35F43"}


def font64(name):
    # The fonts travel inside the page, so the cards always set in their own type.
    return base64.b64encode(open(os.path.join(FONTS, name), "rb").read()).decode()


def esc(s):
    return html.escape(s, quote=False)


def wheel(k):
    """The mandala in small: card k's slice lit in every ring, and the center, the baby, always lit."""
    def pt(r, a):
        return f"{r * math.sin(math.radians(a)):.2f} {-r * math.cos(math.radians(a)):.2f}"

    def cell(r0, r1, a0, a1, inner):
        m = (a0 + a1) / 2
        back = f"Q{pt(r0 + CURVE, m)} {pt(r0, a0)}" if inner else f"A{r0} {r0} 0 0 0 {pt(r0, a0)}"
        return f"M{pt(r0, a0)}L{pt(r1, a0)}Q{pt(r1 + CURVE, m)} {pt(r1, a1)}L{pt(r0, a1)}{back}Z"

    def petal(r0, r1, a0, a1):
        m, w, c = (a0 + a1) / 2, a1 - a0, r0 + (r1 - r0) * 0.62
        return (f"M{pt(r0, a0)}Q{pt(c, a0 - w * .08)} {pt(r1, m)}Q{pt(c, a1 + w * .08)} {pt(r0, a1)}"
                f"Q{pt(r0 + CURVE, m)} {pt(r0, a0)}Z")

    s = ""
    for i in range(12):
        a0, a1 = i * 30 + GAP, (i + 1) * 30 - GAP
        for n, (r0, r1, c) in enumerate(RINGS):
            d = petal(r0, r1, a0, a1) if n == 4 else cell(r0, r1, a0, a1, n > 0)
            dim = "" if i == k else ' fill-opacity=".36"'
            s += f'<path d="{d}" fill="{c}"{dim}/>'
    seed = "".join(f'<circle cx="{5.7 * math.sin(math.radians(a)):.2f}" cy="{-5.7 * math.cos(math.radians(a)):.2f}" r="5.7"/>'
                   for a in range(0, 360, 60))
    s += (f'<circle r="15.5" fill="{CENTER}"/><g fill="none" stroke="{SEED}" stroke-width="1.35">'
          f'<circle r="5.7"/>{seed}<circle r="11.4"/></g>')
    return f'<svg class="wheel" viewBox="-84 -84 168 168" aria-hidden="true">{s}</svg>'


CSS = f"""
@font-face{{font-family:Marcellus;src:url(data:font/ttf;base64,{font64("Marcellus-Regular.ttf")})}}
@font-face{{font-family:Mulish;src:url(data:font/ttf;base64,{font64("Mulish.ttf")});font-weight:200 1000}}
html,body{{margin:0;background:#FFFFFF}}
.card{{--s:1}}
.card{{width:{W}px;height:{H}px;box-sizing:border-box;background:#FBF3F1;color:#5A2A20;font-family:Mulish,sans-serif;
  display:flex;flex-direction:column;border-radius:28px;overflow:hidden}}
.front{{padding:40px 44px 34px;gap:calc(var(--s)*14px)}}
.back{{padding:38px 42px 32px;gap:calc(var(--s)*15px)}}
.top{{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}}
.top .t{{display:flex;flex-direction:column;gap:6px}}
.eb{{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8E5E52}}
.title{{font-family:Marcellus,serif;font-size:52px;line-height:1}}
.sub{{font-family:Marcellus,serif;font-size:24px;color:#C2412F}}
.wheel{{width:118px;height:118px;flex:none}}
.rule{{height:1px;background:#EBD1CB}}
.sec{{display:flex;flex-direction:column;gap:5px}}
.h{{display:flex;align-items:center;gap:10px;font-family:Marcellus,serif;font-size:21px}}
.h i{{width:14px;height:14px;border-radius:50%;flex:none}}
.sec p{{margin:0;font-size:calc(var(--s)*14.6px);line-height:1.47}}
.box{{display:flex;flex-direction:column;gap:9px;background:#FFFFFF;border:1px solid #EBD1CB;border-radius:16px;padding:14px 18px}}
.grid{{display:grid;grid-template-columns:92px minmax(0,1fr);column-gap:12px;row-gap:calc(var(--s)*8px);font-size:calc(var(--s)*13.8px);line-height:1.43}}
.lbl{{font-size:11px;font-weight:700;letter-spacing:1.5px;color:#A8452E;padding-top:2px}}
.grow{{flex-grow:1}}
.foot{{display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-top:1px solid #EBD1CB;padding-top:12px;font-size:12px;color:#8E5E52}}
.front .foot{{letter-spacing:1px}}
.bt{{display:flex;justify-content:space-between;align-items:baseline;gap:12px}}
.bt .t{{font-family:Marcellus,serif;font-size:25px}}
.bt .m{{font-size:12px;font-weight:700;letter-spacing:2px;color:#8E5E52}}
.pr{{display:flex;flex-direction:column;gap:7px}}
.pr .h{{font-size:20px}} .pr .h i{{width:13px;height:13px;background:{DOT["practice"]}}}
ol{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:calc(var(--s)*3px);font-size:calc(var(--s)*13.5px);line-height:1.43}}
.heal{{display:flex;flex-direction:column;gap:7px;background:#F7E2DC;border-radius:16px;padding:13px 18px}}
.note{{font-size:calc(var(--s)*13px);line-height:1.43;font-style:italic;color:#7A4A3E}}
.q{{text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px}}
.q .bar{{width:28px;height:1px;background:#E6D2D3;margin-bottom:6px}}
.q .ql{{font-size:10.5px;font-weight:700;letter-spacing:1.75px;color:#A8452E}}
.q .qq{{font-family:Marcellus,serif;font-size:20px;line-height:1.2}}
.q .why{{font-size:calc(var(--s)*12.5px);line-height:1.4;font-style:italic;color:#8E5E52;max-width:360px}}
"""


def front(c, k):
    f = c["front"]
    sec = lambda key, name, text, extra="": (f'<div class="sec"><div class="h"><i style="background:{DOT[key]};{extra}"></i>{name}</div>'
                                             f'<p>{esc(text)}</p></div>')
    rows = "".join(f'<div class="lbl">{esc(a)}</div><div>{esc(b)}</div>' for a, b in f["know"])
    return f"""<div class="card front">
  <div class="top"><div class="t"><div class="eb">{esc(f["eyebrow"])}</div><div class="title">{esc(f["title"])}</div><div class="sub">{esc(f["subtitle"])}</div></div>{wheel(k)}</div>
  <div class="rule"></div>
  {sec("baby", "Your baby", f["baby"], "border:1px solid #E8A99B")}
  {sec("you", "You", f["you"])}
  {sec("circle", "Your circle", f["circle"])}
  <div class="box"><div class="h"><i style="background:{DOT["know"]}"></i>Good to know</div><div class="grid">{rows}</div></div>
  <div class="grow"></div>
  <div class="foot"><span>THE PREGNANCY AND BIRTH MANDALA</span><span>{k + 1} of 12</span></div>
</div>"""


def back(c, k):
    b = c["back"]
    ol = lambda steps: "<ol>" + "".join(f"<li>{esc(s)}</li>" for s in steps) + "</ol>"
    prs = "".join(f'<div class="pr"><div class="h"><i></i>{esc(p["name"])}</div>{ol(p["steps"])}</div>' for p in b["practices"])
    h = b["healing"]
    note = f'<div class="note">{esc(h["note"])}</div>' if h.get("note") else ""
    return f"""<div class="card back">
  <div class="bt"><div class="t">Practices · {esc(c["front"]["subtitle"])}</div><div class="m">{esc(c["front"]["title"].upper())}</div></div>
  {prs}
  <div class="heal"><div class="lbl">{esc(h["label"])}</div>{ol(h["steps"])}{note}</div>
  <div class="grow"></div>
  <div class="q"><div class="bar"></div><div class="ql">BABY'S QUESTION</div><div class="qq">{esc(c["question"])}</div><div class="why">{esc(c["why"])}</div></div>
  <div class="grow"></div>
  <div class="foot"><span>{esc(b["sources"])}</span><span style="letter-spacing:1px">{k + 1} of 12</span></div>
</div>"""


def main():
    cards = json.load(open(os.path.join(HERE, "cards.json")))
    os.makedirs(os.path.join(IMG, "t"), exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
        for k, c in enumerate(cards):
            for side, build in ((1, front), (2, back)):
                page.set_content(f"<!doctype html><meta charset=utf-8><style>{CSS}</style>{build(c, k)}")
                page.evaluate("document.fonts.ready")
                # Everything has to sit above the footer. A fuller card tightens its
                # type and spacing a little, in small steps, until it fits.
                scale = page.evaluate("""() => { const c = document.querySelector('.card');
                    for (let s = 1; s >= 0.84; s -= 0.01) {
                      c.style.setProperty('--s', s.toFixed(2));
                      if (c.scrollHeight <= c.clientHeight) return s; }
                    return 0; }""")
                if not scale:
                    raise SystemExit(f"card {k + 1} {'front' if side == 1 else 'back'} is too full to fit")
                name = "c%02d.jpg" % (k * 2 + side)
                tmp = os.path.join(IMG, name + ".png")
                page.screenshot(path=tmp, clip={"x": 0, "y": 0, "width": W, "height": H})
                im = Image.open(tmp).convert("RGB")
                os.remove(tmp)
                im.save(os.path.join(IMG, name), quality=92)
                im.resize((264, 408), Image.LANCZOS).save(os.path.join(IMG, "t", name), quality=90)
                print(name, c["front"]["title"], "front" if side == 1 else "back", f"type at {scale:.0%}")
        browser.close()


if __name__ == "__main__":
    main()
