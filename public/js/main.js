(function () {
  const adminShell = document.getElementById("admin-shell");
  if (!adminShell) return;

  const navLinks = Array.from(adminShell.querySelectorAll(".admin-nav-link[data-target]"));
  const jumpLinks = Array.from(adminShell.querySelectorAll(".admin-jump-link[data-target]"));
  const panes = Array.from(adminShell.querySelectorAll(".admin-pane[data-pane]"));
  if (!panes.length) return;

  const paneIds = new Set(panes.map((pane) => pane.dataset.pane));
  const defaultPaneId = "admin-overview";

  const showPane = (paneId) => {
    panes.forEach((pane) => {
      const isActive = pane.dataset.pane === paneId;
      pane.hidden = !isActive;
      pane.classList.toggle("is-active", isActive);
    });

    navLinks.forEach((link) => {
      const isActive = link.dataset.target === paneId;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  const initialHash = window.location.hash.replace("#", "");
  const initialPane = paneIds.has(initialHash) ? initialHash : defaultPaneId;
  showPane(initialPane);

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.dataset.target;
      if (!paneIds.has(targetId)) return;

      showPane(targetId);
      history.replaceState(null, "", `#${targetId}`);
    });
  });

  jumpLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.dataset.target;
      if (!paneIds.has(targetId)) return;

      showPane(targetId);
      history.replaceState(null, "", `#${targetId}`);
    });
  });
})();

(function () {
  const crudCards = Array.from(document.querySelectorAll(".event-crud-item, .admin-fold-item"));
  if (!crudCards.length) return;

  crudCards.forEach((card) => {
    card.addEventListener("toggle", () => {
      if (!card.open) return;
      const activeGroup = card.dataset.foldGroup || "default";
      crudCards.forEach((other) => {
        const otherGroup = other.dataset.foldGroup || "default";
        if (other !== card && otherGroup === activeGroup) other.open = false;
      });
    });
  });
})();

(function () {
  const searchInput = document.getElementById("manage-members-search");
  const searchForm = document.getElementById("manage-members-form");
  const list = document.getElementById("manage-members-list");
  const empty = document.getElementById("manage-members-empty");
  if (!searchInput || !list) return;

  const normalize = (value) => (value || "").toLowerCase().trim();

  const getSearchText = (card) => {
    const name = card.querySelector(".manage-member-name")?.textContent || "";
    const nick = card.querySelector(".manage-member-nick")?.textContent || "";
    const email = card.querySelector(".manage-member-email")?.textContent || "";
    const fallback = card.dataset.searchText || "";
    return normalize(`${name} ${nick} ${email} ${fallback}`);
  };

  const filter = () => {
    const terms = normalize(searchInput.value).split(/\s+/).filter(Boolean);
    const cards = Array.from(list.querySelectorAll(".manage-member-item"));
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = getSearchText(card);
      const match = !terms.length || terms.every((term) => text.includes(term));
      card.style.display = match ? "" : "none";
      if (match) visibleCount += 1;
    });

    if (empty) empty.hidden = visibleCount !== 0;
  };

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      filter();
    });
  }

  ["input", "keyup", "search", "change"].forEach((eventName) => searchInput.addEventListener(eventName, filter));
  filter();
})();

(function () {
  const searchInput = document.getElementById("event-join-search");
  const searchForm = document.getElementById("event-join-search-form");
  const empty = document.getElementById("event-join-empty");
  const items = Array.from(document.querySelectorAll(".event-join-item[data-search-text]"));
  if (!searchInput || !items.length) return;

  const normalize = (value) => (value || "").toLowerCase().trim();
  const filter = () => {
    const terms = normalize(searchInput.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    items.forEach((item) => {
      const text = normalize(item.dataset.searchText || "");
      const match = !terms.length || terms.every((t) => text.includes(t));
      item.style.display = match ? "" : "none";
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      filter();
    });
  }

  ["input", "keyup", "search", "change"].forEach((eventName) => searchInput.addEventListener(eventName, filter));
  filter();
})();

(function () {
  const searchInput = document.getElementById("friends-search");
  const searchForm = document.getElementById("friends-search-form");
  const empty = document.getElementById("friends-empty");
  const cards = Array.from(document.querySelectorAll(".friend-card[data-search-text]"));
  if (!searchInput || !cards.length) return;

  const normalize = (value) => (value || "").toLowerCase().trim();
  const filter = () => {
    const terms = normalize(searchInput.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach((card) => {
      const text = normalize(card.dataset.searchText || "");
      const match = !terms.length || terms.every((t) => text.includes(t));
      card.style.display = match ? "" : "none";
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      filter();
    });
  }

  ["input", "keyup", "search", "change"].forEach((eventName) => searchInput.addEventListener(eventName, filter));
  filter();
})();

(function () {
  const sideToggleButtons = document.querySelectorAll(".side-toggle[data-target]");
  sideToggleButtons.forEach((btn) => {
    const targetId = btn.getAttribute("data-target");
    const side = document.getElementById(targetId);
    if (!side) return;

    const closeSide = () => {
      side.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    };

    const openSide = () => {
      side.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (side.classList.contains("open")) closeSide();
      else openSide();
    });

    document.addEventListener("click", (e) => {
      if (!side.classList.contains("open")) return;
      if (side.contains(e.target) || btn.contains(e.target)) return;
      closeSide();
    });

    side.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.innerWidth <= 900) closeSide();
      });
    });
  });
})();

(function () {
  const toggleBtn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (toggleBtn && nav) {
    const closeNav = () => {
      nav.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    };

    const openNav = () => {
      nav.classList.add("open");
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    };

    toggleBtn.addEventListener("click", () => {
      if (nav.classList.contains("open")) closeNav();
      else openNav();
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || toggleBtn.contains(e.target)) return;
      closeNav();
    });

    nav.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => {
        if (window.innerWidth <= 900) closeNav();
      });
    });
  }
})();

(function () {
  const carousels = document.querySelectorAll("[data-carousel]");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const dots = Array.from(carousel.querySelectorAll(".carousel-dot"));
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");
    if (!slides.length) return;

    let index = 0;
    let timer;

    const render = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => render(index + 1), 4200);
    };

    prevBtn?.addEventListener("click", () => {
      render(index - 1);
      play();
    });

    nextBtn?.addEventListener("click", () => {
      render(index + 1);
      play();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        render(i);
        play();
      });
    });

    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", play);

    render(0);
    play();
  });
})();
