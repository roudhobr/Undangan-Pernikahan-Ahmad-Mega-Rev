(() => {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  if (window.location.hash) {
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (e) {}
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;

  const data = window.INVITATION;
  if (!data) return;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const body = document.body;
  const cover = $("#cover");
  const main = $("#main");
  const nav = $("#bottomNav");
  const musicButton = $("#musicToggle");
  const audio = $("#bgm");

  document.documentElement.classList.add("js-reveal");

  try {
    if (body) {
      body.classList.remove("is-open");
      body.classList.add("is-locked");
    }
    if (cover) {
      cover.classList.remove("is-open");
      cover.hidden = false;
    }
    if (main) {
      main.setAttribute("inert", "");
      main.setAttribute("aria-hidden", "true");
      main.removeAttribute("tabindex");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  } catch (e) {}

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      try {
        if ("scrollRestoration" in history) {
          history.scrollRestoration = "manual";
        }
        if (window.location.hash) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        window.location.reload();
        return;
      } catch (e) {
        window.location.reload();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });

  const normalizeGuestName = (value) =>
    String(value || "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getGuestName = () => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normalizeGuestName(params.get("untuk") || params.get("to"));
    let stored = "";
    try {
      stored = normalizeGuestName(window.sessionStorage.getItem("guestName"));
    } catch (error) {
      stored = "";
    }
    const name = fromUrl || stored || "Tamu Undangan";
    if (fromUrl) {
      try {
        window.sessionStorage.setItem("guestName", fromUrl);
      } catch (error) {
        return name;
      }
    }
    return name;
  };

  const guestName = getGuestName();

  const setText = (selector, value) => {
    $$(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const setImage = (selector, src, alt) => {
    const image = $(selector);
    if (!image) return;
    image.src = src;
    if (alt !== undefined) image.alt = alt;
  };

  const setFormValue = (selector, value) => {
    const input = $(selector);
    if (input) input.value = value;
  };

  const syncGuestField = (input, hidden) => {
    if (!input || !hidden) return;
    hidden.value = input.value.trim() || "Tamu Undangan";
  };

  const bindGuestField = (inputSelector, hiddenSelector) => {
    const input = $(inputSelector);
    const hidden = $(hiddenSelector);
    if (!input || !hidden) return;
    input.addEventListener("input", () => syncGuestField(input, hidden));
  };

  document.title = data.meta.title;
  const description = $('meta[name="description"]');
  if (description) description.setAttribute("content", data.meta.description);

  setText("#coverGroom", data.couple.groom.nick);
  setText("#coverBride", data.couple.bride.nick);
  setText("[data-groom]", data.couple.groom.nick);
  setText("[data-bride]", data.couple.bride.nick);
  setText("#coverDate", data.dateLabel);
  setText("[data-date-label]", data.dateLabel);
  setText("#guestName", guestName);
  setText("[data-hero-guest]", guestName);
  setText("#groomNick", data.couple.groom.nick);
  setText("#groomName", data.couple.groom.full);
  setText("#groomOrder", data.couple.groom.order);
  setText("#groomParents", data.couple.groom.parents);
  setText("#brideNick", data.couple.bride.nick);
  setText("#brideName", data.couple.bride.full);
  setText("#brideOrder", data.couple.bride.order);
  setText("#brideParents", data.couple.bride.parents);
  setText("#quoteText", data.quote.text);
  setText("#quoteSource", data.quote.source);
  setText("#invitationText", data.invitationText);
  setText("#closingText", data.closing.text);
  setText("#closingCredit", data.closing.credit);

  setImage("#coverPhoto", data.coverPhoto.src, data.coverPhoto.alt);
  setImage("#bridePhoto", data.couple.bride.photo, data.couple.bride.alt);
  setImage("#groomPhoto", data.couple.groom.photo, data.couple.groom.alt);

  setFormValue("#rsvpName", guestName);
  setFormValue("#wishName", guestName);
  setFormValue("#rsvpGuestHidden", guestName);
  setFormValue("#wishGuestHidden", guestName);
  setFormValue('#rsvpForm input[name="_subject"]', data.forms.rsvpSubject);
  setFormValue('#wishForm input[name="_subject"]', data.forms.wishSubject);

  bindGuestField("#rsvpName", "#rsvpGuestHidden");
  bindGuestField("#wishName", "#wishGuestHidden");

  const createImageSlide = (photo, index, className) => {
    const slide = document.createElement("div");
    slide.className = className;
    if (index === 0) slide.classList.add("is-active");

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.alt || "";
    img.style.objectPosition = photo.position || "center";
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    if (index === 0) img.fetchPriority = "high";

    slide.appendChild(img);
    return slide;
  };

  const heroSlidesContainer = $("#heroSlides");
  if (heroSlidesContainer) {
    data.heroPhotos.forEach((photo, index) => {
      heroSlidesContainer.appendChild(createImageSlide(photo, index, "hero__slide"));
    });
  }

  const closingSlidesContainer = $("#closingSlides");
  if (closingSlidesContainer) {
    data.heroPhotos.slice().reverse().forEach((photo, index) => {
      closingSlidesContainer.appendChild(createImageSlide(photo, index, "closing__slide"));
    });
  }

  const startSlideshow = (containerSelector, slideSelector, interval) => {
    const container = $(containerSelector);
    if (!container) return;
    const slides = $$(slideSelector, container);
    if (slides.length < 2) return;

    let current = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, interval);
  };

  startSlideshow("#heroSlides", ".hero__slide", 6000);
  startSlideshow("#closingSlides", ".closing__slide", 5200);

  const eventIcons = {
    rings: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="9" cy="13" r="4.5"></circle>
        <circle cx="15" cy="13" r="4.5"></circle>
        <path d="m12 3 1.7 2.5L12 8l-1.7-2.5Z"></path>
      </svg>`,
    glass: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 4h10l-1.2 7a3.9 3.9 0 0 1-7.6 0Z"></path>
        <path d="M12 15v5M9 20h6"></path>
        <path d="M7.4 7h9.2"></path>
      </svg>`
  };

  const eventList = $("#eventList");
  if (eventList) {
    data.events.forEach((event, index) => {
      const card = document.createElement("article");
      card.className = "event-card";
      card.setAttribute("data-anim", "up");
      card.style.setProperty("--delay", `${index * 110}ms`);

      const iconWrap = document.createElement("div");
      iconWrap.className = "event-card__icon";
      iconWrap.innerHTML = eventIcons[event.icon] || eventIcons.rings;

      const title = document.createElement("h3");
      title.textContent = event.title;

      const date = document.createElement("p");
      date.className = "event-card__date";
      date.textContent = event.date;

      const time = document.createElement("p");
      time.className = "event-card__time";
      time.textContent = event.time;

      const place = document.createElement("p");
      place.className = "event-card__place";
      place.textContent = event.place;

      const address = document.createElement("p");
      address.className = "event-card__address";
      address.textContent = event.address;

      card.append(iconWrap, title, date, time, place, address);
      eventList.appendChild(card);
    });

    const eventMap = $("#eventMap");
    const mapUrl = data.events.find((event) => event.mapUrl)?.mapUrl;
    if (eventMap && mapUrl) {
      const mapLink = document.createElement("a");
      mapLink.className = "btn btn--outline";
      mapLink.href = mapUrl;
      mapLink.target = "_blank";
      mapLink.rel = "noopener";
      mapLink.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z"></path>
          <circle cx="12" cy="10" r="2.5"></circle>
        </svg>
        <span>Lihat Lokasi Acara</span>`;
      eventMap.appendChild(mapLink);
    }
  }

  const galleryGrid = $("#galleryGrid");
  if (galleryGrid) {
    data.gallery.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__item";
      button.setAttribute("aria-label", `Buka foto ${index + 1}: ${photo.alt || "Mega dan Ahmad"}`);
      button.dataset.index = String(index);
      button.setAttribute("data-anim", "zoom");
      button.style.setProperty("--delay", `${(index % 3) * 75}ms`);

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.style.objectPosition = photo.position || "center";

      button.appendChild(img);
      galleryGrid.appendChild(button);
    });
  }

  const giftList = $("#giftList");
  if (giftList && data.gift) {
    setText("#giftEyebrow", data.gift.eyebrow);
    setText("#giftTitle", data.gift.title);
    setText("#giftIntro", data.gift.intro);

    const createCopyButton = (value, label, text) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn--outline";
      button.dataset.copy = value;
      button.dataset.copyLabel = label;
      button.setAttribute("aria-label", `Salin ${label.toLowerCase()}`);

      const buttonLabel = document.createElement("span");
      buttonLabel.textContent = text;
      button.appendChild(buttonLabel);
      return button;
    };

    data.gift.accounts.forEach((account, index) => {
      const card = document.createElement("article");
      card.className = "gift-card gift-card--account";
      card.dataset.anim = "up";
      card.style.setProperty("--delay", `${index * 90}ms`);

      const bank = document.createElement("p");
      bank.className = "gift-card__bank";
      bank.textContent = account.bank;

      const details = document.createElement("div");
      details.className = "gift-card__details";
      details.id = `giftAccount${index + 1}`;
      details.hidden = true;

      const holder = document.createElement("p");
      holder.className = "gift-card__holder";
      holder.textContent = `a.n. ${account.holder}`;

      const number = document.createElement("p");
      number.className = "gift-card__number";
      number.textContent = account.number;

      details.append(
        holder,
        number,
        createCopyButton(account.number, `Nomor rekening ${account.bank}`, "Salin Nomor")
      );

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "btn btn--outline gift-card__toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", details.id);
      toggle.setAttribute("aria-label", `Buka rekening ${account.bank}`);
      toggle.innerHTML = `
        <span>Buka Rekening</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>`;

      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", `${open ? "Tutup" : "Buka"} rekening ${account.bank}`);
        $("span", toggle).textContent = open ? "Tutup Rekening" : "Buka Rekening";
        details.hidden = !open;
        card.classList.toggle("is-open", open);
      });

      card.append(bank, toggle, details);
      giftList.appendChild(card);
    });

    const addressCard = document.createElement("article");
    addressCard.className = "gift-card gift-card--address";
    addressCard.dataset.anim = "up";
    addressCard.style.setProperty("--delay", `${data.gift.accounts.length * 90}ms`);

    const addressTitle = document.createElement("p");
    addressTitle.className = "gift-card__bank";
    addressTitle.textContent = data.gift.address.title;

    const recipient = document.createElement("p");
    recipient.className = "gift-card__holder";
    recipient.textContent = `Penerima: ${data.gift.address.recipient}`;

    const address = document.createElement("p");
    address.className = "gift-card__address";
    data.gift.address.lines.forEach((line, index) => {
      if (index) address.appendChild(document.createElement("br"));
      address.appendChild(document.createTextNode(line));
    });

    const addressText = [data.gift.address.recipient, ...data.gift.address.lines].join("\n");
    addressCard.append(
      addressTitle,
      recipient,
      address,
      createCopyButton(addressText, "Alamat kado", "Salin Alamat")
    );
    giftList.appendChild(addressCard);
  }

  const countdownTarget = new Date(data.dateISO).getTime();
  const countdownParts = {
    days: $("#cdDays"),
    hours: $("#cdHours"),
    minutes: $("#cdMinutes"),
    seconds: $("#cdSeconds")
  };
  const countdown = $("#countdown");
  const countdownPast = $("#countdownPast");
  const pad = (value) => String(Math.max(0, value)).padStart(2, "0");

  const updateCountdown = () => {
    const remaining = countdownTarget - Date.now();
    const isPast = remaining <= 0;
    const safe = Math.max(0, remaining);
    const totalSeconds = Math.floor(safe / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const secondsText = pad(seconds);
    if (countdownParts.seconds.textContent !== secondsText) {
      countdownParts.seconds.classList.remove("is-ticking");
      void countdownParts.seconds.offsetWidth;
      countdownParts.seconds.classList.add("is-ticking");
    }

    countdownParts.days.textContent = pad(days);
    countdownParts.hours.textContent = pad(hours);
    countdownParts.minutes.textContent = pad(minutes);
    countdownParts.seconds.textContent = secondsText;

    if (countdown) countdown.hidden = isPast;
    if (countdownPast) countdownPast.hidden = !isPast;
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const toast = $("#toast");
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      return copied;
    }
  };

  document.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (!copyButton) return;

    const copyLabel = copyButton.dataset.copyLabel || "Teks";
    const copied = await copyText(copyButton.dataset.copy || "");
    if (!copied) {
      showToast(`${copyLabel} belum bisa disalin.`);
      return;
    }

    const label = $("span", copyButton);
    const original = label ? label.textContent : "";
    if (label) label.textContent = "Berhasil disalin";
    showToast(`${copyLabel} berhasil disalin.`);
    window.setTimeout(() => {
      if (label) label.textContent = original;
    }, 1900);
  });

  let musicPlaying = false;
  let volumeTimer = 0;
  const musicSource = data.music && data.music.src;

  if (audio && musicSource) {
    audio.src = musicSource;
    musicButton.hidden = false;
  }

  const setMusicState = (playing) => {
    musicPlaying = playing;
    if (!musicButton) return;
    musicButton.classList.toggle("is-playing", playing);
    musicButton.setAttribute("aria-pressed", String(playing));
    musicButton.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
  };

  const fadeVolume = (targetVolume, duration) => {
    if (!audio) return;
    window.clearInterval(volumeTimer);
    const start = audio.volume;
    const steps = 24;
    let step = 0;
    volumeTimer = window.setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / steps);
      audio.volume = Math.min(1, start + (targetVolume - start) * progress);
      if (progress >= 1) window.clearInterval(volumeTimer);
    }, duration / steps);
  };

  const playMusic = async () => {
    if (!audio || !musicSource) return;
    try {
      audio.volume = 0;
      await audio.play();
      setMusicState(true);
      fadeVolume(data.music.volume || 0.42, 1600);
    } catch (error) {
      setMusicState(false);
    }
  };

  if (audio) {
    audio.addEventListener("playing", () => setMusicState(true));
    audio.addEventListener("pause", () => setMusicState(false));
    audio.addEventListener("error", () => {
      setMusicState(false);
      if (musicButton) musicButton.hidden = true;
    });
  }

  if (musicButton) {
    musicButton.addEventListener("click", () => {
      if (!audio) return;
      if (audio.paused) {
        playMusic();
      } else {
        audio.pause();
      }
    });
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
  );

  const startReveal = () => {
    $$("[data-anim]").forEach((element) => revealObserver.observe(element));
  };

  const parallaxItems = $$("[data-parallax]");
  const backgroundParallaxItems = $$("[data-bg-parallax]");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let parallaxFrame = 0;

  const updateParallax = () => {
    if (!parallaxItems.length) return;

    if (reduceMotionQuery.matches) {
      parallaxItems.forEach((element) => element.style.removeProperty("--parallax-y"));
      return;
    }

    const viewportHeight = window.innerHeight;

    parallaxItems.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > viewportHeight + 160) return;

      const speed = Number(element.dataset.parallax) || 0.08;
      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const shift = Math.max(-90, Math.min(90, -progress * speed * 600));

      element.style.setProperty("--parallax-y", `${shift.toFixed(1)}px`);
    });
  };

  const updateBackgroundParallax = () => {
    if (!backgroundParallaxItems.length) return;

    if (reduceMotionQuery.matches) {
      backgroundParallaxItems.forEach((element) => element.style.removeProperty("--bg-parallax-y"));
      return;
    }

    const viewportHeight = window.innerHeight;

    backgroundParallaxItems.forEach((element) => {
      let shift = 0;

      if (element.dataset.bgParallax === "scroll") {
        shift = -window.scrollY * 0.04;
      } else {
        const rect = element.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        shift = -progress * 0.1 * 320;
      }

      shift = Math.max(-40, Math.min(40, shift));
      element.style.setProperty("--bg-parallax-y", `${shift.toFixed(1)}px`);
    });
  };

  const queueParallax = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(() => {
      updateBackgroundParallax();
      updateParallax();
      parallaxFrame = 0;
    });
  };

  if (parallaxItems.length || backgroundParallaxItems.length) {
    window.addEventListener("scroll", queueParallax, { passive: true });
    window.addEventListener("resize", queueParallax);
    if (typeof reduceMotionQuery.addEventListener === "function") {
      reduceMotionQuery.addEventListener("change", queueParallax);
    }
  }

  if (window.matchMedia("(min-width: 1025px)").matches) {
    $$(".hero [data-anim]").forEach((element) => element.classList.add("is-visible"));
  }

  const updateNav = () => {
    if (!nav) return;
    const links = $$("a[data-nav]", nav);
    const sections = links
      .map((link) => document.getElementById(link.dataset.nav))
      .filter(Boolean);
    const marker = window.scrollY + window.innerHeight * 0.38;
    let activeId = sections.length ? sections[0].id : "hom";

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) activeId = section.id;
    });

    links.forEach((link) => {
      const active = link.dataset.nav === activeId;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let navFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (navFrame) return;
      navFrame = window.requestAnimationFrame(() => {
        updateNav();
        navFrame = 0;
      });
    },
    { passive: true }
  );

  if (nav) {
    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-nav]");
      if (!link) return;
      if (link.dataset.nav === "hom") {
        event.preventDefault();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
      $$("a[data-nav]", nav).forEach((item) => {
        item.classList.toggle("is-active", item === link);
        if (item === link) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      });
    });
  }

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxCounter = $("#lightboxCounter");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  let lightboxIndex = 0;
  let lastFocused = null;

  const updateLightbox = () => {
    const photo = data.gallery[lightboxIndex];
    if (!photo) return;
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt || "";
    lightboxCaption.textContent = photo.alt || "";
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${data.gallery.length}`;
  };

  const openLightbox = (index) => {
    if (!lightbox || !data.gallery.length) return;
    lightboxIndex = Math.max(0, Math.min(index, data.gallery.length - 1));
    lastFocused = document.activeElement;
    updateLightbox();
    lightbox.hidden = false;
    body.classList.add("lightbox-open");
    if (lightboxClose) lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    body.classList.remove("lightbox-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  const moveLightbox = (direction) => {
    if (!data.gallery.length) return;
    lightboxIndex = (lightboxIndex + direction + data.gallery.length) % data.gallery.length;
    updateLightbox();
  };

  if (galleryGrid) {
    galleryGrid.addEventListener("click", (event) => {
      const item = event.target.closest(".gallery__item");
      if (!item) return;
      openLightbox(Number(item.dataset.index));
    });
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => moveLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => moveLightbox(1));

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    let touchStartX = 0;
    lightbox.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (event) => {
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) < 45) return;
        moveLightbox(delta > 0 ? -1 : 1);
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveLightbox(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveLightbox(1);
    }
    if (event.key !== "Tab") return;

    const focusable = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const wishesUrl = (data.forms && data.forms.wishesUrl) || "";
  const wishList = $("#wishList");
  let wishCache = [];

  const renderWishes = (wishes) => {
    if (!wishList) return;
    wishList.replaceChildren();

    if (!wishes.length) {
      const empty = document.createElement("p");
      empty.className = "wish-empty";
      empty.textContent = "Jadilah yang pertama memberikan doa dan ucapan untuk Mega & Ahmad.";
      wishList.appendChild(empty);
      return;
    }

    wishes.forEach((wish) => {
      const card = document.createElement("article");
      card.className = "wish-card";

      const name = document.createElement("strong");
      name.textContent = wish.name || "Tamu Undangan";

      const message = document.createElement("p");
      message.textContent = wish.message || "";

      card.append(name, message);
      wishList.appendChild(card);
    });
  };

  const loadWishes = async () => {
    if (!wishesUrl) return;
    try {
      const res = await fetch(wishesUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat ucapan");
      const list = await res.json();
      if (Array.isArray(list)) {
        wishCache = list;
        renderWishes(wishCache);
      }
    } catch (error) {
      // Biarkan daftar yang sudah tampil; hanya catat di console
      console.warn("Daftar ucapan belum bisa dimuat:", error);
    }
  };

  renderWishes(wishCache);
  loadWishes();

  const endpoint = (data.forms && data.forms.endpoint) || "";
  const hasEndpoint = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+/.test(endpoint);

  const rsvpConfirm = $("#rsvpConfirm");
  const rsvpGuests = $("#rsvpGuests");
  const rsvpGuestsField = rsvpGuests ? rsvpGuests.closest(".field") : null;

  const syncRsvpGuests = () => {
    if (!rsvpConfirm || !rsvpGuests || !rsvpGuestsField) return;
    const cannotAttend = rsvpConfirm.value === "Belum Bisa Hadir";
    rsvpGuestsField.hidden = cannotAttend;
    rsvpGuests.disabled = cannotAttend;
    rsvpGuests.required = !cannotAttend;

    if (cannotAttend) {
      rsvpGuests.value = "";
    } else if (!rsvpGuests.value) {
      rsvpGuests.value = "1";
    }
  };

  if (rsvpConfirm) {
    rsvpConfirm.addEventListener("change", syncRsvpGuests);
    syncRsvpGuests();
  }

  // Kirim data ke Google Apps Script dan WAJIB membaca balasannya.
  // Jika skrip menolak / error / tidak bisa dihubungi -> melempar error (tampil pesan gagal).
  const postToSheet = async (formData) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(wishesUrl, {
        method: "POST",
        body: new URLSearchParams(formData),
        signal: controller.signal
      });
      if (!res.ok) throw new Error("Server menjawab status " + res.status);

      let result;
      try {
        result = await res.json();
      } catch (parseError) {
        throw new Error("Balasan skrip bukan JSON (cek Deploy: Who has access = Anyone)");
      }
      if (!result || result.ok !== true) {
        throw new Error("Ditolak skrip: " + ((result && result.error) || "tidak diketahui"));
      }
      return result;
    } finally {
      window.clearTimeout(timer);
    }
  };

  const submitForm = async (form, formType) => {
    const status = $(".form__status", form);
    const button = $('button[type="submit"]', form);
    const buttonLabel = button ? $("span", button) : null;
    const originalLabel = buttonLabel ? buttonLabel.textContent : "";

    if (status) {
      status.className = "form__status";
      status.textContent = "";
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value.trim()) return;

    const nameInput = $('input[name="nama"]', form);
    const guestHidden = $('input[name="tamu"]', form);
    syncGuestField(nameInput, guestHidden);

    if (button) button.disabled = true;
    if (buttonLabel) buttonLabel.textContent = "Mengirim...";
    if (status) status.textContent = "Mohon tunggu sebentar...";

    const formData = new FormData(form);
    const nameValue = String(formData.get("nama") || "").trim();
    const messageValue = String(formData.get("pesan") || "").trim();

    try {
      if (wishesUrl) {
        await postToSheet(formData);
      } else if (hasEndpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Form submission failed");
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
      }

      if (formType === "wish") {
        wishCache.unshift({ name: nameValue, message: messageValue });
        renderWishes(wishCache);
        if (status) {
          status.className = "form__status is-success";
          status.textContent = "Terima kasih atas doa dan ucapan Anda.";
        }
        form.reset();
        setFormValue("#wishName", guestName);
        setFormValue("#wishGuestHidden", guestName);
        showToast("Ucapan berhasil dikirim.");
      } else {
        if (status) {
          status.className = "form__status is-success";
          status.textContent = "Terima kasih, konfirmasi kehadiran Anda sudah kami terima.";
        }
        form.reset();
        setFormValue("#rsvpName", guestName);
        setFormValue("#rsvpGuestHidden", guestName);
        syncRsvpGuests();
        showToast("Konfirmasi berhasil dikirim.");
      }
    } catch (error) {
      console.error("Gagal mengirim form:", error);
      if (status) {
        status.className = "form__status is-error";
        status.textContent = "Maaf, kiriman belum berhasil. Silakan coba lagi.";
      }
      showToast("Kiriman belum berhasil. Silakan coba lagi.");
    } finally {
      if (button) button.disabled = false;
      if (buttonLabel) buttonLabel.textContent = originalLabel;
    }
  };

  const rsvpForm = $("#rsvpForm");
  const wishForm = $("#wishForm");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm(rsvpForm, "rsvp");
    });
  }

  if (wishForm) {
    wishForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm(wishForm, "wish");
    });
  }

  const openInvitation = () => {
    if (!cover || body.classList.contains("is-open")) return;

    body.classList.remove("is-locked");
    body.classList.add("is-open");
    cover.classList.add("is-open");
    main.removeAttribute("inert");
    main.removeAttribute("aria-hidden");
    main.setAttribute("tabindex", "-1");

    startReveal();
    updateBackgroundParallax();
    updateParallax();
    updateNav();
    playMusic();

    const heroTitle = $("#heroNames");
    if (heroTitle) {
      heroTitle.setAttribute("tabindex", "-1");
      window.setTimeout(() => {
        heroTitle.focus({ preventScroll: true });
        heroTitle.classList.add("is-visible");
      }, 1300);
    }

    window.setTimeout(() => {
      cover.hidden = true;
    }, 1250);
  };

  if (cover) {
    const openButton = $("#openInvitation");
    if (openButton) openButton.addEventListener("click", openInvitation);
  }

  if (main) {
    main.setAttribute("inert", "");
    main.setAttribute("aria-hidden", "true");
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  window.addEventListener("load", () => {
    const firstSlide = $(".hero__slide.is-active img");
    if (firstSlide) firstSlide.loading = "eager";
  });
})();