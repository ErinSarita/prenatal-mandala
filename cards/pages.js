/* The guidebook, page by page.

   Each page is drawn at its printed size, 5.5 × 8.5 inches (528 × 816 CSS
   pixels), and the book scales it to fit the screen. Page numbers come from
   a page's place in this list, so pages can be added or moved and every
   number, the contents page included, follows along. The book is bound as
   a hardcover: cloth boards front and back, each lined with an endpaper
   that carries no number. */
(function () {
  "use strict";

  // The card images carry a version, so a browser holding an older copy
  // fetches the new one. Raise it whenever build-cards.py redraws the cards,
  // and raise the same number on pages.js and pages.css in index.html.
  const CARD_V = "?v=12";
  window.CARD_V = CARD_V;

  /* ---- the little wheel in the corner -------------------------------- */
  // Twelve slices clockwise from the top: nine months, then labor, birth, and
  // the first hour. Rings from the center out: baby, mother, the circle of
  // support, educator, practices, shaped as on the mandala: each ring bows
  // outward, and the practices are petals. The lit slices are the card's;
  // the center, the baby, is always lit. Drawn as on the cards (build-cards.py).
  const RINGS = [[16.5, 27.5, "#FFC9BC"], [28.5, 41, "#FCA59B"], [42, 52.5, "#F5A882"], [53.5, 63, "#EE866F"], [64, 78.5, "#E35F43"]];
  const CURVE = 4.2, GAP = 1.4;
  // A six-petaled flower: each petal runs len from the middle, its sides arcs of radius belly.
  const flower = (len, belly) => [0, 1, 2, 3, 4, 5].map(k => {
    const x = (len * Math.sin(k * Math.PI / 3)).toFixed(2), y = (-len * Math.cos(k * Math.PI / 3)).toFixed(2);
    return `<path d="M0 0A${belly} ${belly} 0 0 1 ${x} ${y}A${belly} ${belly} 0 0 1 0 0Z"/>`;
  }).join("");
  function wheel(from, to) { // slices [from, to) are lit
    const pt = (r, a) => `${(r * Math.sin(a * Math.PI / 180)).toFixed(2)} ${(-r * Math.cos(a * Math.PI / 180)).toFixed(2)}`;
    const cell = (r0, r1, a0, a1, inner) => {
      const m = (a0 + a1) / 2;
      return `M${pt(r0, a0)}L${pt(r1, a0)}Q${pt(r1 + CURVE, m)} ${pt(r1, a1)}L${pt(r0, a1)}` +
        (inner ? `Q${pt(r0 + CURVE, m)} ${pt(r0, a0)}` : `A${r0} ${r0} 0 0 0 ${pt(r0, a0)}`) + "Z";
    };
    const petal = (r0, r1, a0, a1) => {
      const m = (a0 + a1) / 2, w = a1 - a0, c = r0 + (r1 - r0) * 0.62;
      return `M${pt(r0, a0)}Q${pt(c, a0 - w * .08)} ${pt(r1, m)}Q${pt(c, a1 + w * .08)} ${pt(r0, a1)}Q${pt(r0 + CURVE, m)} ${pt(r0, a0)}Z`;
    };
    let s = "";
    for (let i = 0; i < 12; i++) {
      const a0 = i * 30 + GAP, a1 = (i + 1) * 30 - GAP, lit = i >= from && i < to;
      RINGS.forEach(([r0, r1, c], n) => {
        s += `<path d="${n === 4 ? petal(r0, r1, a0, a1) : cell(r0, r1, a0, a1, n > 0)}" fill="${c}"${lit ? "" : ' fill-opacity=".36"'}/>`;
      });
    }
    // the center: the baby, always lit in the baby ring's color, with a simple six-petaled flower
    s += `<circle r="15.5" fill="#FFC9BC"/><g fill="#FFF7F1">` + flower(11.5, 9.5) + `</g>`;
    return `<svg class="wheel" viewBox="-84 -84 168 168" aria-hidden="true">${s}</svg>`;
  }

  /* ---- the foil mandala for the front cover ------------------------- */
  // The mandala reduced to its shapes: no words, no numbers. Each colour is
  // a foil, a sweep of light and dark bands in its own hue that all run the
  // same way, so the whole design catches the light together.
  const FOILS = {
    coral: ["#B23F28", "#EE8063", "#C44A31", "#F49A80", "#C9513A", "#EA7C60", "#AD3D27"],
    salmon: ["#C55A43", "#F8AA93", "#D46C53", "#FDBBA6", "#D7705A", "#F4A28B", "#BE553F"],
    pink: ["#D9786C", "#FBC4B9", "#E68E82", "#FFD2C9", "#E89286", "#F9BFB3", "#D27367"],
    peach: ["#E9AE9E", "#FBE3DA", "#F2BFB1", "#FFEAE3", "#F1C0B2", "#FADBD1", "#E5A797"],
    apricot: ["#C9734F", "#F9C2A2", "#DA8762", "#FDD0B5", "#DC8C67", "#F6BC9B", "#C46E4B"],
    rose: ["#A9705C", "#EBC6B2", "#B87F69", "#F4D6C5", "#BA826C", "#E6BEA9", "#A26A57"],
    gold: ["#8E6526", "#D9B36A", "#A47630", "#E6C887", "#AE8139", "#D4AA5E", "#8A6124"]};
  // The shapes are drawn twice from one plan: once in foil, and once as a
  // stencil whose gaps are black, so the gaps are cut clean through and the
  // cloth shows between the shapes, as it would under real foil. Radii are
  // taken from the mandala itself (its braid runs at 398).
  function foilShapes(mask) {
    const f = k => mask ? "#FFF" : `url(#foil-${k})`, GAP = mask ? "#000" : "none";
    const pt = (r, a) => [+(r * Math.sin(a)).toFixed(2), +(-r * Math.cos(a)).toFixed(2)];
    const P = (r, a) => pt(r, a).join(" ");
    const seg = i => [i / 12 * 2 * Math.PI, (i + 1) / 12 * 2 * Math.PI];
    const cell = (r0, r1, a0, a1, bulge) => {
      const m = (a0 + a1) / 2, c = r1 / Math.cos((a1 - a0) / 2) + bulge;
      return `M${P(r0, a0)}L${P(r1, a0)}Q${P(c, m)} ${P(r1, a1)}L${P(r0, a1)}A${r0} ${r0} 0 0 0 ${P(r0, a0)}Z`;
    };
    // An outer petal: straight sides rising from the ring, corners rounded,
    // meeting in a soft point at the middle of its segment.
    const petal = (a0, a1) => {
      const d = 0.03, m = (a0 + a1) / 2, b0 = a0 + d, b1 = a1 - d;
      return `M${P(257, b0)}L${P(265, b0)}Q${P(273, b0)} ${P(275, b0 + 0.03)}` +
        `Q${P(292, b0 + (m - b0) * 0.55)} ${P(301, m - 0.022)}Q${P(305, m)} ${P(301, m + 0.022)}` +
        `Q${P(292, b1 - (b1 - m) * 0.55)} ${P(275, b1 - 0.03)}Q${P(273, b1)} ${P(265, b1)}` +
        `L${P(257, b1)}A257 257 0 0 0 ${P(257, b0)}Z`;
    };
    let g = "";

    // The braid: a plait of three strands, drawn as two rows of slanted
    // links that lean against each other, coral, pink, and peach in turn.
    const N = 150, R = 398, strands = ["coral", "pink", "peach"];
    for (let k = 0; k < N; k++) {
      [[R + 3.4, 0, 1], [R - 3.4, 0.5, -1]].forEach(([rr, off, lean], row) => {
        const a = (k + off) / N * 2 * Math.PI, [x, y] = pt(rr, a);
        const deg = a * 180 / Math.PI + lean * 40;
        g += `<ellipse cx="${x}" cy="${y}" rx="13.5" ry="4.8" transform="rotate(${deg.toFixed(2)} ${x} ${y})" fill="${f(strands[(k + row) % 3])}" stroke="${GAP}" stroke-width=".9"/>`;
      });
    }

    // The time ring, in gold: a thin circle, a tick for each week, and longer
    // ticks with a small diamond at weeks 1, 14, 28, and 40. Weeks 1 to 14
    // fill the first quarter, 14 to 28 the second, 28 to 40 the third.
    const wk = w => (w <= 14 ? (w - 1) / 13 * 90 : w <= 28 ? 90 + (w - 14) / 14 * 90 : 180 + (w - 28) / 12 * 90) * Math.PI / 180;
    g += `<circle r="310" fill="none" stroke="${f("gold")}" stroke-width="1.1" opacity=".8"/>`;
    g += `<circle r="331" fill="none" stroke="${f("gold")}" stroke-width="1.8"/>`;
    { const a = wk(37), b = wk(40) + 2 * (wk(40) - wk(39));
      g += `<path d="M${P(327, a)}A327 327 0 0 1 ${P(327, b)}L${P(315, b)}A315 315 0 0 0 ${P(315, a)}Z" fill="${f("pink")}"/>`; }
    for (let w = 1; w <= 40; w++) {
      const major = [1, 14, 28, 40].includes(w), a = wk(w);
      g += `<line x1="${pt(major ? 310 : 331, a)[0]}" y1="${pt(major ? 310 : 331, a)[1]}" x2="${pt(major ? 343 : 339, a)[0]}" y2="${pt(major ? 343 : 339, a)[1]}" stroke="${f("gold")}" stroke-width="${major ? 2.6 : 1.5}" stroke-linecap="round"/>`;
      if (major) { const [dx, dy] = pt(350, a); g += `<rect x="${dx - 4}" y="${dy - 4}" width="8" height="8" transform="rotate(45 ${dx} ${dy})" fill="${f("gold")}"/>`; }
    }

    // the outer petals: the practices
    for (let i = 0; i < 12; i++) {
      const [a0, a1] = seg(i);
      g += `<path d="${petal(a0, a1)}" fill="${f("coral")}"/>`;
    }
    // the four rings, outside in, so each inner edge sits over the next:
    // educator, the circle of support, mother, baby
    [[214, 256, "salmon", 3], [170, 215, "apricot", 4], [120, 171, "pink", 4], [51, 121, "peach", 4]].forEach(([r0, r1, k, b]) => {
      for (let i = 0; i < 12; i++) { const [a0, a1] = seg(i); g += `<path d="${cell(r0, r1, a0, a1, b)}" fill="${f(k)}" stroke="${GAP}" stroke-width="5" stroke-linejoin="round"/>`; }
    });
    // the center: the Seed of Life in a pink disc, the new life at the heart of it all
    g += `<circle r="51" fill="${f("pink")}" stroke="${GAP}" stroke-width="5"/><circle r="42" fill="none" stroke="${GAP}" stroke-width="2"/>`;
    for (let k = -1; k < 6; k++) { const [x, y] = k < 0 ? [0, 0] : pt(14, k * Math.PI / 3); g += `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="${GAP}" stroke-width="2"/>`; }
    return g;
  }
  // Gradients, the stencil, and the shine live once in the document, not in
  // each copy of the cover, so every copy (open, turning, printed) finds them.
  if (!document.getElementById("foil-defs")) {
    const stops = c => c.map((h, i) => `<stop offset="${(i / (c.length - 1)).toFixed(3)}" stop-color="${h}"/>`).join("");
    document.body.insertAdjacentHTML("beforeend", `<svg id="foil-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      ${Object.entries(FOILS).map(([k, c]) => `<linearGradient id="foil-${k}" gradientUnits="userSpaceOnUse" x1="-420" y1="-420" x2="420" y2="420">${stops(c)}</linearGradient>`).join("")}
      <mask id="foil-cut" maskUnits="userSpaceOnUse" x="-420" y="-420" width="840" height="840">${foilShapes(true)}</mask>
      <filter id="foil-shine" x="-5%" y="-5%" width="110%" height="110%">
        <!-- Pressed in, not raised: a shadow just inside each shape's upper
             left edge, where the die pushed the cloth down, and a faint
             catch of light inside the lower right edge. -->
        <feOffset in="SourceAlpha" dx="1.6" dy="2" result="o1"/>
        <feComposite in="SourceAlpha" in2="o1" operator="out" result="rim1"/>
        <feGaussianBlur in="rim1" stdDeviation="1.1" result="rim1b"/>
        <feFlood flood-color="#3A1A10" flood-opacity=".55"/>
        <feComposite in2="rim1b" operator="in" result="shade"/>
        <feOffset in="SourceAlpha" dx="-1.2" dy="-1.4" result="o2"/>
        <feComposite in="SourceAlpha" in2="o2" operator="out" result="rim2"/>
        <feGaussianBlur in="rim2" stdDeviation=".9" result="rim2b"/>
        <feFlood flood-color="#FFF8F0" flood-opacity=".6"/>
        <feComposite in2="rim2b" operator="in" result="catch"/>
        <feComposite in="shade" in2="SourceAlpha" operator="in" result="shadeIn"/>
        <feComposite in="catch" in2="SourceAlpha" operator="in" result="catchIn"/>
        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shadeIn"/><feMergeNode in="catchIn"/></feMerge>
      </filter></defs></svg>`);
  }
  const foilMandala = () => `<svg class="foilmandala" viewBox="-420 -420 840 840" role="img" aria-label="The Pregnancy and Birth Mandala, stamped in foil"><g filter="url(#foil-shine)"><g mask="url(#foil-cut)">${foilShapes(false)}</g></g></svg>`;

  /* ---- the pages ----------------------------------------------------- */
  const P = []; // {title, cls, html(n)} where n is the printed page number
  const add = (title, cls, html) => { P.push({ title, cls, html }); return P.length; };
  // The window of tolerance, drawn: three bands, and a day's line moving
  // through them, rising above in a hard moment, dipping below, and coming
  // back each time.
  function windowGraph() {
    const lab = (y, t, s, c) => `<text x="0" y="${y}" class="wg-t" fill="${c}">${t}</text><text x="0" y="${y + 13}" class="wg-s">${s}</text>`;
    return `<svg class="wgraph" viewBox="0 0 432 176" role="img" aria-label="The window of tolerance: a line moving through a middle band, rising above it in a hard moment and dipping below it, and returning each time.">
      <rect x="112" y="4" width="320" height="44" rx="6" fill="#F7DCD3"/>
      <rect x="112" y="48" width="320" height="80" fill="#FBEFEA"/>
      <rect x="112" y="128" width="320" height="44" rx="6" fill="#E8D6D2"/>
      <line x1="112" y1="48" x2="432" y2="48" stroke="#D9AE62" stroke-width="1.2" stroke-dasharray="4 3"/>
      <line x1="112" y1="128" x2="432" y2="128" stroke="#D9AE62" stroke-width="1.2" stroke-dasharray="4 3"/>
      ${lab(22, "Above the window", "racing, panicked, on edge", "#C9533A")}
      ${lab(86, "Your window", "present, feeling, thinking", "#8A6124")}
      ${lab(150, "Below the window", "numb, foggy, far away", "#7A4A40")}
      <path d="M118 88 C130 76 140 76 152 88 S174 100 186 88 C198 74 204 26 218 22 C234 18 236 70 248 86 S272 100 284 88 S306 74 318 86 C330 100 334 150 348 152 C364 154 366 102 376 90 S404 76 416 88 S428 96 432 92" fill="none" stroke="#5A2A20" stroke-width="2" stroke-linecap="round"/>
      <circle cx="218" cy="22" r="3" fill="#C9533A"/><circle cx="348" cy="152" r="3" fill="#7A4A40"/>
      <text x="226" y="16" class="wg-n">a hard moment</text>
      <text x="356" y="164" class="wg-n">shutting down</text>
      <text x="244" y="62" class="wg-n">back, with resourcing</text>
    </svg>`;
  }

  // The printed number is a page's place in the book, with the front
  // endpaper uncounted: the cover is 1, so the contents falls on page 4.
  const no = t => P.findIndex(p => p.title === t); // printed number of a page, by title
  const foot = n => `<div class="foot"><span>The Pregnancy and Birth Mandala</span><span>${n}</span></div>`;

  // Cover
  add("Cover", "cover hard", () => `
    <div class="eb center gilt">Cards for pregnancy and birth</div>
    <div class="stamp">${foilMandala()}</div>
    <h1 class="covt gilt">The Pregnancy<br>and Birth Mandala</h1>
    <p class="covs">Companion book to the card deck</p>
    <div class="dash"></div>
    <p class="covlens">Through the lens of pre- and perinatal education</p>
    <p class="foil">Erin Singleton</p>`);
  add("Inside front cover", "endpaper", () => "");

  // The front matter keeps the book's custom: what matters starts on a
  // right-hand page. First the half-title, then the contents on its own with
  // a blank page facing it, then the mandala facing the Welcome.
  add("Half-title", "halftitle", () => `
    <div class="eb center">Cards for pregnancy and birth</div>
    <h1 class="htt">The Pregnancy<br>and Birth Mandala</h1>
    <div class="dash"></div>
    <p class="hts">Companion book to the card deck</p>`);
  // Contents, across a spread: the opening pages and Part One on the left,
  // Parts Two to Four on the right.
  add("Contents", "contents", n => contents(n, 0));
  add("Contents, continued", "contents", n => contents(n, 1));

  // The mandala on the right, and its key facing it on the left, with the
  // way to the interactive mandala.
  const quad = (a, b, name, sub) => `<div class="q">${wheel(a, b).replace('class="wheel"', 'class="qw"')}<div><b>${name}</b><span>${sub}</span></div></div>`;
  add("Key to the mandala", "key", n => `
    <div class="eb">The mandala · Key</div>
    <h1>Key to the mandala</h1>
    <div class="lab">The rings, from the center out</div>
    <ul class="rings">
      <li><svg class="dot sym" viewBox="-20 -20 40 40" aria-hidden="true"><circle r="19" fill="#FFC9BC"/><g fill="#FFF7F1">${flower(14, 11.6)}</g></svg><b>The center.</b> Your baby, the new life beginning, growing, and expanding.</li>
      <li><span class="dot" style="background:#FFD5CC;border:1px solid #F4B9AD"></span><b>The baby.</b> Her growth, and what she may be sensing.</li>
      <li><span class="dot" style="background:#FCA59B"></span><b>The mother.</b> Your body, your emotional life, and caring for yourself.</li>
      <li><span class="dot" style="background:#F5A882"></span><b>The circle of support.</b> How the people around you can hold you both, and be held too.</li>
      <li><span class="dot" style="background:#EE8A73"></span><b>The educator.</b> Possible imprints, the baby's question, and what helps.</li>
      <li><span class="dot" style="background:#E35F43"></span><b>The practices.</b> The outer petals: for connecting with your baby, and for your own healing.</li>
    </ul>
    <div class="lab">Around the circle, clockwise from the top</div>
    <div class="quads">
      ${quad(0, 3, "First trimester", "Months 1 to 3")}
      ${quad(3, 6, "Second trimester", "Months 4 to 6")}
      ${quad(6, 9, "Third trimester", "Months 7 to 9")}
      ${quad(9, 12, "Birth", "Labor, birth, first hour")}
    </div>
    <div class="lab">Around the edge</div>
    <ul class="rings">
      <li><span class="dot" style="background:transparent;border:1.5px solid #B98C80"></span><b>The time wheel.</b> Each month a span of color, and the forty weeks numbered, from week 1 at the top.</li>
      <li><span class="dot" style="background:#F2B4A8;box-shadow:inset 0 0 0 3px #FBE3DD"></span><b>The braid.</b> Three strands, for the baby, the mother, and the support around her, holding the circle together.</li>
    </ul>
    <div class="box blush"><p><b>See it come alive.</b> The interactive mandala opens every month in detail, and with a due date entered it shows today, the birth window, and the moons of your pregnancy.<br><a href="https://erinsarita.github.io/prenatal-mandala/">erinsarita.github.io/prenatal-mandala</a></p></div>
    ${foot(n)}`);

  // Frontispiece: the whole mandala, large, on a right-hand page.
  add("The mandala", "frontis", () => `
    <div class="eb center">The Pregnancy and Birth Mandala</div>
    <div class="halo"><img src="img/mandala.jpg${CARD_V}" alt="The Pregnancy and Birth Mandala: the baby at the center, then rings for the mother, the circle of support, the educator, and the outer petals of practices, with the months and the forty weeks around the edge."></div>`);


  add("Welcome", "", n => `
    <div class="eb">Welcome</div>
    <h1>A map for the journey,<br>with a child at its center</h1>
    <p>Pregnancy is often described in weeks, tests, and appointments. This deck invites you to see it another way: as a journey you and your baby take together, from the first days to the first hour after birth.</p>
    <p>In pre- and perinatal education, the baby is understood as aware from the very beginning. She is taking in her world, and what she experiences in the womb, at birth, and in her first hours may leave imprints that shape her long after. This is not a weight to carry. It is an invitation to slow down, to notice, and to connect.</p>
    <p>The cards come from a mandala, a circle organized around a center. At its center is your baby, the new life growing within you. Around her is you, and around you is your circle of support, the people who hold you so you can hold her. Then comes what is good to know, and on the outer petals are practices for connecting with her and for your own healing.</p>
    <p>The pages that follow lay the foundation: who your baby already is, how your world becomes hers, what an imprint is, your nervous system and your feelings, and how to speak with her. Then come the months, one card at a time, and people who can walk with you further.</p>
    <blockquote>There are no secrets you can keep from your baby, so talk to her, and more importantly, listen.<cite>Karen Strange, Simple Tools for Mothers</cite></blockquote>
    ${foot(n)}`);

  add("Start here", "", n => `
    <div class="eb">Start here</div>
    <h1>A conscious pregnancy</h1>
    <p>Pregnancy is often lived as a series of tests and dates, with the baby treated as a passenger until birth. Pre- and perinatal education offers another way: your baby is already here, sensing, learning, and taking in her world, and the months before birth are the beginning of your relationship.</p>
    <p>A conscious pregnancy means growing aware of her, and aware of yourself: your feelings, your body, the world around you, and how all of it reaches her.</p>
    <div class="lab">What the deck is for</div>
    <p>The cards turn this into something you can do. Each holds a picture of her month and of yours, how the people around you can hold you both, the imprints that may begin to form and the question that may begin to emerge for her, and practices for connecting with her and for your own healing.</p>
    <div class="lab">How to use this book</div>
    <ul class="lead">
      <li><b>Begin with the foundations.</b> Read them at your own pace. They explain why the practices matter.</li>
      <li><b>Then go to your month.</b> Read its page here, and keep its card close.</li>
      <li><b>Return whenever you need to.</b> The foundations are here for hard days, and the "Going deeper" pages at the back are here when you want more.</li>
      <li><b>If your path is harder,</b> through loss, conceiving with help, a hard birth, or grief, begin with page ${no("When the path is harder")}.</li>
    </ul>
    ${foot(n)}`);

  add("Your baby is already here", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>Your baby is already here</h1>
    <p>Long before she is born, your baby is moving, sensing, sleeping and waking, and learning. She is not waiting to begin. Her life, and her relationship with you, have already started.</p>
    <p>Pre- and perinatal psychology takes the view that she is a feeling, sensing person from the very beginning: aware in her own way, and taking in how she is received. David Chamberlain called the prenate "a conscious, sentient being."</p>
    <p>Science can measure her responses: a quickening heart, a turn toward a voice, a startle at a sound. It cannot yet measure her inner experience, and how and when awareness begins is still debated.</p>
    <div class="box blush"><p><b>A question to carry.</b> What would change if you met her, from today, as someone and not something? Not as a project to manage, but as a person getting to know you.</p></div>
    ${foot(n)}`);

  add("What she senses, and when", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>What she senses, and when</h1>
    <p class="muted">Times are approximate, and every baby develops in her own way.</p>
    <dl class="time">
      <dt>From 7 to 8 weeks</dt><dd><b>Movement and touch.</b> She begins to move, long before you can feel it. The first touch receptors form around her mouth, and by about 20 weeks most of her body can sense touch.</dd>
      <dt>From 10 to 15 weeks</dt><dd><b>Taste.</b> Taste buds form, and she swallows amniotic fluid flavored by what you eat.</dd>
      <dt>From 18 to 25 weeks</dt><dd><b>Hearing.</b> The first sounds reach her, your voice clearest of all, and by about 25 weeks she responds to sound.</dd>
      <dt>From 26 to 28 weeks</dt><dd><b>Light.</b> Her eyes open, and she can sense bright light through your belly.</dd>
      <dt>From 28 to 32 weeks</dt><dd><b>Dreaming sleep.</b> Active, dreaming sleep appears, and she spends much of each day in it.</dd>
      <dt>The last weeks</dt><dd><b>Learning and memory.</b> She grows used to sounds she hears often, knows your voice from a stranger's, and after birth prefers the voices, songs, and stories she heard in the womb.</dd>
      <dt>All along</dt><dd><b>Your states.</b> Through your heartbeat, breath, movement, and the chemistry that crosses the placenta, she lives inside the rhythm of your days.</dd>
    </dl>
    ${foot(n)}`);

  add("You are her first world", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>You are her first world</h1>
    <p>Before she meets the world, she lives inside yours. Everything that reaches her comes through you: what you feel, what you think, what you take in, the rhythms of your days, and the people around you.</p>
    <div class="lab">Your inner world</div>
    <div class="parts">
      <div><span class="dot" style="background:#FCA59B"></span><h3>Emotional</h3><p>Your feelings change your body's chemistry. Stress hormones such as cortisol, and calming ones such as oxytocin, rise and fall with your states, and some reach her through the placenta. Your heartbeat and breath, her constant background, quicken and settle with you.</p></div>
      <div><span class="dot" style="background:#EE8A73"></span><h3>Mental</h3><p>Your thoughts, beliefs, and expectations shape your feelings and your choices: whether you see her as someone, what you expect of birth, the stories you tell yourself. A fearful story and a trusting one feel different in the body, and so to her.</p></div>
    </div>
    <div class="box blush"><p>You do not need to feel calm all the time. Everyday stress is part of life, and the placenta buffers much of it. What matters most is the overall climate, and how often you find your way back.</p></div>
    ${foot(n)}`);

  add("The world around you", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>The world around you</h1>
    <div class="parts">
      <div><span class="dot" style="background:#E35F43"></span><h3>Physical</h3><p>Nourishment, water, rest, movement, and fresh air build her body, and what you take in, including alcohol, nicotine, and some medications, reaches her too. The sounds, light, and pace of your surroundings become part of her world.</p></div>
      <div><span class="dot" style="background:#C9993A"></span><h3>Relational</h3><p>Your partner, family, friends, and care providers, and whether you feel safe, supported, and respected among them. Conflict and kindness both reach her through you.</p></div>
      <div><span class="dot" style="background:#B98C80"></span><h3>The wider field</h3><p>Work, money, culture, and the times you are pregnant in. Some of this is beyond your control. Noticing it, and asking for support, is within it.</p></div>
    </div>
    <div class="lab">How it reaches her</div>
    <ul class="lead">
      <li><b>Through the placenta:</b> nutrients, hormones, and some of what you take in.</li>
      <li><b>Through your rhythms:</b> heartbeat, breath, movement, and sleep.</li>
      <li><b>Through sound:</b> your voice, and the voices around you.</li>
      <li><b>Over time, through her genes:</b> early surroundings can change how genes are switched on and off, a field called epigenetics, one way experience is carried forward (page ${no("Experience and the genes")}).</li>
    </ul>
    ${foot(n)}`);

  /* ---- foundations: the pre- and perinatal lens ---- */
  // Hormones: the body's messengers through pregnancy, birth, and bonding.
  // Epigenetics: how surroundings reach the genes, and why that is a reason for care, not worry.
  add("Experience and the genes", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>Experience and the genes</h1>
    <p>Every cell in your baby's body carries the same genes. What differs is which genes are speaking and which stay quiet. <b>Epigenetics</b> is the study of the small chemical marks that set this, switching genes on and off without changing the genes themselves. Think of a piano: the keys stay the same, but the music changes with how they are played.</p>
    <p>Those marks respond to the world. Nourishment, stress, calm, and care all help write them, and some are written very early, while she is still in the womb.</p>
    <div class="lab">What the research shows</div>
    <ul class="lead">
      <li><b>Care shapes stress.</b> Rat mothers who licked and groomed their pups more raised calmer offspring, through marks on a gene for a stress-hormone receptor. Pups raised by a different mother took after the one who raised them (Weaver and colleagues, 2004).</li>
      <li><b>Before birth.</b> Babies conceived during the Dutch Hunger Winter of 1944 and 1945 carried different marks on a growth gene six decades later (Heijmans and colleagues, 2008).</li>
      <li><b>A mother's mood.</b> More depressed mood in pregnancy was linked with more of these marks on the same stress-hormone receptor gene in newborns (Oberlander and colleagues, 2008).</li>
    </ul>
    <div class="box"><p><b>A careful note.</b> Much of this research is young, and many studies are small. In people it shows links, not causes, and every baby is her own.</p></div>
    ${foot(n)}`);

  add("Not destiny", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>Not destiny</h1>
    <div class="lab">Across generations</div>
    <p>When a mother carries a daughter, the eggs that may one day become her grandchildren are already forming inside that baby. For a time, three generations share one body.</p>
    <p>Rachel Yehuda found differences in marks on a stress-related gene in Holocaust survivors, and different ones in their grown children (Yehuda and colleagues, 2016). These findings are still debated, yet they echo what many families know: patterns can pass from one generation to the next.</p>
    <div class="lab">Marks can change</div>
    <p>Epigenetic marks are not fixed. In the animal studies, they could be reversed, and care, connection, and calm keep shaping them throughout life. What was passed on can be met, and something new can be passed on instead.</p>
    <ul class="lead">
      <li><b>Nourish and rest.</b> Small, steady steps count.</li>
      <li><b>Return to calm.</b> Everyday stress is buffered. It is long, unrelieved stress, without support, that matters most.</li>
      <li><b>Let yourself be held.</b> Your circle of support is part of her world.</li>
      <li><b>Repair.</b> Each return, each "I am here," is part of what she learns.</li>
      <li><b>Tend your own story.</b> Your healing is part of what you pass on.</li>
    </ul>
    <div class="box blush"><p><b>A reason for care, not worry.</b> This is not a list of things that could go wrong. It is a reminder that what you do each day reaches her, and that it is not too late to begin.</p></div>
    ${foot(n)}`);

  add("The hormones of pregnancy", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>The hormones of pregnancy</h1>
    <p>Hormones are your body's messengers. In pregnancy they shift more, and faster, than at almost any other time in life, building her body, preparing yours, and coloring how you feel.</p>
    <dl class="time hormones">
      <dt>hCG</dt><dd>Made from the first days, it is what a pregnancy test finds, and it is behind much of early nausea.</dd>
      <dt>Progesterone</dt><dd>Keeps the pregnancy steady and relaxes smooth muscle. It can bring deep tiredness, and a slower, inward calm.</dd>
      <dt>Estrogen</dt><dd>Grows the womb and its blood supply, and can heighten smell and feeling.</dd>
      <dt>Relaxin</dt><dd>Softens ligaments and joints, making room for her and for birth.</dd>
      <dt>Prolactin</dt><dd>Rises steadily to prepare your breasts for milk, and is linked with nurturing.</dd>
      <dt>Cortisol</dt><dd>Rises naturally through pregnancy and helps her lungs and organs mature. The placenta buffers much of yours; it is long, unrelieved stress that matters most.</dd>
      <dt>Oxytocin</dt><dd>The hormone of calm and closeness. Late in pregnancy your womb grows many more receptors for it, ready for labor.</dd>
    </dl>
    <div class="box blush"><p>With so much shifting, feelings can run bigger and change faster. This is your body at work, not a flaw in you.</p></div>
    ${foot(n)}`);

  add("The hormones of birth and bonding", "", n => `
    <div class="eb">Foundations · Your baby and you</div>
    <h1>The hormones of birth and bonding</h1>
    <p>Sarah Buckley describes four hormone systems that carry mother and baby through birth (Buckley, 2015).</p>
    <dl class="time hormones">
      <dt>Oxytocin</dt><dd>Brings the rhythm of contractions, and love. It peaks at birth and in the first hour, skin to skin.</dd>
      <dt>Endorphins</dt><dd>Your own pain relief, carrying you inward as labor deepens.</dd>
      <dt>Adrenaline</dt><dd>Early in labor, fear or disturbance can slow things down. At the very end, a surge gives strength for the final pushes, and makes your baby alert to meet you.</dd>
      <dt>Prolactin</dt><dd>Begins milk and mothering, and brings a quiet calm.</dd>
    </dl>
    <p>These flow best when you feel safe, warm, private, and unobserved. Your baby has birth hormones of her own too, which protect her through labor and prepare her lungs.</p>
    <div class="lab">The chemistry of connection</div>
    <p>Oxytocin is released by touch, warmth, eye contact, a loving voice, skin to skin, and breastfeeding, in both of you. Each time, the bond is laid down a little deeper. Partners change too: in fathers who care closely for their babies, oxytocin rises and testosterone falls (Gordon and colleagues, 2010; Gettler and colleagues, 2011).</p>
    <div class="box blush"><p>The "oxytocin moments" on the cards are practice for this: pleasure and closeness on purpose, so the pathway is well worn before she arrives.</p></div>
    ${foot(n)}`);

  add("The pre- and perinatal lens", "", n => `
    <div class="eb">Foundations · The lens</div>
    <h1>What is pre- and perinatal education?</h1>
    <p><em>Prenatal</em> means before birth, and <em>perinatal</em> means around birth. Pre- and perinatal education draws on pre- and perinatal psychology, the study of how experiences from conception through pregnancy, birth, and the first year shape a person's body, relationships, and sense of self.</p>
    <p>Its central idea is simple: your baby is a feeling, sensing participant in her own beginning, not a passenger. She responds to touch, sound, and your inner states long before birth, and she is learning about the world she is about to join.</p>
    <div class="lab">Where it comes from</div>
    <dl class="time">
      <dt>1924</dt><dd>Otto Rank's <i>The Trauma of Birth</i> proposes that being born leaves a lasting mark.</dd>
      <dt>1930s</dt><dd>Konrad Lorenz describes <i>imprinting</i> in young geese, the word this field later borrows.</dd>
      <dt>1960s–70s</dt><dd>Frank Lake and Stanislav Grof notice memories of womb and birth surfacing in adult therapy.</dd>
      <dt>1981–83</dt><dd>Thomas Verny publishes <i>The Secret Life of the Unborn Child</i> and founds the association that becomes APPPAH.</dd>
      <dt>1988</dt><dd>David Chamberlain's <i>Babies Remember Birth</i> gathers birth memories from children and adults.</dd>
      <dt>Since</dt><dd>Research on fetal programming, attachment, and the developing nervous system shows how early environments shape lifelong health.</dd>
    </dl>
    <p class="note">Today APPPAH, the Association for Prenatal and Perinatal Psychology and Health, trains educators and practitioners to bring this understanding to families. This guide grew out of that training.</p>
    ${foot(n)}`);

  add("Why it matters", "", n => `
    <div class="eb">Foundations · Purpose</div>
    <h1>Why it matters, for the benefit of all</h1>
    <p>Seeing pregnancy through this lens turns it from something that happens to you into a relationship you take part in. Knowing what may leave an impression lets you offer more of what nourishes, and meet hard moments with repair instead of guilt.</p>
    <ul class="lead">
      <li><b>For your baby.</b> A welcome felt from the start, a nervous system that learns calm from yours, and early experiences of being heard.</li>
      <li><b>For you.</b> Less fear and more confidence, a way to connect before you can hold her, and room for your own story to heal.</li>
      <li><b>For your partner and family.</b> A real part from the beginning: a voice she comes to know, a hand that answers her movements.</li>
      <li><b>For those who care for you.</b> A shared language for guarding the birth space and keeping mother and baby together.</li>
      <li><b>For the generations to come.</b> Patterns pass from parent to child. Each gentle beginning, and each repair, changes what is passed on.</li>
    </ul>
    <p><b>Putting it into practice.</b> Each card turns this understanding into small, daily acts: talking to her, answering her movements, settling yourself, guarding the birth space, and repairing after hard moments.</p>
    <div class="box blush"><p>This is not about getting everything right. It is about noticing, connecting, and repairing, which every family can do.</p></div>
    ${foot(n)}`);

  add("What is an imprint?", "", n => `
    <div class="eb">Foundations · Imprints</div>
    <h1>What is an imprint?</h1>
    <p>The word comes from Konrad Lorenz, who watched newly hatched goslings follow the first moving figure they saw, often Lorenz himself, and keep following. A first experience, met in a sensitive window, set a lasting pattern.</p>
    <p>In pre- and perinatal education, an imprint is an impression left by early experience: conception, life in the womb, birth, and the first hours and days. Because it comes before words, it is held as body memory, in the nervous system and in patterns of feeling and response, rather than as a story she can tell.</p>
    <p>Imprints shape her first answers to quiet questions: <em>Am I welcome? Is the world safe? When I reach out, will someone meet me?</em> Each month in this guide, and the back of each card, names a question that may begin to emerge for her then. It is not settled in that month: it stays open, and what she lives through afterward, including every repair, keeps answering it.</p>
    <div class="box">
      <h3>Three things to hold</h3>
      <p><b>Imprints can nourish.</b> Welcome, calm, touch, and being spoken to leave impressions too. Most of this guide is about offering more of these.</p>
      <p><b>An imprint is not a sentence.</b> Later relationships, repair, and healing can reshape early patterns, at any age.</p>
      <p><b>You carry imprints too.</b> Pregnancy can stir your own earliest story. That is why every card holds a practice for your own healing.</p>
    </div>
    ${foot(n)}`);

  add("Memory before words", "", n => `
    <div class="eb">Foundations · Memory</div>
    <h1>Memory before words</h1>
    <p>Memory comes in two kinds. <b>Explicit memory</b> is what we can recall and put into words: facts, events, the story of a day. <b>Implicit memory</b> is held without any sense of remembering: in the body, in emotions, in what we expect and how we react.</p>
    <p>Explicit memory depends on the hippocampus, which keeps maturing through the first years of life. This is why most of us recall little before age three or four. Implicit memory is at work much earlier, before birth.</p>
    <div class="lab">What research shows</div>
    <ul class="lead">
      <li>Newborns prefer their mother's voice to other voices, a voice they came to know through the womb wall (DeCasper and Fifer, 1980).</li>
      <li>Babies whose mothers read one story aloud in the last weeks of pregnancy preferred that story after birth (DeCasper and Spence, 1986).</li>
      <li>Flavors from a mother's meals reach the amniotic fluid. Babies who tasted carrot this way later took to carrot-flavored cereal more readily (Mennella and colleagues, 2001).</li>
    </ul>
    <p>She is learning before she can remember. Her early experiences are not lost: they are carried as implicit patterns of feeling and response (Siegel).</p>
    <div class="box blush"><p><b>Why this guide says "may."</b> The imprints on these pages are possible, not certain. Every baby meets her experiences with her own temperament, and the people around her shape what those experiences come to mean.</p></div>
    ${foot(n)}`);

  add("Trauma and resilience", "", n => `
    <div class="eb">Foundations · Trauma and resilience</div>
    <h1>Trauma and resilience</h1>
    <p>In this lens, trauma is defined less by the event than by what happens inside: an experience that is too much, too fast, or too soon, with too little support to meet it (Levine). The nervous system stays braced, as though the danger has not passed.</p>
    <p>Not every hard experience becomes trauma. Researchers describe a range of stress: <b>positive</b> stress, brief and manageable; <b>tolerable</b> stress, buffered by caring relationships; and <b>toxic</b> stress, long, intense, and unbuffered (Center on the Developing Child, Harvard).</p>
    <div class="lab">Resilience</div>
    <p>Resilience is the capacity to meet difficulty and find the way back to balance. It is not a fixed trait. It grows through relationship: being soothed, being understood, and knowing repair after rupture.</p>
    <p>For your baby, resilience begins with co-regulation: her young nervous system borrows steadiness from yours. For you, it grows through support, rest, and tools you can reach for in the moment. Each return to calm is practice, for both of you, in the way back.</p>
    <p>The pages that follow give you a map for this: your nervous system, and your window of tolerance.</p>
    <div class="box blush"><p>Each "Imprints and what helps" section holds both sides: what may be hard, and what builds resilience.</p></div>
    ${foot(n)}`);

  add("Your nervous system", "", n => `
    <div class="eb">Foundations · The nervous system</div>
    <h1>Your nervous system: an introduction to polyvagal theory</h1>
    <p>Polyvagal theory, introduced by Stephen Porges in 1994, describes how the autonomic nervous system responds to safety and danger. It offers a simple map of three states.</p>
    <div class="parts">
      <div><span class="dot" style="background:#F6C9BE"></span><h3>Safe and connected</h3><p>Breath is easy, face and voice soften, and you can rest, play, and bond. Oxytocin flows most freely here, in pregnancy and in labor.</p></div>
      <div><span class="dot" style="background:#EE8A73"></span><h3>Mobilized</h3><p>Heart and breath quicken, ready to fight or flee. Helpful in bursts, tiring when it lingers.</p></div>
      <div><span class="dot" style="background:#9A4434"></span><h3>Shut down</h3><p>When danger feels overwhelming, the body may conserve: numbness, collapse, feeling far away.</p></div>
    </div>
    <p>Porges calls the body's constant, wordless scanning for safety <i>neuroception</i>. Your baby senses your state through your heartbeat, breath, voice, and chemistry, and her system begins to tune to yours.</p>
    <p>Trauma can leave a nervous system stuck in mobilized or shut-down states. Resilience is the flexibility to move through them and find the way back to safety.</p>
    <p class="note">Polyvagal theory is widely used by therapists and educators, and some of its physiological details are still debated by researchers. Its map of states is offered here as a practical guide.</p>
    ${foot(n)}`);

  add("Your window of tolerance", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>Your window of tolerance</h1>
    <p>Daniel Siegel describes a <i>window of tolerance</i>, which some call a window of capacity: the range in which you can feel strong feelings and still think, connect, and respond. Everyone has one, and it widens and narrows with sleep, support, hormones, and stress.</p>
    ${windowGraph()}
    <div class="parts">
      <div><span class="dot" style="background:#EE8A73"></span><h3>Above the window</h3><p>A racing heart, a tight chest, panic, irritability, a mind that will not settle. This is the mobilized state.</p></div>
      <div><span class="dot" style="background:#F6C9BE"></span><h3>Inside the window</h3><p>Present, able to feel and to think. You can notice your baby, and respond rather than react.</p></div>
      <div><span class="dot" style="background:#9A4434"></span><h3>Below the window</h3><p>Numb, foggy, flat, far away, wanting to shut down. This is the shut-down state.</p></div>
    </div>
    <p>Pregnancy can narrow the window: tiredness, nausea, shifting hormones, and old memories stirring. This is not a failing. It is a signal to resource.</p>
    ${foot(n)}`);

  add("Widening your window", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>Widening your window</h1>
    <ul class="lead">
      <li><b>Notice where you are.</b> A few times a day, ask: am I above, inside, or below my window right now? Naming it already helps.</li>
      <li><b>If you are above it,</b> slow the out-breath, feel your feet, let your eyes rest on something pleasant, lower the noise and light, and move gently.</li>
      <li><b>If you are below it,</b> move a little, splash cool water on your face, sit upright, hold something warm, reach for a familiar voice, and name five things you can see.</li>
      <li><b>Over time,</b> sleep, nourishment, people who feel safe, the practices on the cards, and therapy if old pain keeps the window narrow.</li>
    </ul>
    <div class="lab">Her window grows inside yours</div>
    <p>A baby cannot yet calm herself. She borrows steadiness from you, first through your body, later through your arms and voice. This is called co-regulation. Each time you find your way back into your window, you are showing her the way.</p>
    <div class="box blush"><p>In labor, a wide window lets you stay present through great intensity. The practices you build now are preparation for then.</p></div>
    ${foot(n)}`);

  add("Feelings", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>Feelings: emotional intelligence in pregnancy</h1>
    <p>Emotional intelligence is the ability to notice, name, and work with feelings, your own and other people's. In pregnancy it becomes a gift to two people at once.</p>
    <div class="lab">Feelings are information</div>
    <p>Joy, fear, grief, anger, and ambivalence each have something to tell you. They are not verdicts on you as a mother.</p>
    <div class="lab">Name it to tame it</div>
    <p>Daniel Siegel's phrase for a simple finding: putting a feeling into words can calm the brain's alarm (Lieberman and colleagues, 2007). "I feel scared" is already a step toward steadiness.</p>
    <div class="lab">Mixed feelings are normal</div>
    <p>Many parents feel two things at once: wanting this baby and grieving the life before, love and fear, excitement and dread. Both can be true.</p>
    ${foot(n)}`);

  add("Your feelings, and hers", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>Your feelings, and hers</h1>
    <p>Your baby feels what you feel, through your body, but she cannot yet tell whose feeling it is. Pre- and perinatal practice offers a simple way to help: tell her.</p>
    <ul class="lead">
      <li>"I am angry right now, and it is not about you."</li>
      <li>"I am sad today. You did nothing wrong."</li>
      <li>"That was a hard moment. I am back now, and I am glad you are here."</li>
    </ul>
    <p>This begins what Karen Strange calls healthy separateness: she can be with your feeling without carrying it as her own.</p>
    <div class="box"><p><b>When feelings are big.</b> If sadness, worry, or numbness last two weeks or more, or you have thoughts of harming yourself, reach out. Depression and anxiety in pregnancy are common and treatable, and page ${no("Help, reading, and sources")} lists where to turn.</p></div>
    ${foot(n)}`);

  // The parent's own healing: what may rise in pregnancy, and why it is a
  // time of opening. A facing pair, with where to turn for more.
  add("Your own healing", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>Your own healing</h1>
    <p>Carrying a child often brings your own beginning closer. As you prepare to meet her, parts of your own story may rise to meet you.</p>
    <div class="lab">What may come up</div>
    <ul class="lead">
      <li>Your own birth, and what you know or sense about it.</li>
      <li>Your mother, your childhood, and the ways you were cared for, or were not.</li>
      <li>Earlier pregnancies, losses, or births, including one you may be looking back on now.</li>
      <li>Old fears, griefs, or patterns in your relationships, sometimes felt first in the body.</li>
    </ul>
    <p>None of this means something is wrong. It is a natural part of becoming a parent, and often a sign that something is ready to be met.</p>
    <div class="lab">How the healing practices help</div>
    <p>The back of every card holds a practice for your own healing: reflecting on your own beginning, telling your story, meeting your younger self with kindness, and offering yourself the repair you are learning to offer her. What is felt and soothed in you is less likely to be passed on.</p>
    ${foot(n)}`);

  add("A time for transformation", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>A time for transformation</h1>
    <p>Pregnancy is a time of deep change. Your hormones, body, sleep, relationships, and sense of who you are all shift at once. Anthropologist Dana Raphael named this passage <i>matrescence</i>: the becoming of a mother, as profound as adolescence.</p>
    <p>The brain changes too. Imaging studies show that pregnancy reshapes areas involved in understanding others, changes that last for years (Hoekzema and colleagues, 2017). Many in this field see this openness as a rare window, a time when old patterns are more able to shift.</p>
    <p>So what rises now can be met as an opportunity. Healing in pregnancy is not only for you. It changes the world your baby grows in, and what is passed on.</p>
    <div class="lab">If you need more support</div>
    <ul class="lead">
      <li><b>People who can walk with you,</b> page ${no("People who can walk with you")}: practitioners and approaches that work with early experience.</li>
      <li><b>My circles of support,</b> page ${no("My circles of support")}: a place to keep their names and numbers.</li>
      <li><b>Memories that return,</b> page ${no("Memories that return")}: how early memory can surface, and how it may be held.</li>
      <li><b>Help, reading, and sources,</b> page ${no("Help, reading, and sources")}: if you need support now.</li>
    </ul>
    ${foot(n)}`);

  add("Resourcing yourself", "", n => `
    <div class="eb">Foundations · Resourcing</div>
    <h1>Resourcing yourself in the moment</h1>
    <p>A resource is anything that helps your nervous system feel a little steadier: a person, a place, a memory, a sensation in your body, something you can hold. Resourcing is turning toward these on purpose.</p>
    <p>Knowing your nervous system widens your awareness. When you can notice "I am speeding up" or "I am drifting away," you have a choice, and the noticing itself is a step back toward presence, through pregnancy, labor, and the first hours.</p>
    <div class="lab">Tools for the moment</div>
    <ul class="lead">
      <li><b>Orient.</b> Let your eyes move slowly around the room and rest on something pleasant.</li>
      <li><b>Ground.</b> Feel your feet on the floor, or your weight held by the chair.</li>
      <li><b>Lengthen the out-breath.</b> Breathe in, then let the breath out a little longer.</li>
      <li><b>Touch.</b> A hand on your heart or your belly, for you and for her.</li>
      <li><b>Hum or sing.</b> Gentle sound on a long exhale can help your system settle.</li>
      <li><b>Reach out.</b> A familiar voice or a hand to hold is among the strongest resources there are.</li>
    </ul>
    <div class="box blush"><p>The back of each card holds practices with time set aside to connect: with your baby, with your partner, and with yourself. Return to them whenever you need resourcing.</p></div>
    ${foot(n)}`);

  add("A daily check-in", "", n => `
    <div class="eb">Foundations · Your inner world</div>
    <h1>A daily check-in</h1>
    <p>A few minutes, once or twice a day, ties everything in this book together. It is the bridge to the cards.</p>
    <ol class="steps">
      <li><b>Pause.</b> Stop where you are, and feel your feet or your seat.</li>
      <li><b>Breathe.</b> A few slow breaths, with the out-breath a little longer.</li>
      <li><b>Notice yourself.</b> Where am I in my window? What am I feeling? Name it.</li>
      <li><b>Turn toward her.</b> A hand on your belly. Notice her: movement, stillness, the weight of her.</li>
      <li><b>Speak.</b> Good morning, what the day holds, what you feel and whose it is.</li>
      <li><b>Listen.</b> Pause, and notice what comes: a movement, a sense, a feeling.</li>
    </ol>
    <div class="box blush"><p>Then turn to your card, and choose one practice for the day.</p></div>
    ${foot(n)}`);

  // Speaking to her: a facing pair, so the question and the evidence are
  // read together, before the cards themselves begin.
  add("Speaking to your baby", "", n => `
    <div class="eb">Connecting with her · Speaking to her</div>
    <h1>Why speak to a baby who has no words?</h1>
    <p>Many practices on the cards ask you to talk to your baby: to tell her what is happening, what you feel, and what you hope. It can feel odd at first. She cannot understand words yet. So what reaches her?</p>
    <div class="lab">What reaches her</div>
    <ul class="lead">
      <li><b>Your voice.</b> From mid-pregnancy she hears, and your voice, carried through your own body, is the loudest and clearest in her world.</li>
      <li><b>Rhythm and warmth.</b> Long before meaning, she takes in the music of speech: its pace, its tone, its rise and fall.</li>
      <li><b>Your body.</b> When you speak tenderly, your breath slows, your heart steadies, and your muscles soften. She lives inside these changes.</li>
      <li><b>Your chemistry.</b> Warmth and connection bring oxytocin, the hormone of calm and closeness, and ease the stress hormones that matter most when they linger.</li>
    </ul>
    <p>In pre- and perinatal education, words are understood as carriers of your attention, your intention, and your feeling. She may not know what "you are safe" means. She can feel what it is like when you mean it.</p>
    <div class="box"><p><b>For partners.</b> Your voice reaches her too, from just outside the womb. Babies come to know the voices they hear often, so a partner who speaks to her before birth is already familiar when she arrives.</p></div>
    ${foot(n)}`);

  add("She is listening", "", n => `
    <div class="eb">Connecting with her · Speaking to her</div>
    <h1>She is listening</h1>
    <div class="lab">What research shows</div>
    <ul class="lead">
      <li>Before birth, babies' heart rates quicken to a recording of their mother's voice, and slow to a stranger's (Kisilevsky and colleagues, 2003).</li>
      <li>Newborns prefer their mother's voice, and a story read aloud to them in the womb (DeCasper and Fifer, 1980; DeCasper and Spence, 1986).</li>
      <li>Newborns' cries already carry the melody of the language spoken around them (Mampe and colleagues, 2009), and they recognize sounds heard often before birth (Partanen and colleagues, 2013).</li>
      <li>Mothers who sang lullabies through pregnancy and after birth reported a stronger bond, and their newborns cried less (Persico and colleagues, 2017).</li>
    </ul>
    <p>There is an intelligence in her that we cannot fully grasp, and research cannot yet say how much of your meaning she receives. What we can see is what it brings: she listens, comes to know your voice, and responds, and speaking to her changes you as well.</p>
    <p>That is where its importance lies. Each time you speak to her, the relationship grows. She is seen, she is heard, she is accounted for, and the connection you build becomes a resource you can both return to.</p>
    <div class="lab">How to begin</div>
    <p>Start small: good morning, her name, a hand on your belly. Tell her what you are about to do. Name what you feel: "I am worried today, and it is not about you." Invite your partner to speak to her too. Then pause, and notice. She may answer with a move.</p>
    <div class="box blush"><p>Each card offers words you can say to her. Take them as a starting place, and make them your own.</p></div>
    ${foot(n)}`);

  add("Your part in this", "", n => `
    <div class="eb">Connecting with her</div>
    <h1>Your part in this</h1>
    <p>This knowledge is not meant to add worry. It is meant to give you back your part. Much of pregnancy is beyond anyone's control. Your part is the relationship, and the choices that shape it.</p>
    <ul class="lead">
      <li><b>Connection.</b> You can turn toward her every day, in small ways.</li>
      <li><b>Awareness.</b> You can notice your own states, and find your way back to steadiness.</li>
      <li><b>Choice.</b> You can ask questions, choose your care and your support, and give or withhold consent.</li>
      <li><b>Voice.</b> You can speak to her, and speak up for her and for yourself.</li>
      <li><b>Repair.</b> When hard moments come, you can return, name what happened, and reconnect.</li>
    </ul>
    <div class="box blush"><p><b>It is not too late.</b> Whatever has already happened in this pregnancy, or in your own beginning, connection and repair can begin today. This is not about perfection. It is about presence.</p></div>
    ${foot(n)}`);

  add("For partners", "", n => `
    <div class="eb">Connecting with her</div>
    <h1>For partners</h1>
    <p>Your baby is getting to know you too. A partner's voice, touch, and steadiness reach her, and your support shapes the mother's world, which is her world.</p>
    <ul class="lead">
      <li><b>Speak and sing to her.</b> A voice heard often before birth is familiar after it.</li>
      <li><b>Answer her movements.</b> A hand on the belly when she kicks, and a word in reply.</li>
      <li><b>Steady the mother.</b> Your calm helps widen her window. Take on what you can, listen without fixing, and protect her rest.</li>
      <li><b>Be part of the decisions.</b> Learn the choices ahead, and help speak up for what she wants.</li>
      <li><b>Meet your own story.</b> Becoming a parent can stir your own beginning too. The healing practices are for you as well.</li>
    </ul>
    <div class="box"><p>Partners have their own feelings in pregnancy, including worry, distance, or a sense of being on the outside. Naming them, and finding support, is part of the work.</p></div>
    ${foot(n)}`);

  // Layers of support, after Ray Castellino: the baby held by the mother,
  // the mother held by her circle, and the circle held too, out to a wider circle.
  const layers = () => `<figure class="layers"><svg viewBox="-140 -140 280 280" role="img" aria-label="Nested circles: a wider circle of family, friends, and the care team holds the doula, the doula holds the partner, the partner holds the mother, the mother holds the baby">
      <g stroke="#FBF3F1" stroke-width="5"><circle r="138" fill="#E35F43"/><circle r="110" fill="#EE866F"/><circle r="81" fill="#F5A882"/><circle r="53" fill="#FCA59B"/><circle r="26" fill="#FFD3C8"/></g>
      <text y="-124" fill="#FFFFFF">Wider circle</text><text y="-95.5" fill="#FFFFFF">Doula</text><text y="-67">Partner</text><text y="-39.5">Mother</text><text y="1">Baby</text></svg>
      <figcaption>In labor, for example: you hold your baby, your partner holds you, the doula holds your partner, and a wider circle of family, friends, and your care team holds you all. Your baby has two layers, you and your partner; you have two, your partner and the doula; and your partner has two, the doula and the wider circle. The doula is held too, by a backup and peers of their own.</figcaption></figure>`;
  add("Layers of support", "", n => `
    <div class="eb">Connecting with her · Your circle</div>
    <h1>Layers of support</h1>
    <p>Ray Castellino, a pioneer of prenatal and birth therapy, taught that everyone who gives support needs support too. You hold your baby. The people around you hold you. And they need holding as well.</p>
    <p>He found that the mother and the baby each do best with at least two layers of support around them. Your baby's first layer is you, and her second is whoever holds you.</p>
    ${layers()}
    <div class="lab">What support can look like</div>
    <p>Rest and meals, company at appointments, a listening ear that does not rush to fix, help at home, and someone who stays through the birth. It can come from a partner, family, friends, a doula, a midwife or doctor, or an educator.</p>
    <div class="box blush"><p><b>Asking is part of it.</b> Many people find it hard to ask for help. Each small ask makes the next one easier. Page ${no("My circles of support")} is a place to write down who is in yours.</p></div>
    ${foot(n)}`);

  add("Your circle, month by month", "dense", n => `
    <div class="eb">Connecting with her · Your circle</div>
    <h1>Your circle, month by month</h1>
    <p class="muted">For each month, one way the people around you can hold you both, with your baby at the center.</p>
    <dl class="repair">${CIRCLE.map((words, k) => `<dt><span>${MONTHS[k][1].split(" · ")[0]}</span></dt><dd>${words}</dd>`).join("")}</dl>
    ${foot(n)}`);

  add("How each month is read", "", n => `
    <div class="eb">Understanding the cards · Reading a month</div>
    <h1>How each month is read</h1>
    <p>Every month in this guide follows the same pattern, moving from the center of the mandala outward.</p>
    <div class="parts">
      <div><span class="dot" style="background:#FFD5CC;border:1px solid #F4B9AD"></span><h3>Your baby</h3><p>Her growth, and what she may be sensing and taking in. Read it as a description of someone, not something.</p></div>
      <div><span class="dot" style="background:#FCA59B"></span><h3>You</h3><p>Your body, hormones, and feelings. Your inner states are her first environment, so caring for yourself is caring for her.</p></div>
      <div><span class="dot" style="background:#F5A882"></span><h3>Your circle</h3><p>How the people around you can support you, so you can support her. Each of you needs at least two layers of support.</p></div>
      <div><span class="dot" style="background:#EE8A73"></span><h3>Imprints and what helps</h3><p>What the month's experiences may leave as an impression, what tends to help, and then the question that may begin to emerge for her. These are possibilities to notice, not predictions.</p></div>
      <div><span class="dot" style="background:#E35F43"></span><h3>To explore further</h3><p>The teachers and research behind the month, for when you want to read more deeply.</p></div>
    </div>
    <p>The back of each card carries the outer petals: practices for connecting with your baby, and one for your own healing.</p>
    <div class="box blush"><p><b>Three questions to carry.</b> What might she be experiencing? What am I experiencing? What would help us both?</p></div>
    ${foot(n)}`);

  // A card, front and back, with numbered markers: what each part holds.
  const mark = (k, x, y) => `<span class="mk" style="left:${x}%;top:${y}%">${k}</span>`;
  add("Your card, front and back", "", n => `
    <div class="eb">Understanding the cards</div>
    <h1>Your card, front and back</h1>
    <div class="anat">
      <figure>${mark(1, 2, 3)}${mark(2, 72, 3)}${mark(3, 2, 22)}${mark(4, 2, 35)}${mark(5, 2, 48)}${mark(6, 2, 61)}<img src="img/t/c01.jpg${CARD_V}" alt="The front of card 1"><figcaption>Front</figcaption></figure>
      <figure>${mark(7, 2, 10)}${mark(8, 2, 51)}${mark(9, 2, 80)}${mark(10, 2, 92)}<img src="img/c02.jpg${CARD_V}" alt="The back of card 1"><figcaption>Back</figcaption></figure>
    </div>
    <ol class="anat-key">
      <li>The month, and where it falls in the weeks of pregnancy.</li>
      <li>The small wheel: where this card sits on the mandala.</li>
      <li><b>Your baby:</b> her growth, and what she may be sensing.</li>
      <li><b>You:</b> your body, hormones, and feelings.</li>
      <li><b>Your circle:</b> how the people around you can hold you both.</li>
      <li><b>Good to know:</b> her world, the possible imprints, and a note for you.</li>
      <li><b>Practices</b> for connecting with her, with steps to follow.</li>
      <li><b>For your own healing:</b> a practice for your own story.</li>
      <li><b>Baby's question:</b> a question that may begin to emerge for her, and why.</li>
      <li>The teachers and research behind the card.</li>
    </ol>
    ${foot(n)}`);

  add("The heart of the practices", "", n => `
    <div class="eb">Understanding the cards · The practices</div>
    <h1>Seven threads behind every card</h1>
    <p>Most practices on the cards grow from Karen Strange's <i>Simple Tools for Mothers</i>. Knowing the threads behind them helps you make the practices your own.</p>
    <ol class="steps tight">
      <li><b>You are her regulator.</b> She forms around what you feel and experience. When you settle, she learns how settling feels.</li>
      <li><b>Slow down.</b> Grounding brings you into your body; pacing matches her slower rhythm. Her brain waves are six to ten times slower than yours.</li>
      <li><b>Talk to her, and listen.</b> Tell her what you will do before you do it, tell her what is going on, tell her what you would like, and tell her the story of what happened.</li>
      <li><b>Your feelings are yours.</b> She feels what you feel. Telling her "this is about me, not you" begins healthy separateness.</li>
      <li><b>Oxytocin moments.</b> Pleasure on purpose wires her system to move from stress back to calm, and gives you a groove to return to.</li>
      <li><b>Rupture and repair.</b> Hard moments come into every relationship. Returning, naming what happened, and reconnecting builds deeper trust.</li>
      <li><b>Someone for her, too.</b> A "baby doula" follows your baby's journey through birth, the way a doula supports you.</li>
    </ol>
    <blockquote>It is not just what you do or say that matters, but how you are on the inside.<cite>Karen Strange</cite></blockquote>
    ${foot(n)}`);

  add("Using the cards", "", n => `
    <div class="eb">Understanding the cards</div>
    <h1>One card at a time</h1>
    <ol class="steps">
      <li><b>Find your card.</b> Choose the card for the month you are in. The small wheel in its corner shows where it sits on the mandala.</li>
      <li><b>Read the front.</b> It holds a short picture of your baby, of you, of your circle of support, and of what is good to know this month.</li>
      <li><b>Turn it over.</b> The back holds practices for connecting with your baby, with steps to follow, and one practice for your own healing.</li>
      <li><b>Keep it close.</b> Set the card where you will see it: by your bed, on the fridge, in your bag. Return to its practices through the month.</li>
      <li><b>Look ahead.</b> Read the next card a little before its month begins. Read the three birth cards early in the third trimester, so you have time to practice.</li>
    </ol>
    <div class="box">
      <h3>A few gentle notes</h3>
      <p><b>Share them.</b> Many practices are for partners, too. Read the cards together.</p>
      <p><b>Go at your pace.</b> Skip a practice that does not feel right. Return to it later, or not at all.</p>
      <p><b>Write it down.</b> A small journal beside the deck can hold what you notice and what surfaces.</p>
      <p><b>Ask for help.</b> If a practice stirs more than you can hold, page ${no("People who can walk with you")} lists people who can help.</p>
    </div>
    ${foot(n)}`);

  // Every practice is also a way back: rupture and repair, then each card's
  // practice turned toward repair. Read before the cards begin.
  add("Every practice is a way back", "", n => `
    <div class="eb">Understanding the cards · Repair</div>
    <h1>Every practice is a way back</h1>
    <p>The practices on the cards help grow good imprints: welcome, safety, being met. They are also something more. If a hard moment has already happened, the same practices become a way back. It is not too late, and repair can begin today.</p>
    <div class="lab">Rupture and repair</div>
    <p>A rupture is a break in connection: a fright, a loud argument, a hard day, a birth that changed course. Ruptures come into every relationship. Research with mothers and babies finds that most everyday moments between them are small mismatches, and that it is the repairing, not perfection, that builds trust and resilience (Tronick and Gianino, 1986).</p>
    <div class="lab">The steps of repair</div>
    <ol class="steps tight">
      <li><b>Settle yourself.</b> Ground, and breathe.</li>
      <li><b>Name what happened,</b> simply: "That was loud." "That was sudden."</li>
      <li><b>Say whose it was:</b> "It was not about you." "It was not your fault."</li>
      <li><b>Reconnect:</b> your hand, your voice, your song.</li>
      <li><b>Answer the baby's question again,</b> with a yes: "You are welcome. You are safe. I am here."</li>
    </ol>
    ${foot(n)}`);

  add("Repair, month by month", "dense", n => `
    <div class="eb">Understanding the cards · Repair</div>
    <h1>Repair, month by month</h1>
    <dl class="repair">${REPAIR.map(([pr, words], k) => `<dt><span>${MONTHS[k][1]}</span>${pr}</dt><dd>${words}</dd>`).join("")}</dl>
    ${foot(n)}`);

  /* ---- the four parts and twelve months ---- */
  const PARTS = [
    { eb: "The first trimester · Weeks 1–13", t: "The First<br>Trimester", sub: "Beginnings", seg: [0, 3],
      lede: "Life is often present before anyone knows it. These first weeks are full of rapid building, and of big feelings as the news arrives.",
      baby: "From a cluster of cells to a moving fetus. Her heart begins to beat, every major organ begins, and the placenta takes root.",
      you: "Hormones rise quickly, bringing fatigue, nausea, and tenderness. The news can bring joy, fear, and old feelings to the surface.",
      lens: "She is present before anyone knows she is there. How she is welcomed, in thought, word, and feeling, is among the first things she takes in.",
      focus: "Welcome her, find one way to settle yourself, and gather the people who will support you.",
      circle: "Let the people close to you ease your load, welcome her with you, and keep you company through the first visits.",
      when: "As early as you can, even before you feel ready." },
    { eb: "The second trimester · Weeks 14–27", t: "The Second<br>Trimester", sub: "The Middle", seg: [3, 6],
      lede: "Your baby begins to hear, you begin to feel her, and the relationship becomes something you can both sense.",
      baby: "Her movements grow coordinated, hearing begins around weeks 18 to 20, and she begins to respond to voices, touch, and sound.",
      you: "Energy often returns and your belly shows. Feeling her move can turn an idea into a relationship, and your thoughts begin to turn toward birth.",
      lens: "Her senses are opening, and relationship now runs both ways. When her movements and sounds are met, she learns she is heard.",
      focus: "Talk, sing, and answer her movements. Choose the stories you take in, and begin exploring your own birth story.",
      circle: "Invite others to notice her with you, let more loving voices reach her, and ask for the rest you need.",
      when: "Around weeks 10 to 13, just before this trimester begins." },
    { eb: "The third trimester · Weeks 28–40", t: "The Third<br>Trimester", sub: "The Ripening", seg: [6, 9],
      lede: "Your baby grows, space grows tight, and both of your bodies prepare for birth.",
      baby: "Her eyes open, dreaming sleep appears, and she comes to know your voice. Many babies settle head down, and her own lungs may help signal when labor begins.",
      you: "Sleep grows harder and practice contractions stronger. Anticipation grows, and so can fear. Choices about position, monitoring, and induction may arise.",
      lens: "She is preparing for birth alongside you. How choices are made, and the feeling in the room, may become part of how she arrives.",
      focus: "Slow down, plan your birth space and support, practice staying in the decisions, and prepare for flexibility, not fear.",
      circle: "Gather people who hear your fears without adding to them, plan help for after the birth, and let someone share the waiting.",
      when: "Around weeks 24 to 27, just before this trimester begins." },
    { eb: "Birth · Labor, birth, first hour", t: "Birth", sub: "The Threshold", seg: [9, 12],
      lede: "Hormones, the space, and the people present all shape how your baby arrives and how she is met.",
      baby: "Labor holds her in rhythm and pressure. Birth brings light, air, and sound all at once. The first hour brings your skin, your smell, and your voice.",
      you: "Oxytocin, endorphins, adrenaline, and prolactin carry you through, and they flow best when you feel safe, private, and unobserved.",
      lens: "Birth is her first great passage and her first welcome. Even when plans change, telling her what is happening and holding her close can soften what she meets.",
      focus: "Guard the space, tell her what is happening, and keep her close. If plans change, stay in the decisions and offer repair.",
      circle: "Someone who stays the whole way, a familiar voice for you and for her, and a quiet, protected golden hour.",
      when: "Early in the third trimester, around weeks 28 to 34, so you have time to practice and plan before the birth window opens at 37 weeks." }];

  const MONTHS = [
    ["Card 1 · First trimester · Weeks 1–4", "Month 1 · The Beginning",
      "Pregnancy is counted from the first day of your last period, so conception happens around week 2. About a week later, the tiny ball of cells settles into the lining of your womb, and the cells that will become the placenta begin reaching toward your blood supply. In the pre- and perinatal view, her experience begins here, often before anyone knows she is there.",
      "Hormones begin shifting at implantation. A missed period around week 4 is often the first sign, and some mothers notice fatigue, tender breasts, or light spotting. Life goes on as usual until the news arrives, and when it does, feelings can come all at once.",
      "The circumstances of conception, and whether she was hoped for, may become part of her earliest story. That story can be met without judgment. The most helpful foundation is simple: one way to settle yourself, such as grounding, and a circle of people you can turn to. If you have known loss or a long road to conceive, hope and fear can arrive together, and both are welcome.",
      "David Chamberlain describes the prenate as a conscious, sentient being, and gathered memories of the womb and birth shared by young children and adults. Ask yourself how you might welcome your baby as someone, not something, from the very start."],
    ["Card 2 · First trimester · Weeks 5–8", "Month 2 · The Discovery",
      "Her heart begins to beat around week 6. The neural tube, the start of her brain and spinal cord, closes, and arm and leg buds appear. By week 8 every major organ system has begun, and the first touch receptors form around her mouth. She is already taking in how she is received.",
      "Pregnancy hormones climb steeply, and nausea, deep fatigue, and a sharper sense of smell often peak now. Blood volume begins to rise. For many this is the month of discovery. Joy, shock, fear, and ambivalence can arrive together, and pregnancy may bring you closer to your own childhood, letting old feelings rise.",
      "How the news was first received may stay with her. In one study, mothers' first reactions matched feelings their grown children later recalled. Conflict with partners or parents can reach her too. What helps is a welcoming response from the people around you, and, if the news was hard, simple repair words spoken to her. Waiting for first scans is full of uncertainty. Hard feelings are natural and need no guilt.",
      "Your baby senses your emotions through your body's chemistry, and later through your heartbeat, breath, and voice. Everyday stress is buffered by the placenta. It is long, unrelieved stress that matters most, and each return to calm helps (Ham and Klimo; Raffai)."],
    ["Card 3 · First trimester · Weeks 9–13", "Month 3 · Taking Root",
      "Now called a fetus, she moves, stretches, hiccups, and swallows amniotic fluid long before you can feel it. Sensitivity to touch spreads from her face across more of her body. Some of your chemistry, including stress hormones, reaches her through the placenta.",
      "Nausea often eases near the end of this month as the placenta takes over hormone production, and your uterus begins to rise out of the pelvis. First prenatal visits and screenings usually happen now, and many families wait until now to share the news. Old feelings from childhood can surface in this window.",
      "Your own unresolved history, and the chemistry of your states, can reach her. What helps is a safe, trauma-informed space where you can share your story if you choose, and support when it feels big. How you nourish and rest yourself shapes her lifelong health, and small, steady steps count. It is also a good time to begin looking for a doula, since many book months ahead. Worry while waiting for screening results is natural, not a failure of trust.",
      "Fetal programming, the idea that conditions in the womb shape lifelong health (Nathanielsz). The three models of care, technocratic, humanistic, and holistic (Davis-Floyd), and the Mother-Friendly Childbirth Initiative, to help you choose the care that fits you."],
    ["Card 4 · Second trimester · Weeks 14–17", "Month 4 · The First Flutters",
      "Her movements grow smoother and more coordinated, and she makes facial expressions. Her inner ear and taste buds are taking shape. Her movements meet the walls of the womb, and soon they will meet your hand.",
      "Energy often returns, and your belly begins to show. The placenta now makes most of the hormones of pregnancy. Some mothers, especially those who have been pregnant before, feel the first flutters. Relief and steadiness are common, and your sense of yourself begins to shift toward motherhood.",
      "Whether her movements are noticed and met may be one of her earliest lessons in relationship. Simple connection practices, for you and your partner, help, and a bonding program such as Pregnancy Dialogues can deepen them. As your pregnancy shows, others may share birth stories, many of them fearful. You can choose what you take in, set kind boundaries, and gather stories of births that went well.",
      "Prenatal attachment, which grows as you turn your attention toward your baby. Karen Strange teaches that a baby's movements are her way of telling her story, and asks: can you slow down and be present to hear what she is saying?"],
    ["Card 5 · Second trimester · Weeks 18–22", "Month 5 · The First Sounds",
      "Hearing begins. The first sounds reach her around weeks 18 to 20, and her hearing keeps sharpening through about week 25. Fine hair and a protective coating of vernix cover her skin, and sleep and wake cycles appear. Voices, music, laughter, and raised voices reach her as vibration through the womb wall.",
      "Most mothers now feel movement. Relaxin softens the ligaments, and round ligament aches are common. The anatomy scan usually happens around week 20. Feeling her move can turn an idea into a relationship, and your partner can join in: a hand on the belly when she moves, a word or a song in answer.",
      "The sound world of your home may stay with her. In one study, grown children recalled music, laughter, and yelling their mothers also remembered. What helps is time to talk, sing, and play with her, and repair after loud or tense moments. If the anatomy scan brings unexpected news, you can ask what a result means, learn the options, and take time before deciding. Fear or grief is a natural response.",
      "Your voice, carried through your own body, is the loudest and clearest sound she hears. Ham and Klimo describe a father whose \"hoo, hoo\" game from the fifth month led his newborn to stop nursing and turn toward his voice."],
    ["Card 6 · Second trimester · Weeks 23–27", "Month 6 · The Rhythm",
      "She begins to respond to sound, often moving or startling at a sudden loud noise. Her lungs begin making surfactant and her brain grows quickly. Her sleep is not yet divided into stages: she moves through loose cycles of rest and activity, and her brain waves are six to ten times slower than an adult's.",
      "Your belly grows quickly. Back aches, heartburn, and swelling may begin, and a glucose screening is usually offered between weeks 24 and 28. Your thoughts may begin turning toward the birth, and your own birth story, and your mother's, may come to mind.",
      "The emotional climate over time matters most: ongoing tension or neglect, or warmth and contact. What helps is a steady rhythm of calm, a childbirth class that fits you, the doula you have found or are still seeking, and the rest you need, asked for in plain words. If the screening leads to a diagnosis such as gestational diabetes, it is information to guide your care, not a judgment on your body. Disappointment is natural, and it can sit beside caring well for yourself.",
      "William Emerson's \"elephant in the birthing room\": everyone brings a birth story into the birth room. Oxytocin, the hormone of calm and connection, is easier to find in labor when it has been practiced in pregnancy (Strange)."],
    ["Card 7 · Third trimester · Weeks 28–31", "Month 7 · Light and Voices",
      "Her eyes open and can sense light through your belly. She is gaining fat, practicing breathing, and moving between clear sleep states. REM sleep appears now, the active sleep linked with dreaming, and she spends much of each day in it. The voices she hears most will be familiar after birth.",
      "Your blood volume is rising toward nearly half again its usual amount, and she crowds your lungs and stomach. Sleep grows harder, breath shorter, and practice contractions more noticeable, and visits move to every two weeks. Anticipation grows, and so can fear of birth.",
      "Fear in the room can become part of the birth: your own, your family's, or a provider's past cases. What helps is planning your birth space and choosing who will speak up for you; a doula can be a strong advocate at a hospital birth. It also helps to begin preparing for flexibility, not fear. Exploring other paths, such as a longer labor, an induction, or a cesarean, lets you meet a change as a choice rather than a collapse of the plan.",
      "Sarah Buckley's four hormone systems of birth: oxytocin for contractions and love, endorphins for easing pain, adrenaline for the final pushes, and prolactin for mothering. Your rights in labor: companions, freedom to move, food and drink, and informed consent (MFCI)."],
    ["Card 8 · Third trimester · Weeks 32–35", "Month 8 · The Turning",
      "She gains weight quickly and space grows tight, so her movements change from tumbling to stretching and pushing. Studies first show her responding to your voice differently from other voices, and after birth she prefers it. Antibodies cross the placenta to prepare her immune system, and many babies settle head down now.",
      "Your uterus presses up under your ribs and builds oxytocin receptors for labor, and your breasts may begin leaking colostrum. Nesting energy often arrives. If she is breech, a real decision lies ahead, and you deserve full information and room to choose.",
      "As space grows tight, she may feel held or hemmed in, and how decisions about her position are made may shape her experience, and yours. What helps is gentle movement, telling her what is happening, and practicing how you will stay in the decisions: asking about benefits, risks, and alternatives, taking a moment, and saying yes or no. If she comes early, skin-to-skin care in the NICU keeps her close. A baby doula and help planned for the weeks after birth are worth arranging now.",
      "Breech options: waiting, gentle positioning, an external version, or a vaginal breech birth with a skilled provider (Fischbein and Freeze). Continuous monitoring in low-risk labors is linked to about 20 percent more cesareans; you can ask about listening in at intervals."],
    ["Card 9 · Third trimester · Weeks 36–40", "Month 9 · Ripening",
      "Her lungs finish maturing, and full term arrives at 39 to 40 weeks. Research suggests her own maturing lungs release a signal that helps start labor, so she may have a part in deciding when birth begins.",
      "She may drop lower, easing your breath but adding pressure. Practice contractions grow stronger and your cervix begins to soften. Waiting can be hard, especially as pressure to induce grows, and you may feel ready, impatient, or afraid, sometimes all in one day.",
      "Being waited for, or hurried, may become part of her story. Labor usually begins when you are both ready, and her own body may help signal when. An induction is a choice to weigh, not an automatic step, and if one is chosen, telling her what is coming can soften it. What helps is an informed, unhurried decision, continuous support planned ahead, and a conversation about what you would want if plans change.",
      "The ARRIVE trial and elective induction at 39 weeks. Synthetic oxytocin does not act like your own and is linked to more postpartum depression and anxiety (Kroll-Desrosiers). Expressing colostrum after 37 weeks, with your provider's approval, helped milk flow sooner after birth (Singh)."],
    ["Card 10 · Birth · The opening", "Labor · The Threshold",
      "Contractions press and release her whole body like a long, firm embrace. Her own stress hormones surge, protecting her through each squeeze and preparing her lungs, and she receives some of your oxytocin and endorphins. Pressure, rhythm, and pause: the pace of labor becomes part of her story.",
      "Oxytocin brings rhythmic contractions, and beta-endorphin eases pain and carries you inward. You labor best when you can move, eat and drink lightly, and follow your body, and when you feel private, safe, and unobserved, much like lovemaking.",
      "The pace and pressure of labor may stay with her: moments of feeling stuck, and a journey supported, or interrupted by synthetic oxytocin, forceps, or vacuum. What helps is a guarded space: dim light, quiet, trusted people, and no routine procedures without a reason. Pain is part of labor; suffering is not, and choosing relief needs no guilt. If plans change, three things help you stay present: someone by your side, clear explanations, and time to respond.",
      "Sarah Buckley's \"undisturbed birth\": when labor feels watched or unsafe, adrenaline rises and can slow oxytocin, and with it labor. Ina May Gaskin reminds us that labor is part of nature, and that walking and eating belong in it."],
    ["Card 11 · Birth · The arrival", "Birth · Through the Gate",
      "In the final push, a surge of noradrenaline makes her alert, often with wide open eyes at your first meeting. She takes her first breath, and her circulation changes course within minutes. Light, air, sound, and gravity arrive all at once.",
      "Near the end, a surge of adrenaline gives you strength for the final pushes, the fetal ejection reflex. Many mothers feel a burst of energy and alertness to meet the baby. Pain medication, such as an epidural or opioids, can soften this surge, so you may both be less alert when you first meet.",
      "Every physiological birth event may leave an imprint, and harsh lights, noise, routine suctioning, and tight wrapping can overwhelm a newborn. What helps is a calm arrival, delayed cord clamping, and a gentle cesarean if surgery is needed. If the birth takes an unexpected turn, she can be told what is happening, held close as soon as possible, and offered repair words afterward. A birth that changed course is not a failure.",
      "A vaginal birth helps clear her lungs and seeds her with your beneficial microbes; skin to skin and breastfeeding help close the gap after a cesarean. Thomas Verny on birth and early imprints. Karen Strange on rupture and repair."],
    ["Card 12 · Birth · The golden hour", "First Hour · The Welcome",
      "Placed skin to skin, she warms, steadies her heart and breathing, and may crawl toward the breast on her own. Skin, smell, heartbeat, and your voice, now from the outside. A newborn may not know she is out, or that she made it, until she is told and held.",
      "Skin to skin, oxytocin and prolactin peak. Oxytocin helps the placenta release and protects against bleeding, and prolactin begins milk and mothering. Awe, relief, exhaustion, and the first look at your baby may arrive together.",
      "Welcome or separation may be among her first lessons about the world. What helps is keeping you together: skin to skin, breastfeeding, and rooming-in, with newborn checks on your chest and the first bath waiting. If the golden hour does not happen, through separation or medical care, the bond is not lost. Relationships are built over time, and repair can begin as soon as you are together. Mixed feelings in the days after are natural and need no guilt.",
      "Humanistic care keeps mother and baby together; taking the baby to a nursery for bathing is not part of this model (Davis-Floyd). Watch in the weeks after for lingering distress, such as flashbacks, numbness, or avoidance, and reach out for support (Seng and Taylor)."]];
  // The question that may begin to emerge for the baby each month, in her
  // voice. Kept in step with the mandala (../index.html) and the cards (cards.json).
  const QUESTIONS = ["Am I wanted?", "Am I welcome?", "Is it safe to be here?",
    "When I reach out, will someone meet me?", "Is my world a kind place?", "Can I rest here?",
    "Can I trust those around me?", "Will I be held as space grows tight?", "Will I be given time?",
    "Can I make it through?", "Is it safe to arrive?", "Do I belong here, with you?"];
  // Repair: each card's own practice, turned toward repair, with words to say.
  // Kept in step with the mandala (../index.html, REPAIR).
  const REPAIR = [
    ["Grounding", "If her beginning was not what you hoped, ground yourself, rest a hand on your belly, and tell her: \"You were a surprise, and now I am choosing you. You are wanted.\""],
    ["Repair words for the news", "Return to these as often as you need: \"When we found out, we were scared. That was about us, not you. You are welcome here.\""],
    ["A daily welcome", "After a frightening scan or a hard day, let the welcome carry a repair: \"That was a hard day. I am here now. You are safe with me.\""],
    ["Hands on the belly", "If days pass when you could not notice her, come back with your hands: \"I was busy and far away. I am here now, and I feel you.\""],
    ["A song for her", "After raised voices or a tense moment, sing her song, then say: \"That was loud. It was not about you. You are safe.\""],
    ["Three daily oxytocin breaks", "After a stretch of tension, the breaks are the way back: \"It has been a hard time. I am finding calm again, for both of us.\""],
    ["Pacing", "If fear filled the room, at a visit or at home, slow down with her afterward: \"That was frightening to hear. I am with you, and we will be cared for.\""],
    ["Tell her what you would like", "If a decision came fast or something was done without warning, tell her after: \"That was sudden. I am sorry we did not tell you first. You are held.\""],
    ["Tell her about the birth to come", "If birth will be helped along or scheduled, tell her before and again after: \"We chose to help you come today. You are welcome now, just as you are.\""],
    ["Tell her what is happening", "If labor was long or interrupted, tell her after: \"That was a long, hard journey, and you made it. I am so proud of you.\""],
    ["Repair after intensity", "Use it whenever the birth was hard: \"That was a lot. It is over. You are safe now. It was not your fault.\""],
    ["Tell her the story of her birth", "If you were apart after birth, hold her close and tell her: \"We were apart, and I missed you. I am here now, and I am so glad you are mine.\""]];
  // Each month's circle of support, and why the baby's question may begin to
  // emerge then. Kept in step with the cards (cards.json: circle, why).
  const CIRCLE = [
    "Let the people close to you ease your load and meet your news with care. Your rest is her first world.",
    "Ask for help through the nausea and fatigue, and let the people around you welcome her with you.",
    "Have someone with you at screenings and while you wait for results. A calmer home reaches her too.",
    "Invite someone to notice her movements with you, and to shield you from frightening birth stories.",
    "Let more loving voices reach her, and bring someone with you to the anatomy scan.",
    "Ask for real rest, and let others take on tasks. The calm rhythm of your home is the world she feels.",
    "Choose people who hear your fears without adding to them, and help your partner ready their voice for her.",
    "Plan help for after the birth, and keep your bond with your partner warm. She is held inside it.",
    "Let someone share the waiting and answer the questions, so you can turn inward and trust her timing.",
    "Have someone stay the whole way and guard a quiet space, telling her, too, what is happening.",
    "Keep a familiar voice with you and with her, so neither of you is alone if plans change.",
    "Protect a quiet golden hour, so she is welcomed skin to skin, and by more than one person."];
  const WHY = [
    "Her life begins with how she was conceived and hoped for.",
    "The news of her lands in your body, and she feels it.",
    "Your chemistry now reaches her through the placenta.",
    "Her movements are her first way of reaching out.",
    "Hearing begins, and the sounds of home reach her.",
    "Her first rhythms of rest take shape in the climate around her.",
    "She knows the voices near her, and feels the fear or calm in them.",
    "Room grows tight, and she begins to feel the walls holding her.",
    "Her own body helps signal when she is ready to be born.",
    "Labor presses her whole body, wave after wave.",
    "Light, air, and sound meet her all at once.",
    "Skin, smell, and voice tell her where she has arrived."];
  const PART_TITLES = ["Beginnings, an overview", "The Middle, an overview", "The Ripening, an overview", "The Threshold, an overview"];
  const short = t => t.split(" · ")[1];

  PARTS.forEach((pt, k) => {
    const months = MONTHS.slice(k * 3, k * 3 + 3);
    add(PART_TITLES[k], "blush", n => `
      ${wheel(pt.seg[0], pt.seg[1]).replace('class="wheel"', 'class="wheel big"')}
      <div class="eb">${pt.eb}</div>
      <h1 class="part">${pt.t}</h1>
      <div class="sub">${pt.sub}</div>
      <p class="plede">${pt.lede}</p>
      <div class="box soft">
        <p><b>Your baby.</b> ${pt.baby}</p>
        <p><b>You.</b> ${pt.you}</p>
        <p><b>Your circle.</b> ${pt.circle}</p>
        <p><b>Through the lens.</b> ${pt.lens}</p>
        <p><b>The focus.</b> ${pt.focus}</p>
        <p><b>When to read.</b> ${pt.when}</p>
      </div>
      <div class="lab">Cards in this section</div>
      <ul class="toc small">${months.map((m, j) => `<li data-go="${n + j + 1}"><span>${k * 3 + j + 1} · ${short(m[1])}</span><span>${n + j + 1}</span></li>`).join("")}</ul>
      ${foot(n)}`);
    months.forEach((m, j) => {
      const seg = k * 3 + j;
      add(m[1], "month", n => `
        ${wheel(seg, seg + 1)}
        <div class="eb">${m[0]}</div>
        <h1 class="mt">${m[1]}</h1>
        <hr>
        <h2>Your baby</h2><p>${m[2]}</p>
        <h2>You</h2><p>${m[3]}</p>
        <p class="circ"><b>Your circle.</b> ${CIRCLE[seg]}</p>
        <h2>Imprints and what helps</h2><p>${m[4]}</p><p class="mq"><span>Baby's question</span>${QUESTIONS[seg]}<i>${WHY[seg]}</i></p>
        <div class="box"><div class="lab">To explore further</div><p>${m[5]}</p></div>
        ${foot(n)}`);
    });
  });

  // Harder paths: the situations this guide does not picture, held with
  // care, and without judgment. The opening section of Going deeper.
  add("When the path is harder", "", n => `
    <div class="eb">Going deeper · Harder paths</div>
    <h1>When the path is harder</h1>
    <p>No pregnancy follows the map exactly. Some begin in ways this guide does not picture, and some carry grief, fear, or old wounds alongside the hope. Whatever your path, the center of this guide still holds: she is here, she is listening, and connection and repair are possible.</p>
    <div class="lab">Conceiving with help</div>
    <p>IVF, donor eggs or sperm, or a surrogate can make a beginning feel clinical, or full of waiting and loss. Many in this field invite parents to tell the baby the story of how she came to be, and how long and how much she was wanted. If a donor or surrogate is part of her story, it can be told with gratitude, and at her pace as she grows.</p>
    <div class="lab">Without a partner, or without support</div>
    <p>You may be single by choice, separated, or with a partner who is not involved. Her first world is you and the people you gather around you: friends, family, a doula, a community. The circles of support on page ${no("My circles of support")} are a place to start.</p>
    <div class="lab">When home is not safe</div>
    <p>Abuse can begin or grow worse in pregnancy, and it reaches your baby as well as you. You deserve safety. In the United States, the National Domestic Violence Hotline is open day and night: call 1-800-799-7233, or text START to 88788. A doula, a care provider, or a friend can help you make a plan.</p>
    ${foot(n)}`);

  add("Loss, and hope after loss", "", n => `
    <div class="eb">Going deeper · Harder paths</div>
    <h1>Loss, and hope after loss</h1>
    <div class="lab">Pregnancy after loss</div>
    <p>If you have lost a pregnancy or a child before, hope and fear often arrive together, and letting yourself attach can feel risky. This is natural. Some parents tell the new baby about her brother or sister, so the loss is held in the open rather than in silence. She is not a replacement. She is herself.</p>
    <div class="lab">When this pregnancy brings hard news</div>
    <p>A difficult diagnosis, a twin who does not continue, or a pregnancy that ends: these are griefs that deserve time and support. Your baby can still be spoken to, held in your attention, and named. Perinatal loss and perinatal hospice support exist for exactly these paths.</p>
    <div class="lab">Carrying a baby you will not raise</div>
    <p>If you are a surrogate, or carrying a baby toward adoption, she is still listening to you now. Many find it meaningful to speak to her honestly, about who will hold her and that she was carried with care. Your own feelings, including grief, deserve support too.</p>
    <div class="lab">Adopting a baby</div>
    <p>If you are adopting, your baby will arrive with a story that began before you, including the loss of the first voice she knew. Telling her that story, and meeting her early grief with patience, is a gift (Verrier, <i>The Primal Wound</i>).</p>
    <div class="lab">Grief has its own timing</div>
    <p>Grief may come in waves: at scans, due dates, and anniversaries. Partners often grieve differently, and both ways are real. Groups such as Share Pregnancy and Infant Loss Support, and Postpartum Support International, offer companionship along the way.</p>
    ${foot(n)}`);

  add("When birth takes a hard turn", "", n => `
    <div class="eb">Going deeper · Harder paths</div>
    <h1>When birth takes a hard turn</h1>
    <div class="lab">A birth that was hard</div>
    <p>An emergency cesarean, a frightening labor, separation, or feeling unheard can leave a mark on parents as well as babies, and many people carry a hard birth quietly for years. Telling the story to someone who listens, and telling your child what happened, are both forms of repair. Approaches such as EMDR and birth story listening can help (page ${no("People who can walk with you")}).</p>
    <div class="lab">Early arrivals and the NICU</div>
    <p>If she comes early or needs special care, you are still her first world. Your voice, your smell, skin to skin as soon as it is allowed, and your hand through the incubator all reach her. Ask her nurses what you can do.</p>
    <div class="lab">When the pregnancy was not planned</div>
    <p>An unexpected pregnancy can bring shock, ambivalence, or fear. Mixed feelings are not a verdict on your love. Telling her, "This was a surprise, and I am finding my way to you," is honest, and a beginning.</p>
    ${foot(n)}`);

  add("Looking back with kindness", "", n => `
    <div class="eb">Going deeper · Harder paths</div>
    <h1>Looking back with kindness</h1>
    <p>Learning about imprints can bring up the past: a pregnancy you wish had gone differently, an older child's birth, or a pregnancy you ended. This knowledge is not a scorecard.</p>
    <div class="lab">After an abortion</div>
    <p>If you have ended a pregnancy, reading this may stir grief, relief, regret, or all of these at once. You made a decision with what you knew and what you had at the time. Grief and love can sit beside that decision. Some people find comfort in a private ritual of acknowledgment, or in talking with someone who listens without judgment, such as All-Options, which supports people through every pregnancy experience.</p>
    <div class="lab">If you carry earlier trauma</div>
    <p>Past abuse or assault can make exams, birth, and being touched hard. You can tell your care providers what helps you feel safe, and ask for trauma-informed care. A therapist can walk with you before the birth.</p>
    <div class="lab">Repair is possible at any age</div>
    <p>If you look back at an older child's beginning and see what was missing, it is not too late. Children of every age, and adults too, can be told their story with kindness, and repair can begin in any relationship, including the one with yourself.</p>
    ${foot(n)}`);

  // Going deeper: memory research and regression, then the words of this guide.
  // Regression: early impressions returning to awareness, and the parent's
  // own early story stirred by pregnancy. A facing pair after memory.
  add("Memories that return", "", n => `
    <div class="eb">Going deeper · Regression</div>
    <h1>Memories that return</h1>
    <p>For a century, people in therapy have described experiences that seem to come from before words: a sense of the womb, of being born, of how they were received. In pre- and perinatal psychology these are called regression experiences, early impressions returning to conscious awareness.</p>
    <div class="lab">What has been gathered</div>
    <ul class="lead">
      <li>From the 1960s, psychiatrists Frank Lake and Stanislav Grof recorded clients reliving womb and birth experiences in deep therapeutic states.</li>
      <li>Obstetrician David Cheek, working with hypnosis, described adults recalling the movements and circumstances of their own births.</li>
      <li>David Chamberlain compared the birth memories of mothers and their children, recalled separately under hypnosis, and found many details matched (<i>Babies Remember Birth</i>).</li>
      <li>Ham and Klimo found that adults' recalled sense of their mothers' feelings in pregnancy matched what their mothers reported.</li>
      <li>Surveys in Japan found many young children speaking, unprompted, of the womb or their birth (Ikegawa).</li>
    </ul>
    <p class="note">A careful note: memory recalled in hypnosis or deep states can be shaped by suggestion and expectation, and mainstream science doubts that memories like these can form so early. What these accounts are is still being explored.</p>
    ${foot(n)}`);

  add("How early memory may be held", "", n => `
    <div class="eb">Going deeper · Regression</div>
    <h1>How early memory may be held</h1>
    <p>How could experience from before birth be carried? Part of the answer may be implicit memory: patterns of feeling held in the body and nervous system before there are words for them. Some practitioners speak of cellular or energetic memory, something carried that research has not yet found a way to measure.</p>
    <p>However it is held, what people describe is often felt in the body first: in breath, in posture, in emotions that seem older than the story they know.</p>
    <div class="lab">Pregnancy as a doorway</div>
    <p>Carrying a child often stirs a parent's own earliest story. Feelings may rise that seem bigger than the moment, or familiar in a way that is hard to name: a fear of being left, a longing to be held. In this lens, such moments may be your own early imprints surfacing, a natural part of becoming a parent.</p>
    <p>Meeting them gently matters for you both. What is felt and understood can be soothed, and what is soothed is less likely to be passed on.</p>
    <div class="box blush"><p>The healing practice on the back of each card is a place to begin. If what surfaces feels larger than you can hold, the people on page ${no("People who can walk with you")} work with exactly these early experiences.</p></div>
    ${foot(n)}`);

  add("People who can walk with you", "dense", n => `
    <div class="eb">Going deeper with support</div>
    <h1>People who can walk with you</h1>
    <p>The healing practices on the cards are gentle starting points. When something stirs more than you can hold, or you want to go further, these people and approaches can help.</p>
    <hr>
    <div class="lab">Practitioners</div>
    <p class="tight"><b>Pre- and perinatal practitioners and educators</b> work with bonding, early imprints, and birth stories. APPPAH lists trained practitioners.</p>
    <p class="tight"><b>Perinatal mental health specialists</b> support anxiety, depression, and trauma in pregnancy and after. Look for the PMH-C credential, through Postpartum Support International.</p>
    <p class="tight"><b>Trauma-informed psychotherapists</b> help with history that surfaces, at a pace that feels safe.</p>
    <p class="tight"><b>Doulas</b> for birth and the weeks after, and a baby doula to follow your baby's journey.</p>
    <p class="tight"><b>Childbirth educators</b>, bonding programs such as Pregnancy Dialogues, and <b>lactation consultants</b> (IBCLC).</p>
    <hr>
    <div class="lab">Modalities</div>
    <p class="tight"><b>Prenatal and birth therapy,</b> in the tradition of Ray Castellino and William Emerson, works with the imprints of conception, womb life, and birth, for babies, children, and adults.</p>
    <p class="tight"><b>Somatic Experiencing</b> gently releases stress and trauma held in the body.</p>
    <p class="tight"><b>Craniosacral therapy</b> offers light, hands-on support for parents and newborns.</p>
    <p class="tight"><b>EMDR</b> helps the mind process hard memories, including a difficult birth.</p>
    <p class="tight"><b>Birth story listening</b> helps you tell your story, be heard, and find meaning in it.</p>
    <div class="box blush"><p>An educator can help you find the right fit. Choose people who listen, who leave you feeling safe, and who let you set the pace. Keep their details on the next two pages.</p></div>
    ${foot(n)}`);

  add("Help, reading, and sources", "dense", n => `
    <div class="eb">Resources</div>
    <h1>Help, reading, and sources</h1>
    <div class="box blush">
      <div class="lab">If you need support now (United States)</div>
      <p class="tight"><b>National Maternal Mental Health Hotline:</b> call or text 1-833-TLC-MAMA (1-833-852-6262).</p>
      <p class="tight"><b>Postpartum Support International HelpLine:</b> call or text 1-800-944-4773.</p>
      <p class="tight"><b>National Domestic Violence Hotline:</b> call 1-800-799-7233, or text START to 88788.</p>
      <p class="tight">In a crisis, call or text 988. In an emergency, call 911.</p>
    </div>
    <div class="lab">Further reading</div>
    <ul class="refs">
      <li>Chamberlain, D. <i>Windows to the Womb</i>; <i>Babies Remember Birth</i>.</li>
      <li>Verny, T., and Kelly, J. <i>The Secret Life of the Unborn Child</i>.</li>
      <li>Buckley, S. <i>Gentle Birth, Gentle Mothering</i>.</li>
      <li>Gaskin, I. M. <i>Ina May's Guide to Childbirth</i>.</li>
      <li>Siegel, D., and Hartzell, M. <i>Parenting from the Inside Out</i>.</li>
      <li>Strange, K. <i>Simple Tools for Mothers</i>.</li>
    </ul>
    ${foot(n)}`);

  // Two pages to fill in by hand, in three rings around her: the people
  // who care for her body, the people who love her, and the pre- and
  // perinatal support she finds.
  const ringIcon = k => {
    const r = [14, 24, 34], c = ["#FCA59B", "#EE8A73", "#E35F43"];
    return `<svg class="ringicon" viewBox="-36 -36 72 72" aria-hidden="true">${r.map((rr, i) =>
      `<circle r="${rr}" fill="none" stroke="${i === k ? c[i] : "#F1D3CC"}" stroke-width="${i === k ? 7 : 4}"/>`).join("")}<circle r="5" fill="#E35F43"/></svg>`;
  };
  const ring = (k, name, hint) => `<div class="ring">${ringIcon(k)}<div><div class="rname">${name}</div><div class="rhint">${hint}</div></div></div>`;
  const entry = (k, role) => `
    <div class="entry">
      <div class="enum">${k}</div>
      <div class="row two"><label>Name</label><label>${role}</label></div>
      <div class="row"><label>Contact</label></div>
      <div class="row"><label></label></div>
    </div>`;
  add("My circles of support", "circle", n => `
    <div class="eb">Going deeper with support</div>
    <h1>My circles of support</h1>
    <p class="muted">Three rings of people around you and your baby.</p>
    ${ring(0, "Ring one · Care providers", "Midwife, doctor, doula, lactation consultant, pediatrician")}
    ${[1, 2, 3].map(k => entry(k, "Profession")).join("")}
    ${ring(1, "Ring two · Family and friends", "The people who will cook, listen, hold the baby, and hold you")}
    ${[4, 5, 6].map(k => entry(k, "Relationship")).join("")}
    ${foot(n)}`);

  add("My circles of support, continued", "circle", n => `
    <div class="eb">My circles of support · Continued</div>
    ${ring(2, "Ring three · Pre- and perinatal support", "Pre- and perinatal practitioners and educators, prenatal and birth therapy, Somatic Experiencing, craniosacral therapy, birth story listening, bonding programs")}
    ${[7, 8, 9, 10, 11, 12].map(k => entry(k, "Modality")).join("")}
    <div class="row"><label>Notes</label></div>
    <div class="row"><label></label></div>
    <div class="row"><label></label></div>
    ${foot(n)}`);

  add("Glossary", "dense", n => `
    <div class="eb">Going deeper</div>
    <h1>Words in this guide</h1>
    <dl class="gloss">
      <dt>Pre- and perinatal</dt><dd>Before birth, and around birth: from conception through the first year.</dd>
      <dt>Prenate</dt><dd>A baby before birth.</dd>
      <dt>Imprint</dt><dd>A lasting impression left by early experience, held in the body and nervous system before there are words.</dd>
      <dt>Baby's question</dt><dd>A quiet question that may begin to emerge for the baby, such as "Am I welcome?" It stays open, and each repair answers it again.</dd>
      <dt>Explicit memory</dt><dd>Memory we can recall and put into words: facts, events, stories.</dd>
      <dt>Implicit memory</dt><dd>Memory held without a sense of remembering: in the body, in feelings, in what we expect.</dd>
      <dt>Regression</dt><dd>Early impressions returning to awareness, often in deep or therapeutic states.</dd>
      <dt>Placenta</dt><dd>The organ that nourishes her and carries some of your chemistry to her, while buffering much of it.</dd>
      <dt>Epigenetics</dt><dd>How surroundings change the way genes are switched on and off, without changing the genes themselves.</dd>
      <dt>Cortisol</dt><dd>A stress hormone. Brief rises are normal; long, unrelieved stress matters most.</dd>
      <dt>Oxytocin</dt><dd>The hormone of calm, closeness, and labor contractions.</dd>
    </dl>
    ${foot(n)}`);

  add("Glossary, continued", "dense", n => `
    <div class="eb">Going deeper</div>
    <dl class="gloss">
      <dt>Nervous system states</dt><dd>In polyvagal theory: safe and connected, mobilized, and shut down.</dd>
      <dt>Neuroception</dt><dd>The body's wordless, constant scanning for safety and danger.</dd>
      <dt>Window of tolerance</dt><dd>The range in which you can feel strongly and still think and connect. Also called a window of capacity.</dd>
      <dt>Self-regulation</dt><dd>Finding your own way back to steadiness.</dd>
      <dt>Co-regulation</dt><dd>Steadying through another person. A baby borrows steadiness from her parents.</dd>
      <dt>Resource</dt><dd>Anything that helps your nervous system feel steadier: a person, a place, a memory, a sensation.</dd>
      <dt>Rupture and repair</dt><dd>A break in connection, and the return that heals it. Repair builds trust.</dd>
      <dt>Healthy separateness</dt><dd>Telling her which feelings are yours, so she need not carry them as her own.</dd>
      <dt>Trauma</dt><dd>An experience that was too much, too fast, or too soon, with too little support.</dd>
      <dt>Resilience</dt><dd>The capacity to meet difficulty and find the way back to balance.</dd>
      <dt>Circle of support</dt><dd>The people who hold you so you can hold your baby. Each of you needs at least two layers (Castellino).</dd>
      <dt>Doula</dt><dd>A trained companion who supports the mother through birth and the weeks after.</dd>
      <dt>Baby doula</dt><dd>Someone who follows the baby's journey through birth.</dd>
      <dt>Informed consent</dt><dd>Your right to understand the benefits, risks, and alternatives of any care, and to say yes or no.</dd>
      <dt>The golden hour</dt><dd>The first hour after birth, when skin to skin and closeness matter most.</dd>
    </dl>
    ${foot(n)}`);

  // The sources have their own page, facing the help and reading.
  add("Sources drawn on", "dense", n => `
    <div class="eb">Resources</div>
    <h1>Sources drawn on</h1>
    <ul class="refs small">
      <li>Buckley, S. J. (2003). Undisturbed birth. <i>JOPPPAH, 17</i>(4).</li>
      <li>Cheek, D. B. (1975). Maladjustment patterns apparently related to imprinting at birth. <i>American Journal of Clinical Hypnosis</i>. Grof, S. (1975). <i>Realms of the Human Unconscious</i>.</li>
      <li>Center on the Developing Child, Harvard University. Toxic stress. Coalition for Improving Maternity Services. Mother-Friendly Childbirth Initiative.</li>
      <li>Dana, D. (2018). <i>The Polyvagal Theory in Therapy</i>. DeCasper, A. J., and Fifer, W. P. (1980). <i>Science, 208</i>.</li>
      <li>DeCasper, A. J., and Spence, M. J. (1986). <i>Infant Behavior and Development, 9</i>.</li>
      <li>Davis-Floyd, R. (2022). <i>Birth as an American Rite of Passage</i> (2nd ed.).</li>
      <li>Emerson, W. The Elephant in the Birthing Room.</li>
      <li>Fischbein, S. J., and Freeze, R. (2018). <i>BMC Pregnancy and Childbirth, 18</i>, 397.</li>
      <li>Ham, J. T., and Klimo, J. (2000). Fetal awareness of maternal emotional states. <i>JOPPPAH, 15</i>(2).</li>
      <li>Buckley, S. J. (2015). <i>Hormonal Physiology of Childbearing</i>. Childbirth Connection. Gettler, L. T., et al. (2011). <i>PNAS, 108</i>(39).</li>
      <li>Gordon, I., et al. (2010). Oxytocin and the development of parenting in humans. <i>Biological Psychiatry, 68</i>(4).</li>
      <li>Hoekzema, E., et al. (2017). Pregnancy leads to long-lasting changes in human brain structure. <i>Nature Neuroscience, 20</i>.</li>
      <li>Ikegawa, A. (2005). Fetal and infant memory in the womb and at birth. <i>JOPPPAH, 20</i>(2). Kisilevsky, B. S., et al. (2003). <i>Psychological Science, 14</i>(3). Kroll-Desrosiers, A. R., et al. (2017). <i>Depression and Anxiety, 34</i>(2).</li>
      <li>Lieberman, M. D., et al. (2007). Putting feelings into words. <i>Psychological Science, 18</i>(5). Raphael, D. (1975). Matrescence, becoming a mother. In <i>Being Female</i>.</li>
      <li>Levine, P. A. (1997). <i>Waking the Tiger</i>. Mampe, B., et al. (2009). <i>Current Biology, 19</i>(23).</li>
      <li>Mennella, J. A., Jagnow, C. P., and Beauchamp, G. K. (2001). <i>Pediatrics, 107</i>(6). Porges, S. W. (2011). <i>The Polyvagal Theory</i>.</li>
      <li>Lorenz, K. (1935). Der Kumpan in der Umwelt des Vogels. Rank, O. (1924). <i>The Trauma of Birth</i>.</li>
      <li>Nathanielsz, P. W. <i>Life in the Womb</i>. Partanen, E., et al. (2013). <i>PNAS, 110</i>(37). Persico, G., et al. (2017). <i>Women and Birth, 30</i>(4).</li>
      <li>Raffai, J. (2021). Parental conflict and the intrauterine realm.</li>
      <li>Seng, J., and Taylor, J. (2015). <i>Trauma Informed Care in the Perinatal Period</i>. Siegel, D. J. <i>The Developing Mind</i>.</li>
      <li>Tronick, E. Z., and Gianino, A. (1986). Interactive mismatch and repair. <i>Zero to Three, 6</i>(3).</li>
      <li>Weaver, I. C. G., et al. (2004). Epigenetic programming by maternal behavior. <i>Nature Neuroscience, 7</i>(8). Heijmans, B. T., et al. (2008). <i>PNAS, 105</i>(44). Oberlander, T. F., et al. (2008). <i>Epigenetics, 3</i>(2). Yehuda, R., et al. (2016). <i>Biological Psychiatry, 80</i>(5).</li>
      <li>White, K. (2013). Interview with Ray Castellino: The principles. <i>JOPPPAH, 27</i>(3).</li>
      <li>Verrier, N. N. (1993). <i>The Primal Wound: Understanding the Adopted Child</i>.</li>
      <li>Singh, G., et al. (2009). <i>MJAFI, 65</i>. Verny, T. R. Birth and the origins of violence.</li>
    </ul>
    ${foot(n)}`);

  add("Notes", "", n => `
    <div class="eb">Notes</div>
    <h1>What I am noticing</h1>
    <p class="muted">Her movements, your feelings, what surfaced, what you want to remember.</p>
    <div class="lines">${"<i></i>".repeat(19)}</div>
    ${foot(n)}`);

  add("Notes, continued", "", n => `
    <div class="lines tall">${"<i></i>".repeat(25)}</div>
    ${foot(n)}`);

  add("Inside back cover", "endpaper", () => "");
  add("Back cover", "backcover hard", () => `
    <div class="stamp small">${foilMandala()}</div>
    <p class="backq">At the center of all of this is a child who is already present, already listening, and already being shaped by the world around her.</p>
    <div class="dash"></div>
    <p class="backs">A card deck and guidebook for the journey of pregnancy and birth, drawn from the Pregnancy and Birth Mandala and the lens of pre- and perinatal education.</p>
    <div class="backf">
      <p>Created by Erin Singleton as part of APPPAH's Prenatal &amp; Perinatal Educator certification.</p>
      <p>An educational companion, not medical advice. Talk with your care provider about your own pregnancy.</p>
    </div>`);

  /* ---- the contents, built from the pages themselves ---- */
  // Four parts: the foundations, how to read the cards, the cards, and
  // going deeper. Each part holds its sections; each section, its pages.
  const TOC = [
    [0, null, [
      [null, ["Key to the mandala", "Welcome", "Start here"]]]],
    [0, "Part One · Foundations", [
      ["Your baby and you", ["Your baby is already here", "What she senses, and when", "You are her first world", "The world around you", "Experience and the genes", "Not destiny", "The hormones of pregnancy", "The hormones of birth and bonding"]],
      ["The pre- and perinatal lens", ["The pre- and perinatal lens", "Why it matters", "What is an imprint?", "Memory before words"]],
      ["Your inner world", ["Trauma and resilience", "Your nervous system", "Your window of tolerance", "Widening your window", "Feelings", "Your feelings, and hers", "Your own healing", "A time for transformation", "Resourcing yourself", "A daily check-in"]],
      ["Connecting with her", ["Speaking to your baby", "She is listening", "Your part in this", "For partners", "Layers of support", "Your circle, month by month"]]]],
    [1, "Part Two · Understanding the cards", [
      [null, ["How each month is read", "Your card, front and back", "The heart of the practices", "Using the cards", "Every practice is a way back", "Repair, month by month"]]]],
    [1, "Part Three · The cards", [
      ["The first trimester", [PART_TITLES[0], ...MONTHS.slice(0, 3).map(m => m[1])]],
      ["The second trimester", [PART_TITLES[1], ...MONTHS.slice(3, 6).map(m => m[1])]],
      ["The third trimester", [PART_TITLES[2], ...MONTHS.slice(6, 9).map(m => m[1])]],
      ["Birth", [PART_TITLES[3], ...MONTHS.slice(9, 12).map(m => m[1])]]]],
    [1, "Part Four · Going deeper", [
      [null, ["When the path is harder", "Loss, and hope after loss", "When birth takes a hard turn", "Looking back with kindness", "Memories that return", "How early memory may be held", "People who can walk with you", "Help, reading, and sources", "My circles of support", "Glossary", "Sources drawn on", "Notes"]]]]];
  function contents(n, side) {
    const line = t => {
      const i = no(t);
      return `<li data-go="${i}"${PART_TITLES.includes(t) ? ' class="b"' : ""}><span>${t}</span><span>${i}</span></li>`;
    };
    // The four sections of the cards sit two by two.
    const group = ([h, items]) => `<div class="grp">${h ? `<div class="lab">${h}</div>` : ""}<ul class="toc">${items.map(line).join("")}</ul></div>`;
    const body = TOC.filter(([sd]) => sd === side).map(([, part, groups]) =>
      (part ? `<div class="ptitle">${part}</div>` : "") +
      (groups.length === 4 && /cards$/.test(part) ? `<div class="grid2">${groups.map(group).join("")}</div>` : groups.map(group).join(""))).join("");
    return `
    <div class="eb">Contents</div>
    ${side === 0 ? `<h1 class="ct">Inside this guide</h1>` : ""}
    ${body}
    ${foot(n)}`;
  }

  const numbered = p => !/\b(cover|endpaper|backcover|frontis|halftitle|blank)\b/.test(p.cls);
  window.GUIDE = P.map((p, i) => ({ title: p.title, cls: p.cls, num: numbered(p) ? i : null, html: p.html(i) }));
})();
