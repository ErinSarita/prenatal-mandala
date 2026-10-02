/* The guidebook, page by page.

   Each page is drawn at its printed size, 5.5 × 8.5 inches (528 × 816 CSS
   pixels), and the book scales it to fit the screen. Page numbers come from
   a page's place in this list, so pages can be added or moved and every
   number, the contents page included, follows along. The book is bound as
   a hardcover: cloth boards front and back, each lined with an endpaper
   that carries no number. */
(function () {
  "use strict";

  /* ---- the little wheel in the corner -------------------------------- */
  // Twelve segments clockwise from the top: nine months, then labor, birth,
  // and the first hour. Rings from the center out: child, mother, educator,
  // connecting and healing.
  const RINGS = [[18, 40], [40, 58], [58, 76], [76, 100]];
  const BASE = ["#FDE4DD", "#FBD3CB", "#F6CCC4", "#F0C3B9"];
  const LIT = ["#FFDCD3", "#FCA59B", "#EE8A73", "#E35F43"];
  function arc(r0, r1, a0, a1) {
    const p = (r, a) => [(r * Math.sin(a)).toFixed(2), (-r * Math.cos(a)).toFixed(2)];
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1), [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0);
    return `M${x0} ${y0}A${r1} ${r1} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${big} 0 ${x3} ${y3}Z`;
  }
  function wheel(from, to) { // segments [from, to) are lit
    const a = i => i / 12 * 2 * Math.PI;
    let s = "";
    RINGS.forEach(([r0, r1], k) => {
      s += `<circle r="${(r0 + r1) / 2}" fill="none" stroke="${BASE[k]}" stroke-width="${r1 - r0}"/>`;
      s += `<path d="${arc(r0, r1, a(from), a(to))}" fill="${LIT[k]}"/>`;
    });
    [40, 58, 76].forEach(r => { s += `<circle r="${r}" fill="none" stroke="#FFF7F5" stroke-width="1.6"/>`; });
    s += `<circle r="15" fill="#E35F43"/>`;
    return `<svg class="wheel" viewBox="-101 -101 202 202" aria-hidden="true">${s}</svg>`;
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

    // outer petals, each with its small dot
    for (let i = 0; i < 12; i++) {
      const [a0, a1] = seg(i);
      g += `<path d="${petal(a0, a1)}" fill="${f("coral")}"/>`;
      const [x, y] = pt(281, (a0 + a1) / 2); g += `<circle cx="${x}" cy="${y}" r="3.6" fill="${mask ? "#000" : "none"}"/>`;
    }
    // the three rings, outside in, so each inner edge sits over the next
    [[201, 256, "salmon", 3], [138, 202, "pink", 4], [51, 139, "peach", 4]].forEach(([r0, r1, k, b]) => {
      for (let i = 0; i < 12; i++) { const [a0, a1] = seg(i); g += `<path d="${cell(r0, r1, a0, a1, b)}" fill="${f(k)}" stroke="${GAP}" stroke-width="5" stroke-linejoin="round"/>`; }
    });
    // the center: the Seed of Life in a coral disc
    g += `<circle r="51" fill="${f("coral")}" stroke="${GAP}" stroke-width="5"/><circle r="42" fill="none" stroke="${GAP}" stroke-width="2"/>`;
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
  // The printed number is a page's place in the book, with the front
  // endpaper uncounted: the cover is 1, so the contents falls on page 4.
  const no = t => P.findIndex(p => p.title === t); // printed number of a page, by title
  const foot = n => `<div class="foot"><span>The Pregnancy and Birth Mandala</span><span>${n}</span></div>`;

  // Cover
  add("Cover", "cover hard", () => `
    <div class="eb center gilt">A guide to the twelve cards</div>
    <div class="stamp">${foilMandala()}</div>
    <h1 class="covt gilt">The Pregnancy<br>and Birth Mandala</h1>
    <p class="covs">From the first days to the first hour</p>
    <div class="dash"></div>
    <p class="covlens">Through the lens of pre- and perinatal education</p>
    <p class="foil">Erin Singleton</p>`);
  add("Inside front cover", "endpaper", () => "");

  // The front matter keeps the book's custom: what matters starts on a
  // right-hand page. First the half-title, then the contents on its own with
  // a blank page facing it, then the mandala facing the Welcome.
  add("Half-title", "halftitle", () => `
    <div class="eb center">A guide to the twelve cards</div>
    <h1 class="htt">The Pregnancy<br>and Birth Mandala</h1>
    <div class="dash"></div>
    <p class="hts">From the first days to the first hour</p>`);
  add("Blank", "blank", () => "");

  // Contents (filled in once every page exists)
  add("Contents", "contents", n => contents(n));

  // The mandala on the right, and its key facing it on the left, with the
  // way to the interactive mandala.
  const quad = (a, b, name, sub) => `<div class="q">${wheel(a, b).replace('class="wheel"', 'class="qw"')}<div><b>${name}</b><span>${sub}</span></div></div>`;
  add("Key to the mandala", "key", n => `
    <div class="eb">The mandala · Key</div>
    <h1>Key to the mandala</h1>
    <div class="lab">The rings, from the center out</div>
    <ul class="rings">
      <li><span class="dot" style="background:#E35F43"></span><b>The center.</b> Represented by the Flower of Life symbol.</li>
      <li><span class="dot" style="background:#FFD5CC;border:1px solid #F4B9AD"></span><b>The child.</b> Her growth, and what she may be sensing.</li>
      <li><span class="dot" style="background:#FCA59B"></span><b>The mother.</b> Your body, hormones, and feelings.</li>
      <li><span class="dot" style="background:#EE8A73"></span><b>The educator.</b> Possible imprints and what helps.</li>
      <li><span class="dot" style="background:#E35F43"></span><b>Connecting and healing.</b> The outer petals: practices for you and your baby.</li>
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
      <li><span class="dot" style="background:transparent;border:1.5px solid #B98C80"></span><b>The outer edge.</b> The forty weeks, from week 1 at the top.</li>
      <li><span class="dot" style="background:#F2B4A8;box-shadow:inset 0 0 0 3px #FBE3DD"></span><b>The braid.</b> Three strands, for child, mother, and educator, holding the circle together.</li>
    </ul>
    <div class="box blush"><p><b>See it come alive.</b> The interactive mandala opens every month in detail, and with a due date entered it shows today, the birth window, and the moons of your pregnancy.<br><a href="../">erinsarita.github.io/prenatal-mandala</a></p></div>
    ${foot(n)}`);

  // Frontispiece: the whole mandala, large, on a right-hand page.
  add("The mandala", "frontis", () => `
    <div class="eb center">The Pregnancy and Birth Mandala</div>
    <div class="halo"><img src="img/mandala.jpg" alt="The Pregnancy and Birth Mandala: the child at the center, then rings for the mother, the educator, and the outer petals of connecting and healing, with the forty weeks around the edge."></div>`);


  add("Welcome", "", n => `
    <div class="eb">Welcome</div>
    <h1>A map for the journey,<br>with a child at its heart</h1>
    <p>Pregnancy is often described in weeks, tests, and appointments. This deck invites you to see it another way: as a journey you and your baby take together, from the first days to the first hour after birth.</p>
    <p>In pre- and perinatal education, the baby is understood as aware from the very beginning. She is taking in her world, and what she experiences in the womb, at birth, and in her first hours may leave imprints that shape her long after. This is not a weight to carry. It is an invitation to slow down, to notice, and to connect.</p>
    <p>The cards come from a mandala, a circle organized around a center. At its center is your baby. Around her is you. Around you is what is good to know, and on the outer petals are practices for connecting with her and for your own healing.</p>
    <p>The pages that follow lay the foundation: what this lens is and where it comes from, what an imprint is and how the body remembers, trauma and resilience, your nervous system, and how each month is read. Then come the cards themselves, month by month, and people who can walk with you further.</p>
    <blockquote>There are no secrets you can keep from your baby, so talk to her, and more importantly, listen.<cite>Karen Strange, Simple Tools for Mothers</cite></blockquote>
    ${foot(n)}`);

  /* ---- foundations: the pre- and perinatal lens ---- */
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

  add("What is an imprint?", "", n => `
    <div class="eb">Foundations · Imprints</div>
    <h1>What is an imprint?</h1>
    <p>The word comes from Konrad Lorenz, who watched newly hatched goslings follow the first moving figure they saw, often Lorenz himself, and keep following. A first experience, met in a sensitive window, set a lasting pattern.</p>
    <p>In pre- and perinatal education, an imprint is an impression left by early experience: conception, life in the womb, birth, and the first hours and days. Because it comes before words, it is held as body memory, in the nervous system and in patterns of feeling and response, rather than as a story she can tell.</p>
    <p>Imprints shape her first answers to quiet questions: <em>Am I welcome? Is the world safe? When I reach out, will someone meet me?</em></p>
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
    <div class="lab">The window of tolerance</div>
    <p>Daniel Siegel describes a zone in which we can feel strong feelings and still think, connect, and respond. Above it we may feel flooded or panicked; below it, numb or far away. Support and resourcing widen this window over time, and labor asks for a wide one.</p>
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

  add("How each month is read", "", n => `
    <div class="eb">Foundations · Reading a month</div>
    <h1>How each month is read</h1>
    <p>Every month in this guide follows the same pattern, moving from the center of the mandala outward.</p>
    <div class="parts">
      <div><span class="dot" style="background:#FFD5CC;border:1px solid #F4B9AD"></span><h3>Your baby</h3><p>Her growth, and what she may be sensing and taking in. Read it as a description of someone, not something.</p></div>
      <div><span class="dot" style="background:#FCA59B"></span><h3>You</h3><p>Your body, hormones, and feelings. Your inner states are her first environment, so caring for yourself is caring for her.</p></div>
      <div><span class="dot" style="background:#EE8A73"></span><h3>Imprints and what helps</h3><p>What this month's experiences may leave as an impression, and what tends to help: practices, people, and choices. These are possibilities to notice, not predictions.</p></div>
      <div><span class="dot" style="background:#E35F43"></span><h3>To explore further</h3><p>The teachers and research behind the month, for when you want to read more deeply.</p></div>
    </div>
    <p>The back of each card carries the outer petals: practices for connecting with your baby, and one for your own healing.</p>
    <div class="box blush"><p><b>Three questions to carry.</b> What might she be experiencing? What am I experiencing? What would help us both?</p></div>
    ${foot(n)}`);

  add("Using the cards", "", n => `
    <div class="eb">Using the cards</div>
    <h1>One card at a time</h1>
    <ol class="steps">
      <li><b>Find your card.</b> Choose the card for the month you are in. The small wheel in its corner shows where it sits on the mandala.</li>
      <li><b>Read the front.</b> It holds a short picture of your baby, of you, and of what is good to know this month.</li>
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

  /* ---- the four parts and twelve months ---- */
  const PARTS = [
    { eb: "Part one · Weeks 1–13", t: "The First<br>Trimester", sub: "Beginnings", seg: [0, 3],
      lede: "Life is often present before anyone knows it. These first weeks are full of rapid building, and of big feelings as the news arrives.",
      baby: "From a cluster of cells to a moving fetus. Her heart begins to beat, every major organ begins, and the placenta takes root.",
      you: "Hormones rise quickly, bringing fatigue, nausea, and tenderness. The news can bring joy, fear, and old feelings to the surface.",
      lens: "She is present before anyone knows she is there. How she is welcomed, in thought, word, and feeling, is among the first things she takes in.",
      focus: "Welcome her, find one way to settle yourself, and gather the people who will support you.",
      when: "As early as you can, even before you feel ready." },
    { eb: "Part two · Weeks 14–27", t: "The Second<br>Trimester", sub: "The Middle", seg: [3, 6],
      lede: "Your baby begins to hear, you begin to feel her, and the relationship becomes something you can both sense.",
      baby: "Her movements grow coordinated, hearing begins around weeks 18 to 20, and she begins to respond to voices, touch, and sound.",
      you: "Energy often returns and your belly shows. Feeling her move can turn an idea into a relationship, and your thoughts begin to turn toward birth.",
      lens: "Her senses are opening, and relationship now runs both ways. When her movements and sounds are met, she learns she is heard.",
      focus: "Talk, sing, and answer her movements. Choose the stories you take in, and begin exploring your own birth story.",
      when: "Around weeks 10 to 13, just before this trimester begins." },
    { eb: "Part three · Weeks 28–40", t: "The Third<br>Trimester", sub: "The Ripening", seg: [6, 9],
      lede: "Your baby grows, space grows tight, and both of your bodies prepare for birth.",
      baby: "Her eyes open, dreaming sleep appears, and she comes to know your voice. Many babies settle head down, and her own lungs may help signal when labor begins.",
      you: "Sleep grows harder and practice contractions stronger. Anticipation grows, and so can fear. Choices about position, monitoring, and induction may arise.",
      lens: "She is preparing for birth alongside you. How choices are made, and the feeling in the room, may become part of how she arrives.",
      focus: "Slow down, plan your birth space and support, practice staying in the decisions, and prepare for flexibility, not fear.",
      when: "Around weeks 24 to 27, just before this trimester begins." },
    { eb: "Part four · Labor, birth, first hour", t: "Birth", sub: "The Threshold", seg: [9, 12],
      lede: "Hormones, the space, and the people present all shape how your baby arrives and how she is met.",
      baby: "Labor holds her in rhythm and pressure. Birth brings light, air, and sound all at once. The first hour brings your skin, your smell, and your voice.",
      you: "Oxytocin, endorphins, adrenaline, and prolactin carry you through, and they flow best when you feel safe, private, and unobserved.",
      lens: "Birth is her first great passage and her first welcome. Even when plans change, telling her what is happening and holding her close can soften what she meets.",
      focus: "Guard the space, tell her what is happening, and keep her close. If plans change, stay in the decisions and offer repair.",
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
      "Your own unresolved history, and the chemistry of your states, can reach her. What helps is a safe, trauma-informed space where you can share your story if you choose, and support when it feels big. How you nourish and rest yourself shapes her lifelong health, and small, steady steps count. Worry while waiting for screening results is natural, not a failure of trust.",
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
      "The emotional climate over time matters most: ongoing tension or neglect, or warmth and contact. What helps is a steady rhythm of calm, a doula or childbirth class that fits you, and the rest you need, asked for in plain words. If the screening leads to a diagnosis such as gestational diabetes, it is information to guide your care, not a judgment on your body. Disappointment is natural, and it can sit beside caring well for yourself.",
      "William Emerson's \"elephant in the birthing room\": everyone brings a birth story into the birth room. Oxytocin, the hormone of calm and connection, is easier to find in labor when it has been practiced in pregnancy (Strange)."],
    ["Card 7 · Third trimester · Weeks 28–31", "Month 7 · Light and Voices",
      "Her eyes open and can sense light through your belly. She is gaining fat, practicing breathing, and moving between clear sleep states. REM sleep appears now, the active sleep linked with dreaming, and she spends much of each day in it. The voices she hears most will be familiar after birth.",
      "The third trimester begins. Sleep grows harder, breath shorter, and practice contractions more noticeable, and prenatal visits come more often. Anticipation grows, and so can fear of birth.",
      "Fear in the room can become part of the birth: your own, your family's, or a provider's past cases. What helps is planning your birth space and choosing who will speak up for you; a doula can be a strong advocate at a hospital birth. It also helps to begin preparing for flexibility, not fear. Exploring other paths, such as a longer labor, an induction, or a cesarean, lets you meet a change as a choice rather than a collapse of the plan.",
      "Sarah Buckley's four hormone systems of birth: oxytocin for contractions and love, endorphins for easing pain, adrenaline for the final pushes, and prolactin for mothering. Your rights in labor: companions, freedom to move, food and drink, and informed consent (MFCI)."],
    ["Card 8 · Third trimester · Weeks 32–35", "Month 8 · The Turning",
      "She gains weight quickly and space grows tight, so her movements change from tumbling to stretching and pushing. Studies first show her responding to your voice differently from other voices, and after birth she prefers it. Antibodies cross the placenta to prepare her immune system, and many babies settle head down now.",
      "Your uterus presses up under your ribs and builds oxytocin receptors for labor, and your breasts may begin leaking colostrum. Nesting energy often arrives. If she is breech, a real decision lies ahead, and you deserve full information and room to choose.",
      "How decisions are made about her position and birth may shape her experience, and yours. What helps is practicing how you will stay in the decisions: asking about benefits, risks, and alternatives, taking a moment, and saying yes or no. A baby doula, someone who follows your baby's journey through birth, and help planned for the weeks after birth are also worth arranging now. Feeling unsure or pressured is common, and naming it lets you slow down.",
      "Breech options: waiting, gentle positioning, an external version, or a vaginal breech birth with a skilled provider (Fischbein and Freeze). Continuous monitoring in low-risk labors is linked to about 20 percent more cesareans; you can ask about listening in at intervals."],
    ["Card 9 · Third trimester · Weeks 36–40", "Month 9 · Ripening",
      "Her lungs finish maturing, and full term arrives at 39 to 40 weeks. Research suggests her own maturing lungs release a signal that helps start labor, so she may have a part in deciding when birth begins.",
      "She may drop lower, easing your breath but adding pressure. Practice contractions grow stronger and your cervix begins to soften. Waiting can be hard, especially as pressure to induce grows, and you may feel ready, impatient, or afraid, sometimes all in one day.",
      "Timing, and who is in charge, may become part of her story. Induction and augmentation can interrupt the natural rhythm of birth, and babies may feel interrupted or intruded upon. Labor usually begins when you are both ready, and induction is a choice to weigh, not an automatic step. What helps is an informed, unhurried decision, continuous support planned ahead, and a conversation about what you would want if plans change.",
      "The ARRIVE trial and elective induction at 39 weeks. Synthetic oxytocin does not act like your own and is linked to more postpartum depression and anxiety (Kroll-Desrosiers). Expressing colostrum after 37 weeks, with your provider's approval, helped milk flow sooner after birth (Singh)."],
    ["Card 10 · Birth · The opening", "Labor · The Threshold",
      "Contractions press and release her whole body like a long, firm embrace. Her own stress hormones surge, protecting her through each squeeze and preparing her lungs, and she receives some of your oxytocin and endorphins. Pressure, rhythm, and pause: the pace of labor becomes part of her story.",
      "Oxytocin brings rhythmic contractions, and beta-endorphin eases pain and carries you inward. You labor best when you can move, eat and drink lightly, and follow your body, and when you feel private, safe, and unobserved, much like lovemaking.",
      "Interruptions, such as induction, augmentation, and routine interventions, may be felt by her too. What helps is a guarded space: dim light, quiet, and only people you know and trust, with no routine procedures without a reason. Pain is a normal part of labor, but suffering is something else; choosing relief is a sound choice that needs no guilt. If plans change, three things help you stay present: someone by your side, clear explanations, and time to respond.",
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
        <h2>Imprints and what helps</h2><p>${m[4]}</p>
        <div class="box"><div class="lab">To explore further</div><p>${m[5]}</p></div>
        ${foot(n)}`);
    });
  });

  add("The heart of the practices", "", n => `
    <div class="eb">The heart of the practices</div>
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

  add("Help, reading, and sources", "dense", n => `
    <div class="eb">Resources</div>
    <h1>Help, reading, and sources</h1>
    <div class="box blush">
      <div class="lab">If you need support now (United States)</div>
      <p class="tight"><b>National Maternal Mental Health Hotline:</b> call or text 1-833-TLC-MAMA (1-833-852-6262).</p>
      <p class="tight"><b>Postpartum Support International HelpLine:</b> call or text 1-800-944-4773.</p>
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
    <div class="lab">Sources drawn on</div>
    <ul class="refs small">
      <li>Buckley, S. J. (2003). Undisturbed birth. <i>JOPPPAH, 17</i>(4).</li>
      <li>Center on the Developing Child, Harvard University. Toxic stress. Coalition for Improving Maternity Services. Mother-Friendly Childbirth Initiative.</li>
      <li>Dana, D. (2018). <i>The Polyvagal Theory in Therapy</i>. DeCasper, A. J., and Fifer, W. P. (1980). <i>Science, 208</i>.</li>
      <li>DeCasper, A. J., and Spence, M. J. (1986). <i>Infant Behavior and Development, 9</i>.</li>
      <li>Davis-Floyd, R. (2022). <i>Birth as an American Rite of Passage</i> (2nd ed.).</li>
      <li>Emerson, W. The Elephant in the Birthing Room.</li>
      <li>Fischbein, S. J., and Freeze, R. (2018). <i>BMC Pregnancy and Childbirth, 18</i>, 397.</li>
      <li>Ham, J. T., and Klimo, J. (2000). Fetal awareness of maternal emotional states. <i>JOPPPAH, 15</i>(2).</li>
      <li>Kroll-Desrosiers, A. R., et al. (2017). <i>Depression and Anxiety, 34</i>(2). Levine, P. A. (1997). <i>Waking the Tiger</i>.</li>
      <li>Mennella, J. A., Jagnow, C. P., and Beauchamp, G. K. (2001). <i>Pediatrics, 107</i>(6). Porges, S. W. (2011). <i>The Polyvagal Theory</i>.</li>
      <li>Lorenz, K. (1935). Der Kumpan in der Umwelt des Vogels. Rank, O. (1924). <i>The Trauma of Birth</i>.</li>
      <li>Nathanielsz, P. W. <i>Life in the Womb</i>. Raffai, J. (2021). Parental conflict and the intrauterine realm.</li>
      <li>Seng, J., and Taylor, J. (2015). <i>Trauma Informed Care in the Perinatal Period</i>. Siegel, D. J. <i>The Developing Mind</i>.</li>
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
    <p class="backs">Twelve cards and a guidebook for the journey of pregnancy and birth, drawn from the Pregnancy and Birth Mandala and the lens of pre- and perinatal education.</p>
    <div class="backf">
      <p>Created by Erin Singleton as part of APPPAH's Prenatal &amp; Perinatal Educator certification.</p>
      <p>An educational companion, not medical advice. Talk with your care provider about your own pregnancy.</p>
    </div>`);

  /* ---- the contents page, built from the pages themselves ---- */
  const GROUPS = [
    ["Beginning", ["Key to the mandala", "Welcome"]],
    ["Foundations · The pre- and perinatal lens", ["The pre- and perinatal lens", "What is an imprint?", "Memory before words", "Trauma and resilience", "Your nervous system", "Resourcing yourself", "Why it matters", "How each month is read"]],
    ["Using this guide", ["Using the cards"]],
    ["Part one · The first trimester", [PART_TITLES[0], ...MONTHS.slice(0, 3).map(m => m[1])]],
    ["Part two · The second trimester", [PART_TITLES[1], ...MONTHS.slice(3, 6).map(m => m[1])]],
    ["Part three · The third trimester", [PART_TITLES[2], ...MONTHS.slice(6, 9).map(m => m[1])]],
    ["Part four · Birth", [PART_TITLES[3], ...MONTHS.slice(9, 12).map(m => m[1])]],
    ["Going deeper", ["The heart of the practices", "People who can walk with you", "My circles of support", "Help, reading, and sources", "Notes"]]];
  function contents(n) {
    return `
    <div class="eb">Contents</div>
    <h1 class="ct">Inside this guide</h1>
    <div class="cols">${GROUPS.map(([h, items]) => `<div class="grp"><div class="lab">${h}</div><ul class="toc">${items.map(t => {
      const i = no(t);
      return `<li data-go="${i}"${PART_TITLES.includes(t) ? ' class="b"' : ""}><span>${t}</span><span>${i}</span></li>`;
    }).join("")}</ul></div>`).join("")}</div>
    ${foot(n)}`;
  }

  const numbered = p => !/\b(cover|endpaper|backcover|frontis|halftitle|blank)\b/.test(p.cls);
  window.GUIDE = P.map((p, i) => ({ title: p.title, cls: p.cls, num: numbered(p) ? i : null, html: p.html(i) }));
})();
