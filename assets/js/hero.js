/* Hero scene: the company logo brought to life. The welder figure (a contour
   trace of the logo, loaded from assets/img/welder-lines.svg) leans in to the
   work, strikes an arc, sparks fly, then leans back. The canvas overlay
   carries the arc glow and spark particles. */
(() => {
  "use strict";
  const svg = document.getElementById("welder-svg");
  const canvas = document.getElementById("welder-fx");
  if (!svg || !canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scene constants (logo coordinate space; viewBox is "290 20 1080 1000") */
  const VB = { x: 290, y: 20, w: 1080, h: 1000 };
  const PIVOT = { x: 1140, y: 900 };  // lower right of the figure
  const WP = { x: 352, y: 800 };      // torch tip / arc point
  const LENS = { x: 530, y: 452 };    // hood lens, glows through the cutout
  const BACK_ANGLE = 7;               // degrees, leaned away from the work

  const PHASES = [
    ["rest", 0.9],
    ["lean-in", 0.9],
    ["strike", 0.16],
    ["weld", 2.7],
    ["stop", 0.25],
    ["lean-back", 0.95]
  ];
  const LOOP = PHASES.reduce((s, p) => s + p[1], 0);

  /* canvas bleed (logo units): sparks fly past the scene box, so the fx
     canvas extends beyond it or streaks would clip at an invisible edge */
  const BLEED = { l: 340, t: 160, r: 140, b: 160 };

  let welder = null, lensGlow = null;
  let W = 0, H = 0, scale = 1;
  let clock = 0, lastT = 0, rafId = 0;
  let sparks = [];

  const easeInOut = (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  function size() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const sceneW = Math.max(160, rect.width);
    const sceneH = rect.height || (sceneW * VB.h / VB.w);
    scale = sceneW / VB.w;
    W = sceneW + (BLEED.l + BLEED.r) * scale;
    H = sceneH + (BLEED.t + BLEED.b) * scale;
    canvas.style.left = (-BLEED.l * scale) + "px";
    canvas.style.top = (-BLEED.t * scale) + "px";
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const sx = (x) => (x - VB.x + BLEED.l) * scale;
  const sy = (y) => (y - VB.y + BLEED.t) * scale;

  function phaseAt(t) {
    let m = t % LOOP;
    for (const [name, dur] of PHASES) {
      if (m < dur) return { name, p: m / dur };
      m -= dur;
    }
    return { name: "rest", p: 0 };
  }

  function angleAt(t) {
    const { name, p } = phaseAt(t);
    switch (name) {
      case "rest": return BACK_ANGLE;
      case "lean-in": return BACK_ANGLE * (1 - easeInOut(p));
      case "strike": return 0;
      case "weld": return 0.35 * Math.sin(t * 9) * Math.sin(t * 4.3); // steady hand
      case "stop": return 0;
      case "lean-back": return BACK_ANGLE * easeInOut(p);
    }
    return BACK_ANGLE;
  }

  function arcAt(t) {
    const { name, p } = phaseAt(t);
    if (name === "strike") return 1.5 - 0.5 * p;
    if (name === "weld") return 1;
    if (name === "stop") return 1 - p;
    return 0;
  }

  function drawFx(t) {
    ctx.clearRect(0, 0, W, H);
    const arc = arcAt(t);
    const wx = sx(WP.x), wy = sy(WP.y);

    if (arc > 0.01) {
      const flick = reduce ? 1 : (0.78 + 0.22 * Math.abs(Math.sin(t * 43) * Math.sin(t * 16.7)));
      const a = Math.min(arc, 1.5) * flick;
      const R = 230 * scale;

      /* ambient blue cast over the figure */
      let g = ctx.createRadialGradient(wx, wy, 0, wx, wy, R);
      g.addColorStop(0, `rgba(125,185,255,${0.22 * a})`);
      g.addColorStop(0.55, `rgba(125,185,255,${0.07 * a})`);
      g.addColorStop(1, "rgba(125,185,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(wx - R, wy - R, R * 2, R * 2);

      /* warm center */
      const r2 = 70 * scale;
      g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r2);
      g.addColorStop(0, `rgba(255,199,124,${0.6 * a})`);
      g.addColorStop(1, "rgba(255,199,124,0)");
      ctx.fillStyle = g;
      ctx.fillRect(wx - r2, wy - r2, r2 * 2, r2 * 2);

      /* white-hot core */
      const r3 = 26 * scale;
      g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r3);
      g.addColorStop(0, `rgba(255,255,255,${Math.min(1, a)})`);
      g.addColorStop(0.45, `rgba(215,235,255,${0.8 * a})`);
      g.addColorStop(1, "rgba(215,235,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(wx, wy, r3, 0, Math.PI * 2);
      ctx.fill();
    }

    /* sparks (physics in logo units, drawn scaled) */
    for (const s of sparks) {
      const lifeP = (t - s.born) / s.life;
      if (lifeP >= 1) continue;
      const x = sx(s.x), y = sy(s.y);
      const tx = sx(s.x - s.vx * 0.03), ty = sy(s.y - s.vy * 0.03);
      ctx.strokeStyle = lifeP < 0.55
        ? "rgba(255,224,160," + (1 - lifeP) + ")"
        : "rgba(255,157,90," + (1 - lifeP) + ")";
      ctx.lineWidth = Math.max(1, s.size * scale * 3);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function step(now) {
    const dt = Math.min((now - lastT) / 1000 || 0, 0.05);
    lastT = now;
    clock += dt;

    const arc = arcAt(clock);
    welder.setAttribute("transform", `rotate(${angleAt(clock).toFixed(2)} ${PIVOT.x} ${PIVOT.y})`);
    if (lensGlow) {
      lensGlow.setAttribute("fill-opacity", arc > 0.01
        ? (0.5 + 0.4 * Math.min(arc, 1) * (0.7 + 0.3 * Math.sin(clock * 37))).toFixed(2)
        : "0");
    }

    if (arc > 0.15 && sparks.length < 140) {
      const n = 2 + Math.floor(Math.random() * 3) + (arc > 1 ? 3 : 0);
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
        const sp = (240 + Math.random() * 640) * (Math.random() < 0.7 ? 1 : 0.45);
        sparks.push({
          x: WP.x + (Math.random() - 0.5) * 10,
          y: WP.y + (Math.random() - 0.5) * 8,
          vx: Math.cos(ang) * sp * (Math.random() < 0.6 ? -1 : 1) * 0.8,
          vy: Math.sin(ang) * sp,
          born: clock,
          life: 0.3 + Math.random() * 0.5,
          size: Math.random() < 0.12 ? 0.9 : 0.55
        });
      }
    }
    for (const s of sparks) {
      s.vy += 1000 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    sparks = sparks.filter((s) => clock - s.born < s.life && s.y < VB.y + VB.h - 6);

    drawFx(clock);
    rafId = requestAnimationFrame(step);
  }

  function start() {
    cancelAnimationFrame(rafId);
    lastT = performance.now();
    rafId = requestAnimationFrame(step);
  }

  function boot(figureSvg) {
    const doc = new DOMParser().parseFromString(figureSvg, "image/svg+xml");
    const frame = doc.getElementById("frame");
    const figure = doc.getElementById("figure");
    if (!figure) return;

    if (frame) svg.appendChild(document.importNode(frame, true));

    const NS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(NS, "defs");
    const grad = document.createElementNS(NS, "radialGradient");
    grad.setAttribute("id", "lens-grad");
    [["0%", "#cfe6ff", "1"], ["45%", "#7dc0ff", "0.75"], ["100%", "#7dc0ff", "0"]].forEach(([o, c, op]) => {
      const stop = document.createElementNS(NS, "stop");
      stop.setAttribute("offset", o);
      stop.setAttribute("stop-color", c);
      stop.setAttribute("stop-opacity", op);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    welder = document.createElementNS(NS, "g");
    lensGlow = document.createElementNS(NS, "ellipse");
    lensGlow.setAttribute("cx", LENS.x);
    lensGlow.setAttribute("cy", LENS.y);
    lensGlow.setAttribute("rx", 105);
    lensGlow.setAttribute("ry", 72);
    lensGlow.setAttribute("fill", "url(#lens-grad)");
    lensGlow.setAttribute("fill-opacity", "0");
    /* layer order inside the rotating group: opaque blocker silhouette,
       then the lens glow, then the linework, so the glow shines through
       the lens cutout but never through the blocker */
    const fig = document.importNode(figure, true);
    const lines = fig.querySelector("#lines");
    if (lines) fig.insertBefore(lensGlow, lines);
    else fig.appendChild(lensGlow);
    welder.appendChild(fig);
    svg.appendChild(welder);

    size();
    /* debug: /?pose=weld starts the loop mid-weld */
    if (new URLSearchParams(location.search).get("pose") === "weld") {
      clock = PHASES[0][1] + PHASES[1][1] + PHASES[2][1] + 0.1;
    }
    if (reduce) {
      /* static welding pose with a calm glow, no sparks */
      welder.setAttribute("transform", `rotate(0 ${PIVOT.x} ${PIVOT.y})`);
      lensGlow.setAttribute("fill-opacity", "0.55");
      clock = PHASES[0][1] + PHASES[1][1] + PHASES[2][1] + 0.5;
      drawFx(clock);
    } else {
      start();
    }
  }

  fetch("assets/img/welder-lines.svg")
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
    .then(boot)
    .catch(() => { /* no scene; the hero still stands on its own */ });

  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      size();
      if (reduce) drawFx(clock);
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!reduce && welder && !rafId) {
      start();
    }
  });
})();
