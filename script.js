(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const mobileMenu = document.getElementById("mobileMenu");
  const year = document.getElementById("year");
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");
  const toast = document.getElementById("toast");
  const toTop = document.getElementById("toTop");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalStack = document.getElementById("modalStack");
  const modalDesc = document.getElementById("modalDesc");
  const modalPoints = document.getElementById("modalPoints");

  // ── Scroll-reveal ─────────────────────────────────────────────
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    for (const el of revealEls) revealObserver.observe(el);
  } else {
    for (const el of revealEls) el.classList.add("is-visible");
  }

  // ── Skill-bar animation ────────────────────────────────────────
  const skillSections = document.querySelectorAll(".skill-card, .skill");
  if ("IntersectionObserver" in window && skillSections.length) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".skillbar__fill").forEach((fill) => {
              fill.closest(".skillbar__track")
                ?.closest(".skill-card, .skill")
                ?.classList.add("skillbars-animated");
            });
            entry.target.classList.add("skillbars-animated");
            barObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 }
    );
    for (const el of skillSections) barObserver.observe(el);
  }

  // ── Stat counter ───────────────────────────────────────────────
  const statEls = document.querySelectorAll(".stat__value");
  function animateCounter(el) {
    const raw = el.textContent.trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return; // skip ∞ or non-numeric
    const suffix = raw.replace(String(Math.round(num)), "");
    const duration = 900;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.ceil(eased * num) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && statEls.length) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            statObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 }
    );
    for (const el of statEls) statObserver.observe(el);
  }

  if (year) year.textContent = String(new Date().getFullYear());

  const storageKey = "portfolio.theme";
  let toastTimer = null;

  function announce(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function setTheme(next) {
    if (next === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");

    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }

    const icon = themeToggle?.querySelector(".icon-btn__icon");
    if (icon) icon.textContent = next === "light" ? "☀" : "☾";
  }

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // ignore
    }

    const prefersLight =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  }

  setTheme(getInitialTheme());

  themeToggle?.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    setTheme(isLight ? "dark" : "light");
  });

  // Mobile drawer
  let lastFocused = null;
  function setDrawerOpen(open) {
    if (!mobileMenu) return;
    const nextOpen = Boolean(open);
    if (nextOpen) {
      lastFocused = document.activeElement;
      mobileMenu.hidden = false;
      menuToggle?.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      mobileMenu.querySelector(".drawer__link")?.focus();
    } else {
      mobileMenu.hidden = true;
      menuToggle?.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
  }

  menuToggle?.addEventListener("click", () => setDrawerOpen(true));
  menuClose?.addEventListener("click", () => setDrawerOpen(false));
  mobileMenu
    ?.querySelector(".drawer__backdrop")
    ?.addEventListener("click", () => setDrawerOpen(false));
  mobileMenu?.addEventListener("click", (e) => {
    const link = e.target?.closest?.("a");
    if (link) setDrawerOpen(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (mobileMenu && !mobileMenu.hidden) setDrawerOpen(false);
    }
  });

  // Copy email
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  copyEmailBtn?.addEventListener("click", async () => {
    const email = copyEmailBtn.getAttribute("data-copy") || "you@example.com";
    const ok = await copyText(email);
    announce(ok ? "Email copied." : "Couldn’t copy email.");
  });

  // Back to top
  function updateToTop() {
    if (!toTop) return;
    const show = window.scrollY > 700;
    toTop.hidden = !show;
  }
  updateToTop();
  window.addEventListener("scroll", updateToTop, { passive: true });
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Scroll-spy active nav link
  const sectionIds = ["projects", "experience", "skills", "about", "contact"];
  const navLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));

  function clearActive() {
    for (const a of navLinks) {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    }
  }

  function setActive(id) {
    for (const a of navLinks) {
      const href = a.getAttribute("href");
      const active = href === `#${id}`;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  function updateNavActiveNearTop() {
    const projects = document.getElementById("projects");
    if (!projects) return;
    const threshold = projects.offsetTop - 120;
    if (window.scrollY < threshold) clearActive();
  }

  updateNavActiveNearTop();
  window.addEventListener("scroll", updateNavActiveNearTop, { passive: true });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target?.id;
        if (id) setActive(id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0.05, 0.15, 0.25, 0.35] }
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
  }

  // Project modal
  function openProjectModal(article) {
    if (!modal || !(modal instanceof HTMLDialogElement)) return;
    const title = article.getAttribute("data-title") || "Project";
    const desc = article.getAttribute("data-desc") || "";
    const stack = article.getAttribute("data-stack") || "";
    const points = (article.getAttribute("data-points") || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalStack) modalStack.textContent = stack;

    if (modalPoints) {
      modalPoints.innerHTML = "";
      for (const p of points) {
        const li = document.createElement("li");
        li.textContent = p;
        modalPoints.appendChild(li);
      }
    }

    modal.showModal();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-project-open]");
    if (!btn) return;
    const article = btn.closest?.("[data-project]");
    if (article) openProjectModal(article);
  });

  // Formspree submit (Option A): sends to your email without leaving the page.
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !email || !message) {
      if (hint) hint.textContent = "Please fill out all fields.";
      announce("Please fill out all fields.");
      return;
    }

    const endpoint = form.getAttribute("action") || "";
    if (!endpoint || endpoint.includes("yourFormId")) {
      if (hint) hint.textContent = "Form not configured yet. Add your Formspree form ID.";
      announce("Form not configured yet.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const prevText = submitBtn?.textContent || "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Request failed");

      if (hint) hint.textContent = "Thanks! Your message has been sent.";
      announce("Message sent.");
      form.reset();
    } catch {
      if (hint) hint.textContent = "Could not send message. Please try again.";
      announce("Send failed.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText || "Send Message";
      }
    }
  });
})();