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
