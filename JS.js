// =======================
// NOTÍCIAS (estáticas)
// =======================

const newsData = [
  {
    area: "Amistoso Sporting",
    title: "Vitória escapa nos minutos finais",
    excerpt:
      "Em um amistoso equilibrado, começamos a partida atrás do placar, entretanto, com ordem tática conseguimos excelentes oportunidades de arremates a gol. O que resultou na virada de placar e também ampliar para 1-3. Mas infelizmente nosso adversário aproveitou algumas falhas de marcação, empatou a partida e nos minutos finais virou novamente o resultado. Final de partida: 4-3 para o time da casa.",
  },
  {
    area: "Amistoso River Sapucaia",
    title: "Acabou o jejum: a vitória veio",
    excerpt:
      "Em uma partida muito disputada, alcançamos nosso objetivo: vitória! Assim, acabamos com um jejum de derrotas.",
  },
  {
    area: "Copa VIP Sapucaia",
    title: "Empate nos minutos finais",
    excerpt:
      "Em uma partida eletrizante do início ao fim, com três viradas no placar, a partida finaliza com os marcadores iguais: 5-5. Resultado que impede a equipe Spurs seguir para a próxima fase da Copa VIP Sapucaia.",
  },
];

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function renderNews() {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  newsData.forEach((n) => {
    const card = createElement("article", "news-card");

    const chip = createElement("div", "news-chip", n.area.toUpperCase());
    card.appendChild(chip);

    const h3 = createElement("h3", "news-title", n.title);
    card.appendChild(h3);

    const p = createElement("p", "news-excerpt", n.excerpt);
    card.appendChild(p);

    const footer = createElement("div", "news-footer", "Spurs News");
    card.appendChild(footer);

    grid.appendChild(card);
  });
}

// =======================
// NAV / SCROLL
// =======================

function setupNavToggle() {
  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("navToggle");
  if (!nav || !toggle) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerOffset = 72;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

// =======================
// DADOS EXTERNOS (JSON)
// =======================

function carregarDadosExternos() {
  fetch("dados.json")
    .then((res) => res.json())
    .then((dados) => {
      inicializarCalendarioTimeline(dados.jogos || []);
      inicializarArtilhariaEAassistencias(dados.atletas || []);
      iniciarGaleria3D(dados.galeria); // GALERIA AQUI
      inicializarElencoCarrossel(dados.atletas || []);
      atualizarHeroProximoJogo(dados.jogos || []);
      inicializarCalendarioTimeline(dados.jogos);
      inicializarHistoricoCalendario(dados.jogos);
    })
    .catch((err) => console.error("Erro ao carregar dados.json", err));
}

// =======================
// HERO - PRÓXIMO JOGO
// =======================

function atualizarHeroProximoJogo(jogos) {
  const container = document.getElementById("heroNextMatch");
  if (!container || !jogos.length) return;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const futuros = jogos
    .map((j) => ({
      ...j,
      dataObj: new Date(j.data + "T00:00:00"),
    }))
    .filter((j) => j.dataObj >= hoje);

  const proximo = futuros.sort((a, b) => a.dataObj - b.dataObj)[0] || jogos[0];
  if (!proximo) return;

  const dataFormatada = new Date(proximo.data + "T00:00:00").toLocaleDateString(
    "pt-BR"
  );

  const hora = proximo.hora || "20h00"; // fallback padrão

  container.innerHTML = `
        <div class="teams">
            <div class="team">
                <span class="team-label">Casa</span>
                <span class="team-name">${proximo.mandante}</span>
            </div>

            <div class="vs">vs</div>

            <div class="team">
                <span class="team-label">Visitante</span>
                <span class="team-name highlight">${proximo.visitante}</span>
            </div>
        </div>

        <div class="match-info">
            <p><strong>Data:</strong> ${dataFormatada} · ${hora}</p>
            <p><strong>Ginásio:</strong> ${proximo.local || "A definir"}</p>
        </div>

        <a href="#calendario" class="btn">
            Ver calendário completo
        </a>
    `;
}

// =======================
// CALENDÁRIO
// =======================

function inicializarCalendarioTimeline(jogos) {
  const list = document.getElementById("calendarList");
  if (!list) return;

  list.innerHTML = "";

  // ORDENA POR DATA CRESCENTE
  const ordenados = [...jogos].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  // FILTRA POR STATUS
  const proximos = ordenados.filter((j) => j.status === "proximo");
  const outros = ordenados.filter((j) => j.status !== "proximo").reverse();

  // Sempre 3 jogos no total, podendo ser qualquer status
  const exibidos = [
    ...proximos.slice(0, 1),
    ...outros.slice(0, 3 - Math.min(1, proximos.length)),
  ];

  exibidos.forEach((jogo) => {
    const item = document.createElement("div");
    item.className = "timeline-item";

    const status = jogo.status || "proximo";
    const dataObj = new Date(jogo.data + "T00:00:00");

    const statusLabel =
      status === "finalizado"
        ? "Finalizado"
        : status === "proximo"
        ? "Próxima partida"
        : status === "adiado"
        ? "Adiado"
        : "Cancelado";

    const placar =
      jogo.placarMandante != null && jogo.placarVisitante != null
        ? `<div class="calendar-score">${jogo.placarMandante} x ${jogo.placarVisitante}</div>`
        : `<div class="calendar-score">- x -</div>`;

    item.innerHTML = `
          <div class="timeline-content">
            <div class="calendar-row">

              <!-- ESQUERDA -->
              <div class="calendar-col calendar-left">
                <div class="timeline-competition">${(
                  jogo.competicao || "Jogo"
                ).toUpperCase()}</div>
                <div class="timeline-local">${
                  jogo.local || "Local a definir"
                }</div>
              </div>

              <!-- CENTRO -->
              <div class="calendar-col calendar-middle">
                <div class="calendar-team-grid">
                  <div class="team-box">
                    <span class="calendar-team-label">Casa</span>
                    <span class="calendar-team-name">${jogo.mandante}</span>
                  </div>

                  ${placar}

                  <div class="team-box">
                    <span class="calendar-team-label">Visitante</span>
                    <span class="calendar-team-name">${jogo.visitante}</span>
                  </div>
                </div>
              </div>

              <!-- DIREITA -->
              <div class="calendar-col calendar-right">
                <div class="timeline-date">${dataObj.toLocaleDateString(
                  "pt-BR"
                )}</div>
                <div class="timeline-status badge-${status}">${statusLabel}</div>
              </div>

            </div>
          </div>
        `;

    list.appendChild(item);
  });
}

function inicializarHistoricoCalendario(jogos) {
  const grid = document.getElementById("calendarHistoryGrid");
  const selectTemporada = document.getElementById("filtroTemporada");
  const selectMes = document.getElementById("filtroMes");

  if (!grid || !selectTemporada || !selectMes) return;

  // ----- monta temporadas automaticamente -----
  const temporadas = [
    ...new Set(jogos.map((j) => new Date(j.data).getFullYear())),
  ].sort((a, b) => b - a);

  selectTemporada.innerHTML = "";
  temporadas.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    selectTemporada.appendChild(opt);
  });

  // seleciona a última temporada automaticamente
  const temporadaAtual = temporadas[0];
  selectTemporada.value = temporadaAtual;

  function montarFiltroMes() {
    const ano = Number(selectTemporada.value);

    const mesesDisponiveis = jogos
      .filter((j) => new Date(j.data).getFullYear() === ano)
      .map((j) => new Date(j.data).getMonth());

    const mesesUnicos = [...new Set(mesesDisponiveis)].sort((a, b) => b - a);

    selectMes.innerHTML = "";
    mesesUnicos.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = new Date(ano, m).toLocaleString("pt-BR", {
        month: "long",
      });
      selectMes.appendChild(opt);
    });

    // seleciona automaticamente o último mês
    selectMes.value = mesesUnicos[0];
  }

  function renderHistorico() {
    const ano = Number(selectTemporada.value);
    const mes = Number(selectMes.value);

    const filtrados = jogos.filter((j) => {
      const data = new Date(j.data);
      return data.getFullYear() === ano && data.getMonth() === mes;
    });

    grid.innerHTML = "";

    filtrados.forEach((jogo) => {
      const card = document.createElement("div");
      card.className = "history-card";

      const dataFormatada = new Date(jogo.data).toLocaleDateString("pt-BR");

      const placar =
        jogo.placarMandante != null
          ? `${jogo.placarMandante} x ${jogo.placarVisitante}`
          : "- x -";

      card.innerHTML = `
  <div class="history-card-inner">
    <div class="history-row">
      <span class="history-team left">${jogo.mandante}</span>

      <span class="history-score">
        ${jogo.placarMandante != null ? jogo.placarMandante : "-"} 
        x 
        ${jogo.placarVisitante != null ? jogo.placarVisitante : "-"}
      </span>

      <span class="history-team right">${jogo.visitante}</span>
    </div>

    <div class="history-date">
      ${new Date(jogo.data + "T00:00:00").toLocaleDateString("pt-BR")}
    </div>
  </div>
`;

      grid.appendChild(card);
    });
  }

  montarFiltroMes();
  renderHistorico();

  selectTemporada.addEventListener("change", () => {
    montarFiltroMes();
    renderHistorico();
  });

  selectMes.addEventListener("change", renderHistorico);
}

// =======================
// ARTILHARIA & ASSISTÊNCIAS
// =======================

function inicializarArtilhariaEAassistencias(atletas) {
  const selectTemporada = document.getElementById("temporadaSelect");
  const tbodyGols = document.getElementById("tbodyGols");
  const tbodyAssist = document.getElementById("tbodyAssistencias");
  const tbodyGoleiros = document.getElementById("tbodyGoleiros");

  if (!selectTemporada || !tbodyGols || !tbodyAssist || !tbodyGoleiros) return;

  // ----- MONTA TEMPORADAS DINAMICAMENTE DO JSON -----
  const temporadasSet = new Set();

  atletas.forEach((a) => {
    if (a.temporadas) {
      Object.keys(a.temporadas).forEach((t) => temporadasSet.add(t));
    }
  });

  const temporadasOrdenadas = [...temporadasSet].sort((a, b) => b - a);

  selectTemporada.innerHTML = "";
  temporadasOrdenadas.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    selectTemporada.appendChild(opt);
  });

  selectTemporada.value = temporadasOrdenadas[0];

  // ----------------------------
  // RENDERIZA AS TABELAS
  // ----------------------------
  function renderTabelas() {
    const temporada = selectTemporada.value;

    tbodyGols.innerHTML = "";
    tbodyAssist.innerHTML = "";
    tbodyGoleiros.innerHTML = "";

    const listaGols = [];
    const listaAssist = [];
    const listaGoleiros = [];

    atletas.forEach((a) => {
      const stats = a.temporadas?.[temporada];
      if (!stats) return;

      listaGols.push({ ...a, valor: stats.gols, jogos: stats.jogos || 0 });
      listaAssist.push({
        ...a,
        valor: stats.assistencias,
        jogos: stats.jogos || 0,
      });

      if (
        a.posicao?.toLowerCase().includes("goleiro") &&
        stats.golsSofridos != null &&
        !listaGoleiros.some((g) => g.nome === a.nome)
      ) {
        listaGoleiros.push({
          ...a,
          valor: stats.golsSofridos,
          assistencias: stats.assistencias ?? 0,
          jogos: stats.jogos || 0,
        });
      }
    });

    listaGols.sort((a, b) => b.valor - a.valor);
    listaAssist.sort((a, b) => b.valor - a.valor);
    listaGoleiros.sort((a, b) => a.valor - b.valor);

    renderLista(listaGols, tbodyGols);
    renderLista(listaAssist, tbodyAssist);
    renderLista(listaGoleiros, tbodyGoleiros);

    ativarLazyFade(tbodyGols);
    ativarLazyFade(tbodyAssist);
    ativarLazyFade(tbodyGoleiros);
  }

  // ----------------------------
  // RENDERIZA UMA LISTA
  // ----------------------------
  function renderLista(lista, tbody) {
    lista.forEach((a, idx) => {
      const medalha =
        idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "";

      const tr = document.createElement("tr");

      // Coluna extra de assistências para goleiros
      const colExtra = tbody.id === "tbodyGoleiros"
        ? `<td>${a.assistencias ?? 0}</td>`
        : "";

      tr.innerHTML = `
        <td class="atleta-col">
          <img class="atleta-avatar" src="${a.foto}" alt="${a.nome}"
               onerror="this.style.opacity='0.3'">
          <span>${a.nome}</span>
        </td>
        <td>${a.valor} ${medalha}</td>
        ${colExtra}
        <td>${a.jogos || 0}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  selectTemporada.addEventListener("change", renderTabelas);
  renderTabelas();
}

// =======================
// CARROSSEL ELENCO
// =======================

function inicializarElencoCarrossel(atletas) {
  const track    = document.getElementById("elencoTrack");
  const viewport = document.querySelector(".elenco-viewport");
  const section  = document.getElementById("elenco");
  const btnPrev  = document.getElementById("elencoPrev");
  const btnNext  = document.getElementById("elencoNext");

  if (!track || !viewport || !atletas?.length) return;

  track.innerHTML = "";

  // ----------------------------
  // MONTA OS CARDS
  // ----------------------------
  atletas.forEach((a) => {
    const card = document.createElement("div");
    card.className = "jogador-card";

    const img = document.createElement("img");
    img.src = a.foto;
    img.alt = a.nome;
    img.style.opacity    = "0";
    img.style.transition = "opacity 0.45s ease";
    img.addEventListener("load",  () => { img.style.opacity = "1"; });
    img.addEventListener("error", () => { img.style.opacity = "1"; });

    const info = document.createElement("div");
    info.className = "jogador-info";
    info.innerHTML = `
      <strong>${a.nome}</strong>
      <span class="jogador-cargo">${a.posicao || "Atleta"}</span>
      ${a.idade ? `<span class="jogador-idade">${a.idade} anos</span>` : ""}
    `;

    card.appendChild(img);
    card.appendChild(info);
    track.appendChild(card);
  });

  const cards  = Array.from(track.children);
  const total  = cards.length;
  let index    = 0;
  let autoplayTimer  = null;
  let visivel        = false;
  let pausadoPorUser = false;

  // ----------------------------
  // SCROLL CENTRALIZADO PARA INDEX (wrap infinito)
  // ----------------------------
  function scrollParaIndex(i, smooth = true) {
    index = ((i % total) + total) % total;
    const card = cards[index];
    if (!card) return;
    const alvo = card.offsetLeft - viewport.offsetWidth / 2 + card.offsetWidth / 2;
    viewport.scrollTo({ left: Math.max(0, alvo), top: 0, behavior: smooth ? "smooth" : "auto" });
    cards.forEach((c) => c.classList.remove("ativo"));
    card.classList.add("ativo");
  }

  // ----------------------------
  // SNAP AO MAIS PRÓXIMO (scroll manual)
  // ----------------------------
  function snapAoMaisProximo() {
    const centro = viewport.scrollLeft + viewport.offsetWidth / 2;
    let melhorIdx = 0, melhorDist = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro);
      if (dist < melhorDist) { melhorDist = dist; melhorIdx = i; }
    });
    if (melhorIdx !== index) scrollParaIndex(melhorIdx, true);
  }

  // ----------------------------
  // AUTOPLAY INFINITO
  // ----------------------------
  function iniciarAutoplay() {
    if (autoplayTimer || pausadoPorUser) return;
    autoplayTimer = setInterval(() => {
      scrollParaIndex(index + 1, true);
    }, 3200);
  }

  function pararAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  // ----------------------------
  // AUTOPLAY DISPARA AO ENTRAR NA SEÇÃO
  // ----------------------------
  if ("IntersectionObserver" in window && section) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visivel = entry.isIntersecting;
          if (visivel && !pausadoPorUser) iniciarAutoplay();
          else if (!visivel) pararAutoplay();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(section);
  } else {
    iniciarAutoplay();
  }

  // ----------------------------
  // BOTÕES ‹ ›
  // ----------------------------
  btnNext?.addEventListener("click", (e) => {
    e.preventDefault();
    pausadoPorUser = true;
    pararAutoplay();
    scrollParaIndex(index + 1, true);
    setTimeout(() => { pausadoPorUser = false; if (visivel) iniciarAutoplay(); }, 5000);
  });

  btnPrev?.addEventListener("click", (e) => {
    e.preventDefault();
    pausadoPorUser = true;
    pararAutoplay();
    scrollParaIndex(index - 1, true);
    setTimeout(() => { pausadoPorUser = false; if (visivel) iniciarAutoplay(); }, 5000);
  });

  // ----------------------------
  // CLIQUE NO CARD
  // ----------------------------
  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      pausadoPorUser = true;
      pararAutoplay();
      scrollParaIndex(i, true);
      setTimeout(() => { pausadoPorUser = false; if (visivel) iniciarAutoplay(); }, 5000);
    });
  });

  // ----------------------------
  // SCROLL MANUAL → snap ao soltar
  // ----------------------------
  let scrollEndTimer = null;
  viewport.addEventListener("scroll", () => {
    if (pausadoPorUser) return;
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(snapAoMaisProximo, 150);
  });

  // Hover desktop pausa
  viewport.addEventListener("mouseenter", () => { pararAutoplay(); });
  viewport.addEventListener("mouseleave", () => { if (!pausadoPorUser && visivel) iniciarAutoplay(); });

  // ----------------------------
  // SWIPE TOUCH — horizontal sem conflitar com scroll da página
  // ----------------------------
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeAtivo  = false;

  viewport.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    swipeAtivo  = false;
    pausadoPorUser = true;
    pararAutoplay();
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) {
      swipeAtivo = true;
      // Não previne default aqui — o viewport tem overflow-x: auto, então o scroll nativo funciona
    }
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);

    if (swipeAtivo && Math.abs(deltaX) > 40 && deltaY < 80) {
      scrollParaIndex(deltaX < 0 ? index + 1 : index - 1, true);
    } else {
      snapAoMaisProximo();
    }

    setTimeout(() => {
      pausadoPorUser = false;
      if (visivel) iniciarAutoplay();
    }, 4000);
  }, { passive: true });

  // ----------------------------
  // INIT
  // ----------------------------
  requestAnimationFrame(() => {
    scrollParaIndex(0, false);
    // Autoplay imediato se a seção já estiver visível ao carregar
    const rect = section?.getBoundingClientRect();
    if (rect && rect.top < window.innerHeight * 0.75) {
      visivel = true;
      iniciarAutoplay();
    }
  });
}

// =======================
// LAZY LOAD + FADE-IN GLOBAL (ROBUSTO)
// =======================

function ativarLazyFade(contexto = document) {
  const imagens = contexto.querySelectorAll("img[data-src]");

  if (!("IntersectionObserver" in window)) {
    imagens.forEach((img) => {
      img.src = img.dataset.src;
      img.classList.add("carregado");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;

        if (!img.src) {
          img.src = img.dataset.src;
        }

        if (img.complete) {
          img.classList.add("carregado");
        } else {
          img.onload = () => img.classList.add("carregado");
        }

        obs.unobserve(img);
      });
    },
    { threshold: 0.15 }
  );

  imagens.forEach((img) => observer.observe(img));
}

// =======================
// MODO LOW PERFORMANCE AUTOMÁTICO
// =======================

function ativarLowPerformanceAuto() {
  const memoria = navigator.deviceMemory || 8;
  const nucleos = navigator.hardwareConcurrency || 8;
  const reduzMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const ativar = reduzMovimento || memoria <= 4 || nucleos <= 4;

  if (ativar) {
    document.body.classList.add("low-performance");
    console.warn("Modo LOW PERFORMANCE ativado automaticamente");
  }
}

document.addEventListener("DOMContentLoaded", ativarLowPerformanceAuto);

// =======================
// GALERIA 3D – RESPONSIVA + AUTOPLAY POR SEÇÃO
// =======================

function iniciarGaleria3D(galeria) {
  const container = document.getElementById("galeria3d");
  const stage     = document.querySelector(".galeria-stage");
  if (!container || !galeria?.length) return;

  container.innerHTML = "";
  container.style.position        = "relative";
  container.style.width           = "100%";
  container.style.height          = "100%";
  container.style.perspective     = "1200px";
  container.style.perspectiveOrigin = "50% 50%";

  let indexAtivo = 0;
  let autoplay   = null;
  let visivel    = false;          // controlado pelo IntersectionObserver
  const total    = galeria.length;

  // ----------------------------
  // DIMENSÕES RESPONSIVAS — recalculadas a cada atualizar()
  // ----------------------------
  function getDims() {
    const w = container.offsetWidth;

    // Mobile ≤ 480px: slide central = 80vw, sem 3D lateral visível
    if (w <= 480) {
      return {
        slotW:     Math.round(w * 0.78),
        slotH:     Math.round(w * 0.78 * 1.25),   // ratio ~4:5
        espacoX:   Math.round(w * 0.82),           // laterais quase fora da tela
        rotateY:   18,
        translateZ: 40,
        mostrarAte: 1,                              // mostra só offset ±1
      };
    }
    // Tablet 481–768px
    if (w <= 768) {
      return {
        slotW:     Math.round(w * 0.55),
        slotH:     Math.round(w * 0.55 * 1.3),
        espacoX:   Math.round(w * 0.52),
        rotateY:   22,
        translateZ: 60,
        mostrarAte: 1,
      };
    }
    // Desktop > 768px
    return {
      slotW:     380,
      slotH:     480,
      espacoX:   240,
      rotateY:   28,
      translateZ: 80,
      mostrarAte: 2,
    };
  }

  // ----------------------------
  // CRIA SLIDES
  // ----------------------------
  galeria.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "galeria-slide";
    slide.style.position        = "absolute";
    slide.style.top             = "50%";
    slide.style.left            = "50%";
    slide.style.transformOrigin = "center center";
    slide.style.willChange      = "transform, opacity";
    slide.style.transition      = "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease";
    slide.style.cursor          = "pointer";

    slide.innerHTML = `
      <div class="galeria-card" style="
        width:100%; height:100%;
        display:flex; align-items:center; justify-content:center;
        background:transparent; border:none; overflow:visible;
      ">
        <img alt="${item.alt || ""}" style="
          display:block; max-width:100%; max-height:100%;
          width:auto; height:auto; object-fit:contain;
          border-radius:14px; border:2px solid #2499C7;
          opacity:0; transition:opacity 0.4s ease;
        ">
      </div>
    `;

    const img = slide.querySelector("img");
    img.addEventListener("load", () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      img.style.width  = ratio >= 1 ? "100%" : "auto";
      img.style.height = ratio >= 1 ? "auto"  : "100%";
      img.style.opacity = "1";
    });
    img.src = item.imagem;

    container.appendChild(slide);
  });

  const slides = [...container.children];

  // ----------------------------
  // ATUALIZAR — recalcula dims a cada chamada (responsivo ao resize)
  // ----------------------------
  function atualizar() {
    const { slotW, slotH, espacoX, rotateY, translateZ, mostrarAte } = getDims();

    slides.forEach((slide, i) => {
      let offset = i - indexAtivo;
      if (offset >  total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const abs = Math.abs(offset);

      // Aplica tamanho do slot responsivo
      slide.style.width  = `${slotW}px`;
      slide.style.height = `${slotH}px`;

      if (abs > mostrarAte) {
        slide.style.opacity       = "0";
        slide.style.pointerEvents = "none";
        slide.style.zIndex        = "0";
        return;
      }

      const tX   = offset * espacoX;
      const tZ   = abs === 0 ? translateZ : -55 * abs;
      const rY   = offset * -rotateY;
      const esc  = abs === 0 ? 1.0 : 0.80 - abs * 0.04;
      const opa  = abs === 0 ? 1.0 : 0.50 - abs * 0.08;

      slide.style.opacity       = String(Math.max(0, opa));
      slide.style.zIndex        = String(10 - abs);
      slide.style.pointerEvents = "auto";
      slide.style.transform     = `
        translate(-50%, -50%)
        translateX(${tX}px)
        translateZ(${tZ}px)
        rotateY(${rY}deg)
        scale(${esc})
      `;

      slide.classList.toggle("active", abs === 0);
    });
  }

  // ----------------------------
  // AUTOPLAY
  // ----------------------------
  function iniciarAutoplay() {
    if (autoplay) return;
    autoplay = setInterval(() => {
      indexAtivo = (indexAtivo + 1) % total;
      atualizar();
    }, 3500);
  }

  function pararAutoplay() {
    clearInterval(autoplay);
    autoplay = null;
  }

  // ----------------------------
  // AUTOPLAY DISPARA QUANDO A SEÇÃO FICA VISÍVEL
  // (IntersectionObserver — ativa ao entrar, pausa ao sair)
  // ----------------------------
  if ("IntersectionObserver" in window && stage) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visivel = entry.isIntersecting;
          visivel ? iniciarAutoplay() : pararAutoplay();
        });
      },
      { threshold: 0.3 }   // 30% da seção visível já ativa
    );
    io.observe(stage);
  } else {
    // Fallback para browsers antigos
    iniciarAutoplay();
  }

  // Pausa ao interagir com mouse (desktop)
  container.addEventListener("mouseenter", pararAutoplay);
  container.addEventListener("mouseleave", () => { if (visivel) iniciarAutoplay(); });

  // ----------------------------
  // CLIQUE NO SLIDE
  // ----------------------------
  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      let offset = i - indexAtivo;
      if (offset >  total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      if (offset === 0) return;
      indexAtivo = i;
      pararAutoplay();
      atualizar();
      setTimeout(() => { if (visivel) iniciarAutoplay(); }, 4000);
    });
  });

  // ----------------------------
  // SWIPE TOUCH — previne scroll vertical acidental
  // ----------------------------
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMovendo = false;

  container.addEventListener("touchstart", (e) => {
    touchStartX  = e.touches[0].clientX;
    touchStartY  = e.touches[0].clientY;
    touchMovendo = false;
    pararAutoplay();
  }, { passive: true });

  container.addEventListener("touchmove", (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    // Se o gesto for predominantemente horizontal, bloqueia scroll da página
    if (dx > dy && dx > 8) {
      touchMovendo = true;
      e.preventDefault();        // evita scroll vertical acidental
    }
  }, { passive: false });

  container.addEventListener("touchend", (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);

    // Só navega se foi gesto horizontal (não scroll de página)
    if (Math.abs(deltaX) > 40 && deltaY < 60) {
      indexAtivo += deltaX < 0 ? 1 : -1;
      if (indexAtivo < 0)      indexAtivo = total - 1;
      if (indexAtivo >= total) indexAtivo = 0;
      atualizar();
    }

    setTimeout(() => { if (visivel) iniciarAutoplay(); }, 3000);
  }, { passive: true });

  // ----------------------------
  // RESIZE — recalcula sem resetar index
  // ----------------------------
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(atualizar, 120);
  });

  // ----------------------------
  // INIT — aguarda layout real
  // ----------------------------
  requestAnimationFrame(() => {
    atualizar();
    // Autoplay inicial só se a seção já estiver visível (ex: página carrega rolada até lá)
    const rect = stage?.getBoundingClientRect();
    if (rect && rect.top < window.innerHeight * 0.7) {
      iniciarAutoplay();
    }
  });
}

// =======================
// INICIALIZAÇÃO GERAL
// =======================

document.addEventListener("DOMContentLoaded", () => {
  renderNews();
  setupNavToggle();
  setupSmoothScroll();
  carregarDadosExternos();
});
