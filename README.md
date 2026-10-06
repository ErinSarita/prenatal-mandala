# The Pregnancy and Birth Mandala

A teaching map of pregnancy and birth, read from the center out: the child, the mother, the educator, and practices for connecting with the prenate and for healing.

Created by Erin Singleton, a student in APPPAH's Prenatal & Perinatal Educator certification, as a project for Module Nine, on pregnancy and birth. An educational map, not medical advice.

The mandala is the single file `index.html`. The guidebook and the twelve cards live in `cards/`: the guidebook is written as text in `cards/pages.js` and styled by `cards/pages.css`, so it can be edited and printed. Both are served with GitHub Pages.

The guidebook's PDFs, one per cover style, are made by `cards/build-pdf.py` (headless Chrome, exactly 5.5 × 8.5 inches) and saved in `cards/pdf/`. Run it again after changing the guidebook: `python3 cards/build-pdf.py`.

The printable cards, `cards/pdf/cards-large.pdf` and `cards/pdf/cards-standard.pdf`, are made by `cards/build-cards-pdf.py` from the card images. Printed double-sided on US Letter with "flip on long edge" at actual size, each back lands behind its front.

The twelve cards are drawn by `cards/build-cards.py` from the words in `cards/cards.json`: each card is laid out as a small page in the cards' own fonts (`cards/fonts/`, under the SIL Open Font License) and photographed in headless Chrome into `cards/img/`. The front reads from the center of the mandala out, as its rings run: your baby, you, your circle (the circle of support), and good to know. The back holds the practices, one for your own healing, and the baby's question with a line on why it may begin to emerge. After changing a card, run `python3 cards/build-cards.py`, raise `CARD_V` in `cards/pages.js`, and rebuild the printable sheets.

The twelve baby's questions live in `index.html`, `cards/pages.js`, and `cards/cards.json`; the circle-of-support lines and the questions' notes live in `cards/cards.json` and `cards/pages.js`. Keep them in step.
