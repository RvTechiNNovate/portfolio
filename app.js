(() => {
  "use strict";

  const all = (selector, root = document) => [...root.querySelectorAll(selector)];

  all("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // The same navigation stays visible on desktop and becomes a disclosure on mobile.
  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-nav");
  const setMenuOpen = (open) => {
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.classList.toggle("is-open", open);
    navigation?.classList.toggle("is-open", open);
  };

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!navigation?.contains(event.target) && !menuToggle?.contains(event.target)) {
      setMenuOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  const navLinks = all('.nav-link[href^="#"]');
  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveSection(link.hash.slice(1)));
  });
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
    );
    navLinks.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) sectionObserver.observe(section);
    });
  }

  const projectFilters = all("[data-project-filter]");
  const projectCards = all(".project-card[data-category]");
  const projectCount = document.getElementById("project-count");
  const filterProjects = (filter) => {
    let count = 0;
    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(/\s+/);
      const show = filter === "all" || categories.includes(filter);
      card.hidden = !show;
      if (show) count += 1;
    });
    projectFilters.forEach((button) => {
      const active = button.dataset.projectFilter === filter;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    if (projectCount) projectCount.textContent = `${count} project${count === 1 ? "" : "s"}`;
  };
  projectFilters.forEach((button) => {
    button.addEventListener("click", () => filterProjects(button.dataset.projectFilter));
  });
  if (projectFilters.length) filterProjects("all");

  const copyButton = document.getElementById("copy-email");
  const copyStatus = document.getElementById("copy-status");
  copyButton?.addEventListener("click", async () => {
    const email = copyButton.dataset.email;
    if (!email) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(email);
      if (copyStatus) copyStatus.textContent = "Email copied to clipboard.";
    } catch {
      if (copyStatus) copyStatus.textContent = `Select and copy this email address: ${email}`;
    }
  });

  const quickAnswer = document.getElementById("quick-answer");
  const quickQuestions = all("[data-quick-answer]");
  const quickAnswers = {
    projects: "I’ve built a Voice Hiring Agent, a Unified Marketplace Agent, and a Unified Knowledge & Data Retrieval Platform—covering conversational recruitment, multi-agent commerce, and document and database search.",
    stack: "My toolkit includes Python and FastAPI; LangChain, LangGraph, and CrewAI; Pipecat and Twilio for voice; and Weaviate, Redis, Azure, and Docker for data and deployment.",
    experience: "I’ve been a Senior Software Engineer at Nagarro since March 2022, building production AI and backend systems.",
  };
  quickQuestions.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const answer = quickAnswers[button.dataset.quickAnswer];
      if (!answer || !quickAnswer) return;
      quickAnswer.textContent = answer;
      quickQuestions.forEach((question) => {
        question.setAttribute("aria-pressed", String(question === button));
      });
    });
  });

  // Native dialogs supply keyboard focus containment and Escape handling.
  const dialogTriggers = new WeakMap();
  const syncDialogState = () => {
    document.body.classList.toggle("modal-open", Boolean(document.querySelector("dialog[open]")));
  };
  all("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const dialog = document.getElementById(button.dataset.openDialog);
      if (!dialog || typeof dialog.showModal !== "function" || dialog.open) return;
      event.preventDefault();
      setMenuOpen(false);
      dialogTriggers.set(dialog, button);
      dialog.showModal();
      syncDialogState();
    });
  });
  all("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
  all("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!inside) dialog.close();
    });
    dialog.addEventListener("close", () => {
      syncDialogState();
      const trigger = dialogTriggers.get(dialog);
      if (trigger?.isConnected && !document.querySelector("dialog[open]")) {
        trigger.focus({ preventScroll: true });
      }
    });
  });

  const voiceDialog = document.getElementById("voice-dialog");
  if (!voiceDialog) return;

  const voiceConfig = window.PORTFOLIO_CONFIG?.voiceAgent ?? {};
  const rawSpaceUrl = typeof voiceConfig.spaceUrl === "string" ? voiceConfig.spaceUrl.trim() : "";
  let spaceUrl = null;
  if (rawSpaceUrl) {
    try {
      const parsed = new URL(rawSpaceUrl);
      if (parsed.protocol === "https:" && /^[a-z0-9-]+\.hf\.space$/i.test(parsed.hostname)
        && !parsed.username && !parsed.password && !parsed.port) {
        spaceUrl = parsed.href;
      }
    } catch {
      // A malformed configuration never creates a frame or a network request.
    }
  }

  const voiceIntro = document.getElementById("voice-intro");
  const frameContainer = document.getElementById("voice-frame-container");
  const voiceStart = document.getElementById("voice-start");
  const voiceState = document.getElementById("voice-state");
  const voiceDescription = document.getElementById("voice-description");
  const voiceExternal = document.getElementById("voice-external");
  const voicePlaceholder = document.getElementById("voice-placeholder");
  let loadingTimer = null;
  let activeFrame = null;

  voiceState?.setAttribute("role", "status");

  const setVoiceCopy = (state, description) => {
    if (voiceState) voiceState.textContent = state;
    if (voiceDescription) voiceDescription.textContent = description;
  };
  const clearLoadingTimer = () => {
    if (loadingTimer !== null) window.clearTimeout(loadingTimer);
    loadingTimer = null;
  };
  const resetVoice = () => {
    clearLoadingTimer();
    activeFrame?.remove();
    activeFrame = null;
    if (frameContainer) frameContainer.hidden = true;
    if (voiceIntro) voiceIntro.hidden = false;
    if (voiceStart) voiceStart.hidden = !spaceUrl;
    if (voiceExternal) voiceExternal.hidden = true;
    if (voicePlaceholder) voicePlaceholder.hidden = Boolean(spaceUrl);

    if (spaceUrl) {
      setVoiceCopy("Ready to connect", "Start the voice demo to open my AI assistant. Your browser may ask for microphone permission when you choose to speak.");
    } else if (rawSpaceUrl) {
      setVoiceCopy("Demo unavailable", "The voice demo is unavailable right now. You can still explore my projects or get in touch by email.");
    } else {
      setVoiceCopy("Coming soon", "An interactive voice assistant is on the way. In the meantime, explore my projects or get in touch below.");
    }
  };

  all("[data-voice-status]").forEach((element) => {
    element.textContent = spaceUrl ? "Voice demo" : (rawSpaceUrl ? "Unavailable" : "Coming soon");
  });
  if (voiceExternal && spaceUrl) {
    voiceExternal.href = spaceUrl;
    voiceExternal.target = "_blank";
    voiceExternal.rel = "noopener noreferrer";
  }

  voiceStart?.addEventListener("click", () => {
    if (!spaceUrl || !frameContainer || activeFrame) return;
    // Keep the dialog title and live connection status visible above the frame.
    if (voiceIntro) voiceIntro.hidden = false;
    voiceStart.hidden = true;
    if (voicePlaceholder) voicePlaceholder.hidden = true;
    if (voiceExternal) voiceExternal.hidden = false;
    frameContainer.hidden = false;
    setVoiceCopy("Opening voice demo", "The assistant may take a moment to wake up. You can also open the demo in its own tab.");

    const iframe = document.createElement("iframe");
    iframe.title = typeof voiceConfig.title === "string" && voiceConfig.title.trim()
      ? voiceConfig.title : "Ritesh’s AI assistant";
    iframe.allow = "microphone; autoplay";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.className = "voice-frame";
    activeFrame = iframe;
    iframe.addEventListener("load", () => {
      if (activeFrame !== iframe) return;
      clearLoadingTimer();
      setVoiceCopy("Demo frame loaded", "Use the assistant below when it is ready. If it does not appear or microphone access is blocked, open the demo in its own tab.");
    }, { once: true });
    iframe.src = spaceUrl;
    frameContainer.append(iframe);
    loadingTimer = window.setTimeout(() => {
      if (activeFrame !== iframe) return;
      loadingTimer = null;
      setVoiceCopy("Still opening the demo", "The assistant may be waking up or temporarily unavailable. Try opening the demo in its own tab.");
    }, 18000);
  });

  voiceDialog.addEventListener("close", resetVoice);
  resetVoice();
})();
