/* Shared behavior: header, nav, reveals, counters, resume dialog, contact form */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header scroll state */
  const head = $("[data-head]");
  if (head) {
    const onScroll = () => head.classList.toggle("scrolled", scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile nav */
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
      if (open) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      }
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    addEventListener("keydown", (e) => {
      if (!nav.classList.contains("open")) return;
      if (e.key === "Escape") {
        setOpen(false);
        toggle.focus();
        return;
      }
      /* keep Tab inside the open overlay (links + toggle) */
      if (e.key === "Tab") {
        const cycle = [...nav.querySelectorAll("a"), toggle];
        const i = cycle.indexOf(document.activeElement);
        e.preventDefault();
        if (i === -1) { cycle[0].focus(); return; }
        cycle[(i + (e.shiftKey ? -1 : 1) + cycle.length) % cycle.length].focus();
      }
    });
    /* close if the viewport leaves the mobile-overlay breakpoint */
    const mq = matchMedia("(min-width: 861px)");
    mq.addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* scroll reveals (wipe headings only; everything else renders immediately) */
  const revealEls = $$('[data-reveal="wipe"]');
  if (prefersReduce || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-on"));
  } else {
    /* threshold must be 0: wipe reveals are fully clipped, so their
       intersection ratio stays 0 until revealed (clip-path shrinks the
       intersection rect); any ratio threshold would never fire for them */
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add("is-on");
          io.unobserve(en.target);
        }
      }
    }, { threshold: 0, rootMargin: "0px 0px -48px 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* stat counters */
  const counters = $$("[data-count]");
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        const el = en.target;
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        if (prefersReduce || !Number.isFinite(end)) {
          el.textContent = end + suffix;
          return;
        }
        const t0 = performance.now();
        const dur = 900;
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* footer year */
  const yr = $("#yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* resume dialog */
  const dlg = $("#resume-dialog");
  if (dlg) {
    $$("[data-open-resume]").forEach((b) => b.addEventListener("click", () => dlg.showModal()));
    const closeBtn = $("[data-close-resume]", dlg);
    if (closeBtn) closeBtn.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => {
      /* backdrop clicks target the dialog element itself; the target guard also
         keeps keyboard-activated clicks (0,0 coords in Firefox) from closing */
      if (e.target !== dlg) return;
      const r = dlg.getBoundingClientRect();
      const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside) dlg.close();
    });
  }

  /* contact form */
  const form = $("#job-form");
  if (form) {
    const status = $("#form-status");
    const say = (cls, msg) => { status.className = "form-status " + cls; status.textContent = msg; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        say("err", "The form isn't set up yet. Please call or email instead.");
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say("", "Sending…");
      try {
        const res = await fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say("ok", "Message sent. Ara will get back to you.");
      } catch (err) {
        say("err", "Something went wrong. Please email ara@brodjianpiping.com or call.");
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
