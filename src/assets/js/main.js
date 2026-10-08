/* Brain Industries — progressive enhancement. The site works without JavaScript. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 60.0625em)").addEventListener("change", (e) => e.matches && setOpen(false));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Data-driven widths (bars) — set via CSSOM to respect the CSP ---------- */
  document.querySelectorAll("[data-w]").forEach((el) => { el.style.width = `${el.dataset.w}%`; });

  /* ---------- Card spotlight ---------- */
  document.querySelectorAll("[data-spotlight]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Mobile action bar: appears after the first screen ---------- */
  const bar = document.querySelector("[data-mobile-bar]");
  if (bar) {
    const onScroll = () => bar.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Ex quick reference ---------- */
  document.querySelectorAll("[data-exref]").forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll("[data-zone-panel]"));
    panels.forEach((p) => { if (p.hasAttribute("data-hide")) p.hidden = true; });
    const select = (tab, focus) => {
      tabs.forEach((t) => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
      panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute("aria-controls"); });
      if (focus) tab.focus();
    };
    tabs.forEach((t) => {
      t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
        const vis = tabs.filter((x) => !x.hidden);
        const i = vis.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1);
        select(vis[(i + vis.length) % vis.length], true);
      });
    });
    root.querySelectorAll("[data-medium-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = btn.dataset.mediumBtn;
        root.querySelectorAll("[data-medium-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        tabs.forEach((t) => { t.hidden = t.dataset.medium !== m; });
        root.querySelectorAll("[data-group-medium]").forEach((g) => { g.hidden = g.dataset.groupMedium !== m; });
        select(tabs.find((t) => t.dataset.medium === m));
      });
    });
  });

  /* ---------- InspectX device walkthrough ---------- */
  document.querySelectorAll("[data-ix-demo]").forEach((root) => {
    const steps = Array.from(root.querySelectorAll("[data-ix-step]"));
    const screens = Array.from(root.querySelectorAll(".screen"));
    const DUR = 5000;
    let idx = 0, timer = null, auto = !reduceMotion, inView = false;
    root.style.setProperty("--ix-dur", `${DUR}ms`);
    const show = (i, focus) => {
      idx = (i + steps.length) % steps.length;
      steps.forEach((s, j) => {
        const on = j === idx;
        s.setAttribute("aria-selected", String(on));
        s.tabIndex = on ? 0 : -1;
        const bar = s.querySelector(".ix-progress i");
        bar.classList.remove("run");
        if (on && auto && inView) { void bar.offsetWidth; bar.classList.add("run"); }
      });
      screens.forEach((sc, j) => sc.classList.toggle("is-active", j === idx));
      if (focus) steps[idx].focus();
      schedule();
    };
    const schedule = () => {
      clearTimeout(timer);
      if (auto && inView) timer = setTimeout(() => show(idx + 1), DUR);
    };
    const stopAuto = () => { auto = false; clearTimeout(timer); root.querySelectorAll(".ix-progress i").forEach((b) => b.classList.remove("run")); };
    steps.forEach((s, j) => {
      s.addEventListener("click", () => { stopAuto(); show(j); });
      s.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); stopAuto(); show(idx + 1, true); }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); stopAuto(); show(idx - 1, true); }
      });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { inView = en.isIntersecting; show(idx); }, { threshold: 0.35 }).observe(root);
    }
    show(0);
  });

  /* ---------- Gallery: filter + lightbox ---------- */
  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const items = Array.from(gallery.querySelectorAll("[data-category]"));
    const buttons = document.querySelectorAll("[data-filter]");
    const status = document.querySelector("[data-filter-status]");
    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        const f = btn.dataset.filter;
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        let shown = 0;
        items.forEach((it) => {
          const show = f === "all" || it.dataset.category === f;
          it.hidden = !show;
          if (show) shown++;
        });
        if (status) status.textContent = `Showing ${shown} image${shown === 1 ? "" : "s"}`;
      })
    );

    const dialog = document.querySelector("[data-lightbox]");
    if (dialog && typeof dialog.showModal === "function") {
      const img = dialog.querySelector("img");
      const caption = dialog.querySelector("[data-lightbox-caption]");
      let index = -1;
      const visible = () => items.filter((it) => !it.hidden);
      const show = (i) => {
        const list = visible();
        index = (i + list.length) % list.length;
        const link = list[index].querySelector("a");
        img.src = link.href;
        img.alt = link.querySelector("img").alt;
        caption.textContent = link.dataset.caption || "";
      };
      gallery.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-lightbox-link]");
        if (!link) return;
        e.preventDefault();
        show(visible().indexOf(link.closest("[data-category]")));
        dialog.showModal();
      });
      dialog.querySelector("[data-prev]").addEventListener("click", () => show(index - 1));
      dialog.querySelector("[data-next]").addEventListener("click", () => show(index + 1));
      dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
      });
      dialog.addEventListener("close", () => { img.removeAttribute("src"); });
    }
  }

  /* ---------- Contact form ---------- */
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const statusBox = form.querySelector("[data-form-status]");
    const submitBtn = form.querySelector("[type=submit]");
    const accessKey = form.dataset.accessKey;
    const fallbackEmail = form.dataset.fallbackEmail;

    // Pre-select enquiry type from ?enquiry=slug
    const pre = new URLSearchParams(location.search).get("enquiry");
    if (pre) {
      const sel = form.querySelector("#f-enquiry");
      const opt = sel && Array.from(sel.options).find((o) => o.dataset.slug === pre);
      if (opt) sel.value = opt.value;
    }

    const messages = {
      valueMissing: "This field is required.",
      typeMismatch: "Please enter a valid email address.",
      tooShort: "Please add a little more detail.",
      patternMismatch: "Please enter a valid phone number.",
    };
    const validateField = (field) => {
      const err = form.querySelector(`#${field.id}-error`);
      let msg = "";
      if (!field.validity.valid) {
        for (const k of Object.keys(messages)) if (field.validity[k]) { msg = messages[k]; break; }
        if (!msg) msg = field.validationMessage;
        if (field.type === "checkbox") msg = "Please confirm that you have read the privacy notice.";
      }
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return !msg;
    };
    const fields = Array.from(form.querySelectorAll("input:not(.hp input), select, textarea")).filter((f) => f.id);
    fields.forEach((f) => {
      f.addEventListener("blur", () => f.value && validateField(f));
      f.addEventListener("input", () => f.getAttribute("aria-invalid") === "true" && validateField(f));
    });

    const setStatus = (type, html) => {
      statusBox.className = `form-status is-${type}`;
      statusBox.innerHTML = html;
      statusBox.hidden = false;
      statusBox.focus();
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const invalid = fields.filter((f) => !validateField(f));
      if (invalid.length) { invalid[0].focus(); return; }

      const data = Object.fromEntries(new FormData(form));
      if (data.botcheck) return; // honeypot filled — silently drop

      const subject = `Website enquiry: ${data.enquiry || "General"}${data.company ? " — " + data.company : ""}`;

      // No form key configured yet: fall back to the visitor's email client.
      if (!accessKey) {
        const body = [
          `Name: ${data.name}`, `Company: ${data.company || "-"}`, `Email: ${data.email}`,
          `Phone: ${data.phone || "-"}`, `Enquiry type: ${data.enquiry}`, "", data.message,
        ].join("\n");
        location.href = `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setStatus("info", `Your email application should open with your message ready to send. If it doesn’t, email us at <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`);
        return;
      }

      submitBtn.setAttribute("aria-busy", "true");
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject,
            from_name: "Brain Industries website",
            replyto: data.email,
            name: data.name,
            company: data.company,
            email: data.email,
            phone: data.phone,
            enquiry_type: data.enquiry,
            message: data.message,
            botcheck: "",
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success) {
          form.reset();
          fields.forEach((f) => f.removeAttribute("aria-invalid"));
          setStatus("success", "Thank you — your enquiry has been sent. We will respond as soon as possible.");
        } else {
          throw new Error(json.message || "Submission failed");
        }
      } catch (err) {
        setStatus("error", `Sorry, your message could not be sent. Please try again, or email us directly at <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`);
      } finally {
        submitBtn.removeAttribute("aria-busy");
      }
    });
  }
})();
