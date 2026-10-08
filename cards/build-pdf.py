#!/usr/bin/env python3
"""build-pdf.py — make the guidebook's PDFs, one for each cover style.

Browsers print web pages in their own ways (Safari, for one, ignores the
page size and prints on Letter), so the PDF is made here instead, in a
headless Chrome, at exactly 5.5 × 8.5 inches with nothing cut off. The site's
download button hands out these files.

Each cover also gets a booklet version, imposed two pages to a Letter sheet
in folding order, for printing at home and folding into a 5.5 x 8.5 book.

Run it after changing the guidebook:  python3 cards/build-pdf.py
Needs:  pip3 install playwright  and  python3 -m playwright install chromium
"""
import functools, http.server, os, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "pdf")
COVERS = ["oat", "terra", "terragold", "camel"]


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    handler.log_message = lambda *a: None
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def booklet(src, dst):
    """The same pages, laid out to print at home as a folded booklet.

    Two 5.5 x 8.5 in pages sit side by side on each side of a Letter sheet
    (11 x 8.5 in, landscape), in saddle-stitch order: printed double-sided,
    flipped on the short edge, the stack folds in half into the book, page
    order intact. The page count must be a multiple of four.
    """
    import fitz  # PyMuPDF
    pages = fitz.open(src)
    n = pages.page_count
    if n % 4:
        raise SystemExit(f"{n} pages: a booklet needs a multiple of four")
    out = fitz.open()
    w, h = pages[0].rect.width, pages[0].rect.height
    for i in range(n // 4):
        # front of sheet i: last-but-2i on the left, 2i on the right; back: the next pair inward
        for left, right in ((n - 1 - 2 * i, 2 * i), (2 * i + 1, n - 2 - 2 * i)):
            side = out.new_page(width=2 * w, height=h)
            side.show_pdf_page(fitz.Rect(0, 0, w, h), pages, left)
            side.show_pdf_page(fitz.Rect(w, 0, 2 * w, h), pages, right)
    out.set_metadata({"title": "The Pregnancy and Birth Mandala, booklet to print", "author": "Erin Singleton"})
    out.save(dst, deflate=True, garbage=3)


def main():
    os.makedirs(OUT, exist_ok=True)
    httpd = serve()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/cards/"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 900})
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        for c in COVERS:
            # Lay every page out in the print container, in this cover's cloth.
            page.evaluate("""c => {
                document.documentElement.dataset.cover = c;
                const pb = document.getElementById("printbook");
                pb.innerHTML = GUIDE.map((_, i) => pageHTML(i)).join("");
                // Each page gets an anchor, and each line of the contents (and
                // each card listed in a section) becomes a link to its page.
                pb.querySelectorAll(".pg").forEach((pg, i) => pg.id = "pg-" + i);
                pb.querySelectorAll("[data-go]").forEach(li => {
                    const a = document.createElement("a");
                    a.href = "#pg-" + li.dataset.go;
                    a.style.cssText = "display:flex;justify-content:space-between;gap:12px;flex:1;color:inherit;text-decoration:none";
                    while (li.firstChild) a.appendChild(li.firstChild);
                    li.appendChild(a);
                });
            }""", c)
            page.wait_for_timeout(400)
            path = os.path.join(OUT, f"guidebook-{c}.pdf")
            page.pdf(path=path, width="5.5in", height="8.5in", print_background=True,
                     margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                     prefer_css_page_size=True)
            print(f"{os.path.relpath(path, ROOT)}  {os.path.getsize(path) // 1024} KB")
            book = os.path.join(OUT, f"guidebook-{c}-booklet.pdf")
            booklet(path, book)
            print(f"{os.path.relpath(book, ROOT)}  {os.path.getsize(book) // 1024} KB  (booklet)")
        # Every web link in the book has to leave the page for the real site,
        # not the little server this script ran on.
        bad = page.evaluate("""() => [...document.querySelectorAll('#printbook a[href]')]
            .map(a => a.href).filter(h => !h.includes('#pg-') && !h.startsWith('https://'))""")
        if bad:
            raise SystemExit(f"Links that would not open from the PDF: {bad}")
        browser.close()
    httpd.shutdown()


if __name__ == "__main__":
    main()
