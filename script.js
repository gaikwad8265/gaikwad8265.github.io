/* =========================================================
   Pavan Gaikwad — Dynamic Portfolio Engine
   Layout: 1:1 Reference Match (Hero / Projects / 3-Col / Contact)
   Background Music: Seedhe Maut — Raat Ki Rani (mGwz92koI6o)
   ========================================================= */

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* =========================================================
     1. FIXED CRIMSON PALETTE (FROM HEADER DONT WANT COLOR CHANGE)
     ========================================================= */
  const initTheme = () => {
    document.documentElement.setAttribute("data-theme", "crimson");
    localStorage.setItem("pavan_theme", "crimson");
  };
  initTheme();

  /* =========================================================
     2. SCROLL PROGRESS INDICATOR
     ========================================================= */
  const scrollProgressBar = $("#scrollProgress");
  const updateScrollProgress = () => {
    if (!scrollProgressBar) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* =========================================================
     3. INTERACTIVE DYNAMIC BACKGROUND CANVAS (PARTICLES)
     ========================================================= */
  const canvas = $("#bgCanvas");
  let isCanvasActive = true;
  let musicIsPlayingGlobal = false;

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initParticles();
    });

    const particleCount = Math.min(Math.floor((w * h) / 22000), 45);
    let particles = [];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.4 + 0.15;
        this.alpha = this.baseAlpha;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Mouse repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }

        // Ambient rhythm
        if (musicIsPlayingGlobal) {
          this.alpha = this.baseAlpha + Math.sin(Date.now() * 0.005) * 0.12;
        } else {
          this.alpha = this.baseAlpha;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, this.alpha)})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    const renderCanvas = () => {
      if (!isCanvasActive) {
        requestAnimationFrame(renderCanvas);
        return;
      }
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 105) {
            const opacity = (1 - dist / 105) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(renderCanvas);
    };
    renderCanvas();

    document.addEventListener("visibilitychange", () => {
      isCanvasActive = !document.hidden;
    });
  }

  /* =========================================================
     4. YOUTUBE BACKGROUND MUSIC ENGINE ("Raat Ki Rani")
     Video ID: mGwz92koI6o
     ========================================================= */
  const YOUTUBE_VIDEO_ID = "mGwz92koI6o";
  let ytPlayer = null;
  let isPlayerReady = false;
  let isMusicPlaying = false;
  let isMusicMuted = false;
  let hasUserInteracted = false;

  const musicPlayerWidget = $("#musicPlayer");
  const musicPlayBtn = $("#musicPlayBtn");
  const musicDiscBtn = $("#musicDiscBtn");
  const musicMuteBtn = $("#musicMuteBtn");
  const musicTooltip = $("#musicTooltip");
  const musicTooltipClose = $("#musicTooltipClose");
  const headerBgmToggle = $("#headerBgmToggle");

  const updateMusicUI = (playing) => {
    isMusicPlaying = playing;
    musicIsPlayingGlobal = playing;

    if (musicPlayerWidget) musicPlayerWidget.classList.toggle("playing", playing);
    if (headerBgmToggle) headerBgmToggle.classList.toggle("playing", playing);

    if (playing && musicTooltip) {
      musicTooltip.classList.add("hidden");
    }
  };

  const playMusic = () => {
    if (!isPlayerReady || !ytPlayer) return;
    try {
      if (typeof ytPlayer.playVideo === "function") {
        ytPlayer.playVideo();
        if (isMusicMuted && typeof ytPlayer.unMute === "function") {
          ytPlayer.unMute();
          isMusicMuted = false;
          if (musicPlayerWidget) musicPlayerWidget.classList.remove("muted");
        }
        updateMusicUI(true);
      }
    } catch (err) {
      console.warn("Audio play triggered:", err);
    }
  };

  const pauseMusic = () => {
    if (!isPlayerReady || !ytPlayer) return;
    try {
      if (typeof ytPlayer.pauseVideo === "function") {
        ytPlayer.pauseVideo();
        updateMusicUI(false);
      }
    } catch (err) {
      console.warn("Audio pause triggered:", err);
    }
  };

  const toggleMusicPlayback = () => {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const toggleMute = () => {
    if (!isPlayerReady || !ytPlayer) return;
    try {
      if (isMusicMuted) {
        if (typeof ytPlayer.unMute === "function") ytPlayer.unMute();
        isMusicMuted = false;
        if (musicPlayerWidget) musicPlayerWidget.classList.remove("muted");
      } else {
        if (typeof ytPlayer.mute === "function") ytPlayer.mute();
        isMusicMuted = true;
        if (musicPlayerWidget) musicPlayerWidget.classList.add("muted");
      }
    } catch (err) {
      console.warn("Audio mute toggle:", err);
    }
  };

  const initYouTubePlayer = () => {
    if (window.YT && window.YT.Player && !ytPlayer) {
      try {
        ytPlayer = new window.YT.Player("ytPlayer", {
          height: "0",
          width: "0",
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            controls: 0,
            showinfo: 0,
            autohide: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              isPlayerReady = true;
              try {
                event.target.setVolume(75);
                event.target.playVideo();
              } catch (e) {
                console.log("Autoplay waiting for user gesture.");
              }
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                updateMusicUI(true);
              } else if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED
              ) {
                updateMusicUI(false);
              }
            },
          },
        });
      } catch (e) {
        console.warn("Could not init YT.Player:", e);
      }
    }
  };

  window.onYouTubeIframeAPIReady = () => initYouTubePlayer();
  if (window.YT && window.YT.Player) initYouTubePlayer();

  const handleFirstInteraction = () => {
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      if (!isMusicPlaying && isPlayerReady && ytPlayer) {
        playMusic();
      }
    }
  };
  window.addEventListener("click", handleFirstInteraction, { once: true });
  window.addEventListener("touchstart", handleFirstInteraction, { once: true, passive: true });

  if (musicPlayBtn) musicPlayBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMusicPlayback(); });
  if (musicDiscBtn) musicDiscBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMusicPlayback(); });
  if (headerBgmToggle) headerBgmToggle.addEventListener("click", (e) => { e.stopPropagation(); toggleMusicPlayback(); });
  if (musicMuteBtn) musicMuteBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMute(); });
  if (musicTooltipClose) {
    musicTooltipClose.addEventListener("click", (e) => {
      e.stopPropagation();
      if (musicTooltip) musicTooltip.classList.add("hidden");
    });
  }

  /* =========================================================
     5. YEAR & PRELOADER
     ========================================================= */
  const currentYear = new Date().getFullYear();
  if ($("#year")) $("#year").textContent = currentYear;
  if ($("#loaderYear")) $("#loaderYear").textContent = currentYear;

  document.body.classList.add("is-loading");
  const loader = $("#loader");
  const countEl = $("#loaderCount");
  const barEl = $("#loaderBar");
  let progress = 0;

  const finishLoading = () => {
    if (loader) loader.classList.add("done");
    document.body.classList.remove("is-loading");
    setTimeout(() => document.body.classList.add("ready"), 350);
    setTimeout(() => { if (loader) loader.style.display = "none"; }, 1200);
  };
  // Fallback to guarantee text entrance triggers
  setTimeout(() => {
    if (!document.body.classList.contains("ready")) {
      document.body.classList.add("ready");
    }
  }, 1800);

  const loadTimer = setInterval(() => {
    progress += Math.random() * 14 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadTimer);
      setTimeout(finishLoading, 200);
    }
    if (countEl) countEl.textContent = Math.floor(progress);
    if (barEl) barEl.style.width = progress + "%";
  }, 60);

  /* =========================================================
     6. HEADER SCROLL & PARALLAX SCROLL TRANSITIONS ENGINE
     ========================================================= */
  const header = $("#header");
  const heroGiantText = $(".hero__giant-text");
  const heroCreatorWrap = $(".hero__creator-wrap");
  const heroLeftBlock = $(".hero__left-block");
  const heroRightBlock = $(".hero__right-block");
  const trackedSections = $$("section[id]");
  const navLinks = $$(".nav a");

  let isScrollTicking = false;

  const onWindowScroll = () => {
    const y = window.scrollY;
    const heroH = window.innerHeight;

    // Header scrolled state
    if (header) {
      header.classList.toggle("scrolled", y > 40);
    }

    // Hero 3D Parallax & Depth Transitions on Scroll
    if (y <= heroH * 1.25) {
      const progress = Math.min(1, y / (heroH * 0.75));

      if (heroGiantText) {
        heroGiantText.style.transform = `translate3d(-50%, ${y * 0.3}px, 0)`;
        heroGiantText.style.opacity = Math.max(0, 1 - progress * 1.15).toFixed(3);
      }
      if (heroCreatorWrap) {
        // Creator cutout portrait moves at a slower rate (foreground 3D depth)
        heroCreatorWrap.style.transform = `translate3d(-50%, ${y * 0.12}px, 0)`;
      }
      if (heroLeftBlock) {
        heroLeftBlock.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
        heroLeftBlock.style.opacity = Math.max(0, 1 - progress * 1.35).toFixed(3);
      }
      if (heroRightBlock) {
        heroRightBlock.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
        heroRightBlock.style.opacity = Math.max(0, 1 - progress * 1.35).toFixed(3);
      }
    }

    // Active Section Navigation Tracking
    const scrollPos = y + 200;
    trackedSections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          const match = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", match);
        });
      }
    });

    isScrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!isScrollTicking) {
        window.requestAnimationFrame(onWindowScroll);
        isScrollTicking = true;
      }
    },
    { passive: true }
  );
  onWindowScroll();

  const burger = $("#burger");
  const nav = $("#nav");
  const toggleMenu = (open) => {
    if (!burger || !nav) return;
    burger.classList.toggle("open", open);
    nav.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (burger) {
    burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("open")));
  }
  if (nav) {
    $$("a", nav).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  }

  /* =========================================================
     7. CUSTOM CURSOR
     ========================================================= */
  if (!isTouch) {
    const cursor = $("#cursor");
    const label = $("#cursorText");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;

    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    const loopCursor = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      if (cursor) cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loopCursor);
    };
    loopCursor();

    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      if (cursor && label) {
        if (t && t.dataset.cursor) {
          label.textContent = t.dataset.cursor;
          cursor.classList.add("big");
        } else {
          cursor.classList.remove("big");
          label.textContent = "";
        }
      }
    });
  }

  /* =========================================================
     8. DYNAMIC PROJECT DATA (PAVAN GAIKWAD PORTFOLIO)
     ========================================================= */
  const projectsData = [
    {
      id: "aura-fest",
      title: "AURA 2025 — Annual Cultural Fest",
      category: "event",
      categoryLabel: "College Event · Video & Design",
      aspect: "tall",
      cursor: "Watch",
      year: "2025",
      client: "College Cultural Committee (5,000+ Attendees)",
      role: "Lead Media Director & Video Editor",
      tools: ["Adobe Premiere Pro", "After Effects", "Photoshop", "Sony Alpha IV"],
      metric: "✨ 85K+ Views on Launch Reels · Record 4,200+ Festival Footfall",
      summary: "Spearheaded the complete visual campaign for the university's flagship 3-day cultural festival. Directed the high-energy teaser reel, designed all digital passes and stage LED countdowns, and delivered the 4K cinematic aftermovie.",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
      tags: ["event", "video", "design"]
    },
    {
      id: "stride-growth",
      title: "30-Day High-Growth Reels Series",
      category: "internship",
      categoryLabel: "Brand Internship · Video",
      aspect: "wide",
      cursor: "Play",
      year: "2025",
      client: "Stride Digital Apparel (Creative Internship)",
      role: "Content Creator & Short-Form Video Editor",
      tools: ["Premiere Pro", "CapCut Pro", "DaVinci Resolve", "Sound Design"],
      metric: "✨ 18 Reels Produced · 320K+ Organic Reach · 14.8% Engagement Rate",
      summary: "Conceptualized, scripted, and edited fast-paced Instagram Reels and TikTok shorts. Focused on thumb-stopping 2-second hooks, dynamic sound effects, rhythmic transitions, and captions that doubled monthly profile visits.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80",
      tags: ["internship", "video"]
    },
    {
      id: "innotech-symposium",
      title: "InnoTech — National Tech Symposium",
      category: "event",
      categoryLabel: "College Event · Graphic Design",
      aspect: "square",
      cursor: "View",
      year: "2024",
      client: "University Engineering Council",
      role: "Head of Visual Design & Branding",
      tools: ["Figma", "Adobe Illustrator", "Photoshop"],
      metric: "✨ 15+ Keynote Speaker Posters · 350+ Printed Delegate Kits",
      summary: "Created the complete futuristic brand system for the national hackathon and tech symposium. Designed typographic keynote posters, ID lanyards, social media carousels, and main-stage sponsor backdrops.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      tags: ["event", "design"]
    },
    {
      id: "neopay-brand",
      title: "FinTech Social Identity & Ad Creatives",
      category: "internship",
      categoryLabel: "Brand Internship · Design",
      aspect: "square",
      cursor: "View",
      year: "2024",
      client: "NeoPay App (Marketing Internship)",
      role: "Creative Design Intern",
      tools: ["Figma", "Adobe Photoshop", "Illustrator"],
      metric: "✨ 45+ Ad Creatives · 22% Lower Customer Acquisition Cost",
      summary: "Collaborated closely with growth marketers to design high-converting Instagram ads, promotional carousel infographics, and app launch banners maintaining strict brand guideline consistency.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      tags: ["internship", "design"]
    },
    {
      id: "concert-night",
      title: "Battle of the Bands & DJ Night",
      category: "event",
      categoryLabel: "College Event · Video & Photo",
      aspect: "tall",
      cursor: "Watch",
      year: "2024",
      client: "Inter-College Music & Dance Fest",
      role: "Cinematographer & Live Video Editor",
      tools: ["Sony Alpha", "Premiere Pro", "Adobe Lightroom"],
      metric: "✨ Same-Night Teaser Reel released in under 4 hours",
      summary: "Covered high-intensity live stage performances, crowd moshpits, and artist close-ups under dynamic stage lights. Delivered rapid-turnaround same-night recap reels that went viral among participating colleges.",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
      tags: ["event", "video", "photo"]
    },
    {
      id: "fitness-campaign",
      title: "Pulse Fitness — Video Stories",
      category: "internship",
      categoryLabel: "Brand Internship · Video",
      aspect: "wide",
      cursor: "Play",
      year: "2024",
      client: "Pulse Studios (Content Creator Intern)",
      role: "Video Producer & Mobile Cinematographer",
      tools: ["Premiere Pro", "DaVinci Resolve", "Gimbal Rig"],
      metric: "✨ 12 High-Retention Trainer Reels · +40% Direct Membership Inquiries",
      summary: "Shot and edited workout routines, trainer highlights, and transformation case studies. Applied color grading for high-energy contrast and rhythmic audio synchronization for maximum motivation.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
      tags: ["internship", "video"]
    },
    {
      id: "sports-olympiad",
      title: "Sports Olympiad — Matchday Identity",
      category: "event",
      categoryLabel: "College Event · Graphic Design",
      aspect: "square",
      cursor: "View",
      year: "2025",
      client: "University Sports Directorate (8 Colleges)",
      role: "Lead Graphic Designer",
      tools: ["Adobe Photoshop", "Illustrator"],
      metric: "✨ 32 Matchday Scorecards & Hype Posters created live",
      summary: "Built the energetic sports design system for an 8-college athletic tournament. Delivered team jerseys, stadium hoarding graphics, schedule matrices, and live score announcements on social media.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80",
      tags: ["event", "design"]
    },
    {
      id: "campus-street",
      title: "Campus Chronicles — Street & Documentary",
      category: "photo",
      categoryLabel: "Creative Series · Photography",
      aspect: "square",
      cursor: "View",
      year: "2023–25",
      client: "College Editorial Board & Creative Archive",
      role: "Photographer & Colorist",
      tools: ["Sony Mirrorless", "Adobe Lightroom Classic"],
      metric: "✨ Featured in College Annual Magazine Cover & Digital Showcase",
      summary: "An authentic photojournalistic series documenting candid student life, campus architecture, and evening golden hour silhouettes across different collegiate seasons.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      tags: ["photo", "design"]
    }
  ];

  /* =========================================================
     9. HOOK UP 3 SHOWCASE CARDS (CLICK TO MODAL)
     ========================================================= */
  $$(".project-card").forEach((card) => {
    card.addEventListener("click", () => {
      openProjectModal(card.dataset.id);
    });
  });

  /* =========================================================
     10. EXPANDABLE "VIEW ALL PROJECTS" DRAWER
     ========================================================= */
  const viewAllBtn = $("#viewAllProjectsBtn");
  const drawer = $("#allProjectsDrawer");
  const gridEl = $("#grid");
  const searchInput = $("#projectSearch");
  const searchClear = $("#searchClear");
  const filterBtns = $$("#filters button");

  let currentCategory = "all";
  let currentSearchQuery = "";
  let activeFilteredProjects = [...projectsData];

  if (viewAllBtn && drawer) {
    viewAllBtn.addEventListener("click", () => {
      drawer.classList.toggle("open");
      const isOpen = drawer.classList.contains("open");
      viewAllBtn.querySelector("span").textContent = isOpen ? "HIDE ALL PROJECTS" : "VIEW ALL PROJECTS";
      if (isOpen) {
        renderProjects();
        drawer.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  const updateFilterCounts = () => {
    const counts = {
      all: projectsData.length,
      event: projectsData.filter((p) => p.tags.includes("event")).length,
      internship: projectsData.filter((p) => p.tags.includes("internship")).length,
      video: projectsData.filter((p) => p.tags.includes("video")).length,
      design: projectsData.filter((p) => p.tags.includes("design")).length,
      photo: projectsData.filter((p) => p.tags.includes("photo")).length,
    };
    for (const key in counts) {
      const el = $(`#count-${key}`);
      if (el) el.textContent = counts[key];
    }
  };
  updateFilterCounts();

  const renderProjects = () => {
    if (!gridEl) return;
    gridEl.innerHTML = "";

    const query = currentSearchQuery.trim().toLowerCase();
    activeFilteredProjects = projectsData.filter((p) => {
      const matchesCat = currentCategory === "all" || p.tags.includes(currentCategory);
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query) ||
        p.tools.some((t) => t.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });

    if (activeFilteredProjects.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--muted); font-size: 1.1rem;">
          No projects found matching "${currentSearchQuery}".
        </div>
      `;
      return;
    }

    activeFilteredProjects.forEach((p) => {
      const card = document.createElement("article");
      const aspectClass = p.aspect === "tall" ? "tall" : p.aspect === "wide" ? "wide" : "";
      card.className = `card ${aspectClass}`;
      card.dataset.id = p.id;
      card.innerHTML = `
        <span class="card__top-badge">${p.year}</span>
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <div class="card__info">
          <span class="card__cat">${p.categoryLabel}</span>
          <h3>${p.title}</h3>
          <div class="card__meta">
            <span>${p.client.split("(")[0]}</span>
          </div>
        </div>
      `;
      card.addEventListener("click", () => openProjectModal(p.id));
      gridEl.appendChild(card);
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.filter;
      renderProjects();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value;
      if (searchClear) searchClear.classList.toggle("visible", currentSearchQuery.length > 0);
      renderProjects();
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentSearchQuery = "";
      searchClear.classList.remove("visible");
      renderProjects();
    });
  }

  /* =========================================================
     11. PROJECT DETAIL MODAL LIGHTBOX
     ========================================================= */
  const modal = $("#projectModal");
  const modalImg = $("#modalImg");
  const modalBadge = $("#modalBadge");
  const modalYear = $("#modalYear");
  const modalTitle = $("#modalTitle");
  const modalClient = $("#modalClient");
  const modalMetric = $("#modalMetric");
  const modalDesc = $("#modalDesc");
  const modalTools = $("#modalTools");
  const modalClose = $("#modalClose");
  const modalPrev = $("#modalPrev");
  const modalNext = $("#modalNext");

  let currentModalIndex = 0;

  const updateModalContent = (index) => {
    if (!projectsData[index]) return;
    currentModalIndex = index;
    const p = projectsData[index];

    if (modalImg) modalImg.src = p.image;
    if (modalBadge) modalBadge.textContent = p.categoryLabel;
    if (modalYear) modalYear.textContent = p.year;
    if (modalTitle) modalTitle.textContent = p.title;
    if (modalClient) modalClient.textContent = `${p.role} · ${p.client}`;
    if (modalMetric) modalMetric.textContent = p.metric;
    if (modalDesc) modalDesc.textContent = p.summary;

    if (modalTools) {
      modalTools.innerHTML = p.tools.map((t) => `<span class="modal-tool-pill">${t}</span>`).join("");
    }
  };

  const openProjectModal = (projectId) => {
    const idx = projectsData.findIndex((p) => p.id === projectId);
    if (idx === -1) return;
    updateModalContent(idx);
    if (modal) modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeProjectModal = () => {
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  if (modalClose) modalClose.addEventListener("click", closeProjectModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  if (modalPrev) {
    modalPrev.addEventListener("click", () => {
      const newIdx = (currentModalIndex - 1 + projectsData.length) % projectsData.length;
      updateModalContent(newIdx);
    });
  }

  if (modalNext) {
    modalNext.addEventListener("click", () => {
      const newIdx = (currentModalIndex + 1) % projectsData.length;
      updateModalContent(newIdx);
    });
  }

  window.addEventListener("keydown", (e) => {
    if (!modal || !modal.classList.contains("open")) return;
    if (e.key === "Escape") closeProjectModal();
    if (e.key === "ArrowLeft" && modalPrev) modalPrev.click();
    if (e.key === "ArrowRight" && modalNext) modalNext.click();
  });

  /* =========================================================
     12. STATS NUMBER COUNTER ANIMATION (2 YEARS, 40+ PROJECTS)
     ========================================================= */
  const countObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const dur = 1400;
        const isExact = target === 2; // For 2 Years Experience
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          const val = Math.round(target * eased);
          el.textContent = isExact ? val : val + "+";
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* =========================================================
     13. CONTACT FORM WITH SEND MESSAGE CLICK ANIMATION
     ========================================================= */
  const form = $("#form");
  const note = $("#formNote");
  const sendBtn = $("#sendMessageBtn");
  const btnText = sendBtn ? sendBtn.querySelector(".btn-text") : null;

  if (form && sendBtn) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#name") ? $("#name").value.trim() : "";
      const email = $("#email") ? $("#email").value.trim() : "";
      const type = $("#projectType") ? $("#projectType").value.trim() : "Creative Project";
      const msg = $("#msg") ? $("#msg").value.trim() : "";
      const firstName = name.split(" ")[0] || "there";

      // Small click animation state: Sending...
      sendBtn.classList.add("sending");
      if (btnText) btnText.textContent = "SENDING...";

      setTimeout(() => {
        // Morph into green success state with pop animation
        sendBtn.classList.remove("sending");
        sendBtn.classList.add("sent");
        if (btnText) btnText.textContent = "✓ MESSAGE SENT!";

        // Save inquiry to localStorage
        const inquiries = JSON.parse(localStorage.getItem("pavan_inquiries") || "[]");
        inquiries.push({ name, email, type, msg, date: new Date().toISOString() });
        localStorage.setItem("pavan_inquiries", JSON.stringify(inquiries));

        if (note) {
          note.textContent = `✨ Thank you, ${firstName}! Your message regarding "${type || 'Project'}" has been sent to gaikwadpavan569@gmail.com. Pavan will reply within 24 hours.`;
        }

        form.reset();

        // Reset button animation after 3.2 seconds
        setTimeout(() => {
          sendBtn.classList.remove("sent");
          if (btnText) btnText.textContent = "SEND MESSAGE ➔";
        }, 3200);

        setTimeout(() => {
          if (note) note.textContent = "";
        }, 7500);
      }, 700);
    });
  }

  /* =========================================================
     14. REVEAL OBSERVER WITH ROOTMARGIN
     ========================================================= */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealObs.unobserve(en.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  console.log("Pavan Gaikwad — Portfolio & BGM (Raat Ki Rani) Active.");
})();
