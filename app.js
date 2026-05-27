const root = document.documentElement;
    const canvas = document.getElementById("cosmos");
    const ctx = canvas.getContext("2d");
    const petalField = document.getElementById("petalField");
    const sparkField = document.getElementById("sparkField");
    const burstLayer = document.getElementById("burstLayer");
    const bookWrap = document.querySelector(".book-wrap");
    const coverPanel = document.getElementById("coverPanel");
    const scenes = [...document.querySelectorAll(".scene")];
    const PAGE_TURN_MS = 920;
    const PAGE_TURN_MID = 420;
    const indicator = document.getElementById("pageIndicator");
    const sceneOrder = scenes.map((scene) => scene.dataset.scene);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const mobileQuery = window.matchMedia("(max-width: 680px)");
    const tabletQuery = window.matchMedia("(max-width: 1040px)");
    const rewardPdfPath = "recompensa.pdf";
    const isLowPowerDevice = () => root.dataset.device === "mobile" || root.dataset.device === "tablet";
    const notesStorageKey = "pokemon-love-page-notes";

    const pokemon = {
      mew: {
        name: "Mew",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
      },
      gardevoir: {
        name: "Gardevoir",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png"
      },
      sylveon: {
        name: "Sylveon",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png"
      },
      espeon: {
        name: "Espeon",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png"
      },
      pikachu: {
        name: "Pikachu",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
      },
      eevee: {
        name: "Eevee",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
      },
      vulpix: {
        name: "Vulpix",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png"
      },
      milotic: {
        name: "Milotic",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/350.png"
      },
      dragonair: {
        name: "Dragonair",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png"
      },
      jirachi: {
        name: "Jirachi",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/385.png"
      },
      celebi: {
        name: "Celebi",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/251.png"
      },
      togekiss: {
        name: "Togekiss",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/468.png"
      }
    };

    const totalPairs = 12;

    let width = 0;
    let height = 0;
    let stars = [];
    let dust = [];
    let activeScene = "cover";
    let memoryStarted = false;
    let timerId = null;
    let seconds = 0;
    let moves = 0;
    let pairs = 0;
    let lockBoard = false;
    let flipped = [];
    let cosmosFrameId = null;
    let lastCosmosFrame = 0;
    let notesOpen = false;
    let selectedNote = null;
    let pageNotes = loadNotes();

    function setDeviceMode() {
      const widthNow = window.innerWidth;
      const heightNow = window.innerHeight;
      const isCoarse = coarsePointerQuery.matches;
      const device = mobileQuery.matches || (isCoarse && widthNow <= 820)
        ? "mobile"
        : tabletQuery.matches || isCoarse
          ? "tablet"
          : "desktop";

      root.dataset.device = device;
      root.dataset.pointer = isCoarse ? "touch" : "fine";
      root.dataset.orientation = heightNow >= widthNow ? "portrait" : "landscape";
    }

    const constellationTemplates = [
      {
        name: "Pikachu",
        anchor: { x: .12, y: .17 },
        scale: .86,
        points: [
          [0, 22], [12, 0], [24, 28], [41, 22], [58, 0], [72, 23],
          [60, 48], [47, 64], [29, 64], [14, 48], [0, 22], [20, 78],
          [38, 92], [57, 78], [72, 23]
        ],
        links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0],[9,10],[10,11],[11,12],[12,6],[2,8],[3,7]]
      },
      {
        name: "Eevee",
        anchor: { x: .78, y: .2 },
        scale: .82,
        points: [
          [4, 42], [16, 8], [34, 38], [49, 10], [63, 42],
          [58, 62], [45, 75], [27, 75], [13, 62], [4, 42],
          [21, 86], [37, 98], [53, 86]
        ],
        links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[8,10],[10,11],[11,12],[12,5],[2,7],[4,6]]
      },
      {
        name: "Sylveon",
        anchor: { x: .63, y: .72 },
        scale: .88,
        points: [
          [8, 38], [25, 12], [41, 36], [58, 12], [74, 38],
          [63, 58], [46, 64], [58, 84], [38, 74], [17, 84],
          [29, 64], [12, 58], [8, 38], [3, 18], [79, 18]
        ],
        links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[6,8],[8,9],[8,10],[10,11],[11,12],[0,13],[4,14],[2,10],[5,7]]
      }
    ];

    function resizeCanvas() {
      const dprCap = root.dataset.device === "mobile" ? 1 : root.dataset.device === "tablet" ? 1.25 : 1.5;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createCosmos();
    }

    function random(min, max) {
      return min + Math.random() * (max - min);
    }

    function createCosmos() {
      const scale = root.dataset.device === "mobile" ? .45 : root.dataset.device === "tablet" ? .65 : 1;
      const starCount = Math.floor(Math.min(210, Math.max(70, width * height / 9800)) * scale);
      const dustCount = Math.floor(starCount * (isLowPowerDevice() ? .12 : .2));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: random(.35, 1.7),
        alpha: random(.25, .95),
        twinkle: random(.005, .026),
        phase: random(0, Math.PI * 2),
        drift: random(.02, .18),
        warm: Math.floor(random(210, 245))
      }));
      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: random(22, 96),
        alpha: random(.018, .08),
        hue: random(318, 348),
        phase: random(0, Math.PI * 2)
      }));
    }

    function drawNebula(t) {
      if (isLowPowerDevice()) return;
      for (const cloud of dust) {
        const x = cloud.x + Math.cos(t * .00016 + cloud.phase) * 18;
        const y = cloud.y + Math.sin(t * .00018 + cloud.phase) * 14;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, cloud.r);
        gradient.addColorStop(0, `hsla(${cloud.hue}, 100%, 62%, ${cloud.alpha})`);
        gradient.addColorStop(.42, `hsla(${cloud.hue}, 100%, 42%, ${cloud.alpha * .52})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawStars(t) {
      for (const star of stars) {
        const pulse = .55 + Math.sin(t * star.twinkle + star.phase) * .45;
        const x = (star.x + t * .004 * star.drift) % width;
        const y = star.y + Math.sin(t * .0004 + star.phase) * 2;
        ctx.fillStyle = `rgba(255, ${star.warm}, 245, ${star.alpha * pulse})`;
        ctx.shadowColor = "rgba(255, 63, 150, .9)";
        ctx.shadowBlur = isLowPowerDevice() ? 0 : 9 * pulse;
        ctx.beginPath();
        ctx.arc(x, y, star.r * (1 + pulse * .38), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function drawConstellation(template, t) {
      if (root.dataset.device === "mobile") return;
      const base = Math.min(width, height) * .0024 * template.scale;
      const driftX = Math.sin(t * .00023 + template.anchor.x * 9) * 16;
      const driftY = Math.cos(t * .00021 + template.anchor.y * 7) * 12;
      const offsetX = width * template.anchor.x + driftX;
      const offsetY = height * template.anchor.y + driftY;
      const pts = template.points.map(([x, y]) => ({
        x: offsetX + x * base,
        y: offsetY + y * base
      }));

      ctx.save();
      ctx.lineWidth = Math.max(1, base * .6);
      ctx.lineCap = "round";
      for (const [a, b] of template.links) {
        const from = pts[a];
        const to = pts[b];
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, "rgba(255, 222, 121, .08)");
        gradient.addColorStop(.5, "rgba(255, 94, 177, .48)");
        gradient.addColorStop(1, "rgba(255, 222, 121, .1)");
        ctx.strokeStyle = gradient;
        ctx.shadowColor = "rgba(255, 49, 145, .88)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }

      pts.forEach((point, index) => {
        const pulse = .72 + Math.sin(t * .003 + index) * .28;
        ctx.fillStyle = `rgba(255, 247, 230, ${.72 + pulse * .25})`;
        ctx.shadowColor = index % 2 ? "rgba(255, 215, 102, .95)" : "rgba(255, 44, 143, .95)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(1.8, base * 1.8 * pulse), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(255, 230, 245, .4)";
      ctx.font = `${Math.max(12, base * 8)}px Georgia, serif`;
      ctx.fillText(template.name, offsetX + 12 * base, offsetY + 116 * base);
      ctx.restore();
    }

    function animateCosmos(t = 0) {
      const targetFrameTime = isLowPowerDevice() ? 66 : 33;
      if (document.hidden && !prefersReduced) {
        cosmosFrameId = null;
        return;
      }
      if (!prefersReduced && t - lastCosmosFrame < targetFrameTime) {
        cosmosFrameId = requestAnimationFrame(animateCosmos);
        return;
      }
      lastCosmosFrame = t;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      drawNebula(t);
      drawStars(t);
      constellationTemplates.forEach((template) => drawConstellation(template, t));
      ctx.globalCompositeOperation = "source-over";
      if (!prefersReduced) {
        cosmosFrameId = requestAnimationFrame(animateCosmos);
      }
    }

    function createAtmosphere() {
      const atmosphereScale = root.dataset.device === "mobile" ? .36 : root.dataset.device === "tablet" ? .55 : 1;
      const petalCount = Math.floor(Math.min(52, Math.max(28, Math.floor(window.innerWidth / 25))) * atmosphereScale);
      const sparkCount = Math.floor(Math.min(70, Math.max(34, Math.floor(window.innerWidth / 21))) * atmosphereScale);

      petalField.innerHTML = "";
      sparkField.innerHTML = "";

      for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement("span");
        petal.className = "petal";
        petal.style.setProperty("--x", `${random(-2, 102)}vw`);
        petal.style.setProperty("--s", `${random(8, 22)}px`);
        petal.style.setProperty("--o", random(.34, .9).toFixed(2));
        petal.style.setProperty("--r", `${random(0, 360)}deg`);
        petal.style.setProperty("--d", `${random(9, 20)}s`);
        petal.style.setProperty("--delay", `${random(-18, 0)}s`);
        petal.style.setProperty("--drift", `${random(-130, 130)}px`);
        petalField.appendChild(petal);
      }

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("span");
        spark.className = "spark";
        spark.style.setProperty("--x", `${random(0, 100)}vw`);
        spark.style.setProperty("--y", `${random(0, 100)}vh`);
        spark.style.setProperty("--d", `${random(2.4, 6.2)}s`);
        spark.style.setProperty("--delay", `${random(-6, 0)}s`);
        sparkField.appendChild(spark);
      }
    }

    function renderIndicator() {
      indicator.innerHTML = "";
      sceneOrder.forEach((scene) => {
        const dot = document.createElement("span");
        dot.className = `dot${scene === activeScene ? " active" : ""}`;
        indicator.appendChild(dot);
      });
    }

    function loadNotes() {
      try {
        return JSON.parse(localStorage.getItem(notesStorageKey)) || {};
      } catch {
        return {};
      }
    }

    function saveNotes() {
      localStorage.setItem(notesStorageKey, JSON.stringify(pageNotes));
    }

    function getCurrentNotes() {
      return pageNotes[activeScene] || [];
    }

    function renderNotes() {
      const list = document.getElementById("notesList");
      if (!list) return;
      const widget = document.getElementById("notesWidget");
      if (widget) {
        widget.classList.toggle("hidden", activeScene === "cover");
      }
      const notes = getCurrentNotes();
      list.innerHTML = "";
      widget?.classList.toggle("has-notes", notes.length > 0);

      notes.forEach((note, index) => {
        const button = document.createElement("button");
        button.className = "note-chip";
        button.type = "button";
        button.textContent = `${index + 1}`;
        button.setAttribute("aria-label", `Leer nota ${index + 1}`);
        button.addEventListener("click", () => openNote(note.id));
        list.appendChild(button);
      });
    }

    function setNotesOpen(open) {
      notesOpen = open;
      document.getElementById("notesWidget")?.classList.toggle("open", open);
      document.getElementById("notesToggle")?.setAttribute("aria-expanded", String(open));
    }

    function openNote(id = null) {
      selectedNote = id;
      const note = id ? getCurrentNotes().find((item) => item.id === id) : null;
      const modal = document.getElementById("noteModal");
      const title = document.getElementById("noteModalTitle");
      const text = document.getElementById("noteText");
      const read = document.getElementById("noteRead");
      const save = document.getElementById("noteSave");
      const remove = document.getElementById("noteDelete");
      if (!modal || !title || !text || !read || !save || !remove) return;

      title.textContent = note ? "Nota guardada" : "Nueva nota";
      text.value = note?.text || "";
      read.textContent = note?.text || "";
      text.hidden = Boolean(note);
      read.hidden = !note;
      save.textContent = note ? "Editar" : "Guardar";
      remove.hidden = !note;
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      if (!note) text.focus();
    }

    function closeNote() {
      document.getElementById("noteModal")?.classList.remove("show");
      document.getElementById("noteModal")?.setAttribute("aria-hidden", "true");
      selectedNote = null;
    }

    function saveCurrentNote() {
      const text = document.getElementById("noteText");
      const read = document.getElementById("noteRead");
      if (!text || !read) return;

      const existing = selectedNote ? getCurrentNotes().find((note) => note.id === selectedNote) : null;
      if (existing && text.hidden) {
        text.hidden = false;
        read.hidden = true;
        text.value = existing.text;
        text.focus();
        document.getElementById("noteSave").textContent = "Guardar";
        return;
      }

      const value = text.value.trim();
      if (!value) return;
      const notes = [...getCurrentNotes()];
      if (selectedNote) {
        const index = notes.findIndex((note) => note.id === selectedNote);
        if (index >= 0) notes[index] = { ...notes[index], text: value };
      } else {
        notes.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text: value });
      }
      pageNotes[activeScene] = notes.slice(-8);
      saveNotes();
      renderNotes();
      setNotesOpen(true);
      closeNote();
    }

    function deleteCurrentNote() {
      if (!selectedNote) return;
      pageNotes[activeScene] = getCurrentNotes().filter((note) => note.id !== selectedNote);
      saveNotes();
      renderNotes();
      closeNote();
    }

    function updatePanelMode(name) {
      if (!coverPanel) return;
      coverPanel.dataset.mode = name === "cover" ? "cover" : "interior";
      bookWrap.dataset.pageMode = coverPanel.dataset.mode;
    }

    function ensureFolios() {
      scenes.forEach((scene) => {
        const inner = scene.querySelector(".scene-inner");
        if (!inner || inner.querySelector(".folio")) return;
        const folio = document.createElement("span");
        folio.className = "folio";
        folio.setAttribute("aria-hidden", "true");
        inner.appendChild(folio);
      });
    }

    function updateFolios(name) {
      const activeIndex = sceneOrder.indexOf(name);
      scenes.forEach((scene) => {
        const folio = scene.querySelector(".folio");
        if (!folio) return;
        const index = sceneOrder.indexOf(scene.dataset.scene);
        folio.textContent = `${index + 1} / ${sceneOrder.length}`;
        folio.classList.toggle("visible", index === activeIndex);
      });
    }

    function applyScene(name) {
      activeScene = name;
      scenes.forEach((scene) => {
        scene.classList.toggle("active", scene.dataset.scene === name);
      });
      updatePanelMode(name);
      updateFolios(name);
      if (location.hash !== `#${name}`) {
        history.replaceState(null, "", `#${name}`);
      }
      document.getElementById("winRibbon").classList.remove("show");
      renderIndicator();
      renderNotes();
      if (name === "memory" && !memoryStarted) {
        resetMemory();
      }
    }

    function playPageFlipSound() {
      if (prefersReduced) return;
      playTone(180, .04, "triangle", .018);
      setTimeout(() => playTone(120, .06, "sine", .012), 60);
    }

    function goToScene(name) {
      if (!sceneOrder.includes(name) || name === activeScene) return;
      const previousIndex = sceneOrder.indexOf(activeScene);
      const nextIndex = sceneOrder.indexOf(name);
      const direction = nextIndex >= previousIndex ? "next" : "prev";
      bookWrap.dataset.turn = direction;
      bookWrap.dataset.nextScene = name;

      const finishTurn = () => {
        bookWrap.classList.remove("is-turning");
        delete bookWrap.dataset.nextScene;
      };

      if (prefersReduced) {
        applyScene(name);
        createBurst(window.innerWidth / 2, window.innerHeight / 2, 16, 400);
        playTone(name === "memory" ? 440 : 560, .055, "sine", .035);
        return;
      }

      bookWrap.classList.remove("is-turning");
      void bookWrap.offsetWidth;
      bookWrap.classList.add("is-turning");
      playPageFlipSound();

      setTimeout(() => {
        applyScene(name);
        createBurst(window.innerWidth / 2, window.innerHeight / 2, 26, 600);
        playTone(name === "memory" ? 440 : 560, .055, "sine", .035);
      }, PAGE_TURN_MID);

      setTimeout(finishTurn, PAGE_TURN_MS);
    }

    function resetExperience() {
      clearInterval(timerId);
      memoryStarted = false;
      seconds = 0;
      moves = 0;
      pairs = 0;
      lockBoard = false;
      flipped = [];
      document.getElementById("rewardMessage").classList.remove("show");
      document.getElementById("winRibbon").classList.remove("show");
      document.getElementById("memoryNext").classList.add("locked");
      document.getElementById("memoryGrid").innerHTML = "";
      updateHud();

      bookWrap.classList.add("is-closing");
      createBurst(window.innerWidth / 2, window.innerHeight / 2, 34, 360);
      playTone(250, .12, "triangle", .018);
      setTimeout(() => {
        goToScene("cover");
        bookWrap.classList.remove("is-closing");
      }, 620);
    }

    function createBurst(x, y, count = 18, spread = 240) {
      if (prefersReduced) return;
      for (let i = 0; i < count; i++) {
        const burst = document.createElement("span");
        const angle = (Math.PI * 2 * i) / count + random(-.22, .22);
        const distance = random(spread * .24, spread);
        burst.className = "burst";
        burst.style.setProperty("--x", `${x}px`);
        burst.style.setProperty("--y", `${y}px`);
        burst.style.setProperty("--s", `${random(5, 13)}px`);
        burst.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
        burst.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
        burst.style.setProperty("--d", `${random(.7, 1.15)}s`);
        burstLayer.appendChild(burst);
        burst.addEventListener("animationend", () => burst.remove(), { once: true });
      }
    }

    function playTone(freq, duration = .08, type = "sine", volume = .025) {
      if (prefersReduced) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audio = playTone.ctx || new AudioContext();
        playTone.ctx = audio;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = type;
        oscillator.frequency.value = freq;
        gain.gain.setValueAtTime(0, audio.currentTime);
        gain.gain.linearRampToValueAtTime(volume, audio.currentTime + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + duration + .02);
      } catch {
        /* Audio is decorative and safe to skip. */
      }
    }

    function formatTime(value) {
      const mins = Math.floor(value / 60).toString().padStart(2, "0");
      const secs = (value % 60).toString().padStart(2, "0");
      return `${mins}:${secs}`;
    }

    function updateHud() {
      document.getElementById("timeValue").textContent = formatTime(seconds);
      document.getElementById("movesValue").textContent = moves;
      document.getElementById("pairsValue").textContent = `${pairs}/${totalPairs}`;
    }

    function startTimer() {
      clearInterval(timerId);
      timerId = setInterval(() => {
        seconds += 1;
        updateHud();
      }, 1000);
    }

    function shuffle(items) {
      return items
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
    }

    function resetMemory() {
      memoryStarted = true;
      seconds = 0;
      moves = 0;
      pairs = 0;
      lockBoard = false;
      flipped = [];
      updateHud();
      startTimer();
      document.getElementById("memoryNext").classList.add("locked");
      document.getElementById("winRibbon").classList.remove("show");
      const grid = document.getElementById("memoryGrid");
      const keys = [
        "mew",
        "gardevoir",
        "sylveon",
        "espeon",
        "pikachu",
        "eevee",
        "vulpix",
        "milotic",
        "dragonair",
        "jirachi",
        "celebi",
        "togekiss"
      ];
      const deck = shuffle([...keys, ...keys].map((key, index) => ({ key, uid: `${key}-${index}` })));
      grid.innerHTML = "";

      deck.forEach((card) => {
        const data = pokemon[card.key];
        const button = document.createElement("button");
        button.className = "memory-card";
        button.type = "button";
        button.dataset.key = card.key;
        button.dataset.uid = card.uid;
        button.setAttribute("aria-label", `Carta ${data.name}`);
        button.innerHTML = `
          <span class="memory-card-inner">
            <span class="card-face card-back"></span>
            <span class="card-face card-front">
              <img alt="${data.name}" src="${data.img}" loading="lazy" decoding="async">
              <span>${data.name}</span>
            </span>
          </span>
        `;
        const cardImage = button.querySelector("img");
        if (cardImage) {
          cardImage.addEventListener("error", () => {
            cardImage.outerHTML = `<span style="position:static;font-size:1.8rem">${data.name}</span>`;
          });
        }
        button.addEventListener("click", () => flipCard(button));
        grid.appendChild(button);
      });
    }

    function flipCard(card) {
      if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;
      card.classList.add("flipped");
      flipped.push(card);
      playTone(520 + flipped.length * 70, .045, "triangle", .022);

      if (flipped.length === 2) {
        moves += 1;
        updateHud();
        checkPair();
      }
    }

    function checkPair() {
      const [first, second] = flipped;
      const matched = first.dataset.key === second.dataset.key;
      lockBoard = true;

      if (matched) {
        setTimeout(() => {
          first.classList.add("matched");
          second.classList.add("matched");
          pairs += 1;
          updateHud();
          const rect = second.getBoundingClientRect();
          createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18, 180);
          playTone(760, .09, "sine", .035);
          flipped = [];
          lockBoard = false;
          if (pairs === totalPairs) finishMemory();
        }, 280);
      } else {
        setTimeout(() => {
          first.classList.remove("flipped");
          second.classList.remove("flipped");
          flipped = [];
          lockBoard = false;
          playTone(240, .07, "sawtooth", .012);
        }, 760);
      }
    }

    function finishMemory() {
      clearInterval(timerId);
      document.getElementById("memoryNext").classList.remove("locked");
      document.getElementById("winRibbon").classList.add("show");
      createBurst(window.innerWidth / 2, window.innerHeight / 2, 48, 420);
      playTone(880, .14, "sine", .04);
      setTimeout(() => playTone(1175, .16, "sine", .035), 120);
    }

    function wireEvents() {
      document.addEventListener("click", (event) => {
        const next = event.target.closest("[data-next]");
        if (!next || next.classList.contains("locked")) return;
        goToScene(next.dataset.next);
      });

      document.getElementById("yesReward").addEventListener("click", (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const messageText = document.getElementById("rewardMessageText");
        messageText.textContent = "Abriendo tu recompensa dentro del libro...";
        document.getElementById("rewardMessage").classList.add("show");
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 72, 520);
        playTone(932, .12, "sine", .04);
        setTimeout(() => playTone(1244, .18, "sine", .035), 120);
        setTimeout(() => {
          document.getElementById("rewardMessage").classList.remove("show");
          goToScene("pdf");
        }, 520);
      });

      document.getElementById("closeBookFinal")?.addEventListener("click", () => {
        resetExperience();
      });

      document.getElementById("notesToggle")?.addEventListener("click", () => {
        setNotesOpen(!notesOpen);
      });

      document.getElementById("notesAdd")?.addEventListener("click", () => openNote());
      document.getElementById("noteClose")?.addEventListener("click", closeNote);
      document.getElementById("noteSave")?.addEventListener("click", saveCurrentNote);
      document.getElementById("noteDelete")?.addEventListener("click", deleteCurrentNote);

      document.getElementById("noteModal")?.addEventListener("click", (event) => {
        if (event.target.id === "noteModal") closeNote();
      });

      document.getElementById("noReward").addEventListener("click", (event) => {
        event.currentTarget.animate([
          { transform: "translateX(0)" },
          { transform: "translateX(-8px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(0)" }
        ], { duration: 320, easing: "ease-out" });
        resetExperience();
      });

      document.querySelectorAll(".pokemon img, .card-front img").forEach((img) => {
        img.addEventListener("error", () => {
          img.closest(".pokemon")?.classList.add("broken");
        });
      });

      window.addEventListener("pointermove", (event) => {
        if (coarsePointerQuery.matches) return;
        const x = (event.clientX / window.innerWidth - .5) * 2;
        const y = (event.clientY / window.innerHeight - .5) * 2;
        root.style.setProperty("--mx", x.toFixed(3));
        root.style.setProperty("--my", y.toFixed(3));
      }, { passive: true });

      window.addEventListener("resize", () => {
        setDeviceMode();
        resizeCanvas();
        createAtmosphere();
      });

      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && !prefersReduced && !cosmosFrameId) {
          lastCosmosFrame = 0;
          cosmosFrameId = requestAnimationFrame(animateCosmos);
        }
      });

      window.addEventListener("hashchange", () => {
        const hashScene = location.hash.replace("#", "");
        if (sceneOrder.includes(hashScene) && hashScene !== activeScene) {
          goToScene(hashScene);
        }
      });
    }

    setDeviceMode();
    resizeCanvas();
    createAtmosphere();
    ensureFolios();
    updatePanelMode("cover");
    renderIndicator();
    wireEvents();
    updateFolios("cover");
    renderNotes();
    const initialScene = location.hash.replace("#", "");
    if (sceneOrder.includes(initialScene) && initialScene !== "cover") {
      applyScene(initialScene);
    }
    if (!prefersReduced) {
      cosmosFrameId = requestAnimationFrame(animateCosmos);
    } else {
      animateCosmos();
    }
