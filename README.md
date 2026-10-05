# The Pregnancy and Birth Mandala

A teaching map of pregnancy and birth, read from the center out: the child, the mother, the educator, and practices for connecting with the prenate and for healing.

Created by Erin Singleton, a student in APPPAH's Prenatal & Perinatal Educator certification, as a project for Module Nine, on pregnancy and birth. An educational map, not medical advice.

The mandala is the single file `index.html`. The guidebook and the twelve cards live in `cards/`: the guidebook is written as text in `cards/pages.js` and styled by `cards/pages.css`, so it can be edited and printed. Both are served with GitHub Pages.

The guidebook's PDFs, one per cover style, are made by `cards/build-pdf.py` (headless Chrome, exactly 5.5 × 8.5 inches) and saved in `cards/pdf/`. Run it again after changing the guidebook: `python3 cards/build-pdf.py`.

The printable cards, `cards/pdf/cards-large.pdf` and `cards/pdf/cards-standard.pdf`, are made by `cards/build-cards-pdf.py` from the card images. Printed double-sided on US Letter with "flip on long edge" at actual size, each back lands behind its front.

Each card's back carries the question its month's imprint may answer ("Baby's question"). `cards/update-cards.py` sets them onto the card images, along with a few lines of card text corrected to match the mandala, reading the untouched originals from `cards/img/orig/`, in the cards' own fonts (`cards/fonts/`, under the SIL Open Font License). The same twelve questions live in `index.html` and `cards/pages.js`; keep all three in step.
