#!/usr/bin/env python3
"""build-pdf.py — make the guidebook's PDFs, one for each cover style.

Browsers print web pages in their own ways (Safari, for one, ignores the
page size and prints on Letter), so the PDF is made here instead, in a
headless Chrome, at exactly 5.5 × 8.5 inches with nothing cut off. The site's
download button hands out these files.

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
            }""", c)
            page.wait_for_timeout(400)
            path = os.path.join(OUT, f"guidebook-{c}.pdf")
            page.pdf(path=path, width="5.5in", height="8.5in", print_background=True,
                     margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                     prefer_css_page_size=True)
            print(f"{os.path.relpath(path, ROOT)}  {os.path.getsize(path) // 1024} KB")
        browser.close()
    httpd.shutdown()


if __name__ == "__main__":
    main()
