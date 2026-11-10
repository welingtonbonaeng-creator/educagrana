// EducaGrana | Pé de Grana: o avatar que cresce com o usuário (EAP 2.3)
// Inspirado no símbolo da marca (folhas crescendo): semente → broto → muda → arvorezinha → árvore → árvore da grana.
// A partir da Arvorezinha ela dá frutos: moedas (crescem com o patrimônio) e notas (uma por meta concluída),
// que podem ser colhidos uma vez por dia e viram Granas.
// Usa o estado e as funções de apoio de app.js.

"use strict";

const ESTAGIOS = [
    { nome: "Semente", nivel: 1, frase: "Todo patrimônio começa pequeno." },
    { nome: "Broto", nivel: 2, frase: "As primeiras folhas do seu conhecimento." },
    { nome: "Muda", nivel: 3, frase: "Três folhas, como no símbolo do EducaGrana." },
    { nome: "Arvorezinha", nivel: 5, frase: "Os primeiros frutos apareceram: moedas!" },
    { nome: "Árvore", nivel: 7, frase: "Copa cheia e galhos carregados." },
    { nome: "Árvore da Grana", nivel: 9, frase: "Conhecimento que dá frutos de verdade." }
];

// Cores de vaso: algumas são prêmio de conquistas
const VASOS = [
    { id: "terracota", nome: "Terracota", cor: "#c8693a" },
    { id: "floresta", nome: "Floresta", cor: "#0a3b23" },
    { id: "ceu", nome: "Céu", cor: "#3b82c4", conquista: "Organizado" },
    { id: "sol", nome: "Sol", cor: "#fcc101", conquista: "Sonhador" },
    { id: "rubi", nome: "Rubi", cor: "#b42318", conquista: "Domador do Leão" },
    { id: "ouro", nome: "Ouro", cor: "#d4a017", conquista: "Mestre da Grana", brilho: true }
];

const PRIMEIRO_ESTAGIO_COM_FRUTOS = 3;
const MOEDAS_BASE = { 3: 2, 4: 3, 5: 4 };
const GRANAS_POR_MOEDA = 15;
const GRANAS_POR_NOTA = 40;

// Onde os frutos ficam pendurados em cada copa (x, y)
const LUGARES_FRUTOS = {
    3: [[48, 52], [72, 52], [60, 40], [44, 42], [76, 42], [60, 55], [52, 32], [68, 32]],
    4: [[44, 46], [76, 46], [60, 54], [52, 30], [68, 30], [36, 36], [84, 36], [60, 40], [46, 20], [74, 20], [60, 14]],
    5: [[44, 46], [76, 46], [60, 54], [52, 30], [68, 30], [36, 36], [84, 36], [60, 40], [46, 20], [74, 20], [60, 14]]
};

let contadorSvg = 0;

function estagioDoNivel(nivel) {
    let indice = 0;
    ESTAGIOS.forEach((estagio, i) => {
        if (nivel >= estagio.nivel) {
            indice = i;
        }
    });
    return indice;
}

function vasoLiberado(vaso) {
    return !vaso.conquista || CONQUISTAS.find((c) => c.nome === vaso.conquista).feita();
}

function vasoAtual() {
    const escolhido = VASOS.find((v) => v.id === estado.vaso);
    return escolhido && vasoLiberado(escolhido) ? escolhido : VASOS[0];
}

/* =========================================================
   FRUTOS E COLHEITA
   ========================================================= */

// Frutos que a árvore teria hoje (sem contar se já foram colhidos)
function frutosDoEstagio(indice) {
    if (indice < PRIMEIRO_ESTAGIO_COM_FRUTOS) {
        return { moedas: 0, notas: 0 };
    }
    const total = estado.granas + valorInvestido();
    const ganho = (total - GRANAS_INICIAIS) / GRANAS_INICIAIS;
    const bonusPatrimonio = Math.max(0, Math.min(3, Math.floor(ganho / 0.05)));
    const metasFeitas = estado.metas.filter((m) => m.guardado >= m.valor).length;
    return {
        moedas: MOEDAS_BASE[indice] + bonusPatrimonio,
        notas: Math.min(3, metasFeitas)
    };
}

function colheuHoje() {
    return estado.colheita === dataDeHoje(0);
}

function frutosParaColher() {
    if (colheuHoje()) {
        return { moedas: 0, notas: 0 };
    }
    return frutosDoEstagio(estagioDoNivel(nivelAtual()));
}

function valorDaColheita(frutos) {
    return frutos.moedas * GRANAS_POR_MOEDA + frutos.notas * GRANAS_POR_NOTA;
}

function colherFrutos() {
    const frutos = frutosParaColher();
    const valor = valorDaColheita(frutos);
    if (valor === 0) {
        return;
    }
    const arvore = $("#perfil-pe .pe");
    if (arvore) {
        arvore.classList.add("colhendo");
    }
    estado.colheita = dataDeHoje(0);
    estado.granas = Math.round((estado.granas + valor) * 100) / 100;
    salvar();
    setTimeout(() => {
        avisar(`🧺 Colheita: ${frutos.moedas} ${frutos.moedas === 1 ? "moeda" : "moedas"}${frutos.notas ? ` e ${frutos.notas} ${frutos.notas === 1 ? "nota" : "notas"}` : ""} = <strong>+${granas(valor)}</strong>`);
        desenharTudo();
        $("#perfil-colheita").focus();
    }, semAnimacao() ? 0 : 800);
}

/* =========================================================
   DESENHO EM SVG
   ========================================================= */

function folha(x, y, angulo, escala, idFolha) {
    return `<path d="M0 0 C 8 -11 24 -12 30 0 C 24 12 8 11 0 0 Z" fill="url(#${idFolha})"
        transform="translate(${x} ${y}) rotate(${angulo}) scale(${escala})"/>`;
}

// Copa em duas camadas: fundo mais escuro e bolhas de luz na frente
function copa(circulos, id) {
    const fundo = circulos.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy + 2}" r="${r}" fill="#25701a"/>`).join("");
    const frente = circulos.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-copa)"/>`).join("");
    const luz = circulos.map(([cx, cy, r]) => `<circle cx="${cx - r * 0.35}" cy="${cy - r * 0.4}" r="${r * 0.38}" fill="#d6ff8a" opacity="0.45"/>`).join("");
    return fundo + frente + luz;
}

function frutoMoeda(x, y, id, ordem) {
    return `
        <g class="fruto" style="--atraso:${(ordem % 4) * 0.35}s">
            <line x1="${x}" y1="${y - 7}" x2="${x}" y2="${y - 4}" stroke="#1d5a12" stroke-width="1.2"/>
            <circle cx="${x}" cy="${y}" r="4.6" fill="url(#${id}-ouro)" stroke="#a87800" stroke-width="1"/>
            <circle cx="${x}" cy="${y}" r="2.4" fill="none" stroke="#a87800" stroke-width="0.9"/>
            <ellipse cx="${x - 1.6}" cy="${y - 1.8}" rx="1.2" ry="0.8" fill="#fff" opacity="0.8"/>
        </g>`;
}

function frutoNota(x, y, ordem) {
    return `
        <g class="fruto" style="--atraso:${(ordem % 4) * 0.35 + 0.2}s">
            <line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y - 4}" stroke="#1d5a12" stroke-width="1.2"/>
            <g transform="translate(${x} ${y}) rotate(${ordem % 2 ? 10 : -10})">
                <rect x="-8" y="-4" width="16" height="9" rx="1.5" fill="#2f9e44" stroke="#1b6e2c" stroke-width="0.9"/>
                <rect x="-6" y="-2.2" width="12" height="5.4" rx="1" fill="none" stroke="#b9f0c2" stroke-width="0.7"/>
                <circle cx="0" cy="0.5" r="1.7" fill="#b9f0c2"/>
            </g>
        </g>`;
}

function desenharFrutos(indice, frutos, id) {
    const lugares = LUGARES_FRUTOS[indice] || [];
    const pecas = [];
    let n = 0;
    for (let i = 0; i < frutos.notas && n < lugares.length; i++, n++) {
        pecas.push(frutoNota(lugares[n][0], lugares[n][1], n));
    }
    for (let i = 0; i < frutos.moedas && n < lugares.length; i++, n++) {
        pecas.push(frutoMoeda(lugares[n][0], lugares[n][1], id, n));
    }
    return `<g class="frutos">${pecas.join("")}</g>`;
}

function brilho(x, y, tamanho) {
    const t = tamanho;
    return `<path class="pe-brilho" d="M${x} ${y - t} L${x + t * 0.3} ${y - t * 0.3} L${x + t} ${y} L${x + t * 0.3} ${y + t * 0.3} L${x} ${y + t} L${x - t * 0.3} ${y + t * 0.3} L${x - t} ${y} L${x - t * 0.3} ${y - t * 0.3} Z" fill="#ffe27a"/>`;
}

// Devolve o SVG do pé de grana num estágio, com a cor do vaso e os frutos
function svgPe(indice, vaso, rotulo, frutos) {
    contadorSvg++;
    const id = "pe" + contadorSvg;
    const carga = frutos || frutosDoEstagio(indice);
    let fundo = "";
    let planta = "";

    if (indice === 0) {
        planta = `
            <ellipse cx="60" cy="77" rx="8" ry="5.5" fill="#8a5a2b"/>
            <ellipse cx="57.5" cy="75.5" rx="2.5" ry="1.5" fill="#c08850"/>
            <path d="M60 72 q2 -5 6 -6" stroke="#5aa51c" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    } else if (indice === 1) {
        planta = `
            <path d="M60 80 Q60 68 60 60" stroke="#2e6b0a" stroke-width="3" fill="none" stroke-linecap="round"/>
            ${folha(60, 62, -150, 0.7, id + "-folha")}${folha(60, 62, -30, 0.7, id + "-folha")}`;
    } else if (indice === 2) {
        planta = `
            <path d="M60 80 Q61 64 60 44" stroke="#2e6b0a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
            ${folha(60, 68, -160, 0.85, id + "-folha")}${folha(60, 58, -25, 0.9, id + "-folha")}${folha(60, 46, -70, 0.95, id + "-folha")}`;
    } else if (indice === 3) {
        planta = `
            <path d="M56.5 80 L58 50 L62 50 L63.5 80 Z" fill="url(#${id}-tronco)"/>
            <path d="M59 62 L50 54 M61 58 L70 52" stroke="#6b3f1d" stroke-width="2.5" stroke-linecap="round"/>
            ${copa([[60, 41, 17], [45, 48, 12], [75, 48, 12], [52, 34, 10], [68, 34, 10]], id)}`;
    } else {
        if (indice === 5) {
            fundo = `<circle cx="60" cy="38" r="52" fill="url(#${id}-aura)"/>`;
        }
        planta = `
            <path d="M54.5 80 L57 42 L63 42 L65.5 80 Z" fill="url(#${id}-tronco)"/>
            <path d="M59 60 L44 48 M61 55 L76 46 M60 48 L52 36 M60 48 L68 36" stroke="#6b3f1d" stroke-width="3" stroke-linecap="round"/>
            ${copa([[60, 30, 23], [39, 42, 16], [81, 42, 16], [60, 47, 17], [46, 22, 14], [74, 22, 14], [60, 14, 11]], id)}
            ${indice === 5 ? `
                <g class="pilha-moedas">
                    <ellipse cx="40" cy="78" rx="6" ry="2.4" fill="#d4a017" stroke="#a87800" stroke-width="0.8"/>
                    <ellipse cx="40" cy="75.8" rx="6" ry="2.4" fill="#fcc101" stroke="#a87800" stroke-width="0.8"/>
                    <ellipse cx="80" cy="78" rx="6" ry="2.4" fill="#fcc101" stroke="#a87800" stroke-width="0.8"/>
                </g>
                ${brilho(94, 18, 5)}${brilho(24, 26, 4)}${brilho(100, 50, 3)}${brilho(18, 52, 3.5)}` : ""}`;
    }

    return `
        <svg class="pe" viewBox="0 0 120 120" role="img" aria-label="${escapar(rotulo || "Pé de Grana: " + ESTAGIOS[indice].nome)}" focusable="false">
            <defs>
                <linearGradient id="${id}-folha" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#b6f04a"/><stop offset="1" stop-color="#2e9a1c"/>
                </linearGradient>
                <radialGradient id="${id}-copa" cx="0.35" cy="0.3" r="0.85">
                    <stop offset="0" stop-color="#a8eb3c"/><stop offset="0.6" stop-color="#5cbf22"/><stop offset="1" stop-color="#2e8a18"/>
                </radialGradient>
                <linearGradient id="${id}-tronco" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#5e3517"/><stop offset="0.5" stop-color="#8a5a2b"/><stop offset="1" stop-color="#5e3517"/>
                </linearGradient>
                <radialGradient id="${id}-ouro" cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" stop-color="#fff2a8"/><stop offset="0.5" stop-color="#fcc101"/><stop offset="1" stop-color="#d49a00"/>
                </radialGradient>
                <radialGradient id="${id}-aura" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stop-color="#fff2a8" stop-opacity="0.9"/><stop offset="1" stop-color="#fcc101" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="${id}-vaso" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="${vaso.cor}"/><stop offset="1" stop-color="${vaso.cor}" stop-opacity="0.78"/>
                </linearGradient>
            </defs>
            ${fundo}
            <g class="pe-planta">${planta}${desenharFrutos(indice, carga, id)}</g>
            <ellipse cx="60" cy="81" rx="29" ry="4" fill="#5b3a21"/>
            <path d="M31 84 L89 84 L83 114 L37 114 Z" fill="url(#${id}-vaso)"/>
            <rect x="27" y="78" width="66" height="9" rx="3" fill="${vaso.cor}"/>
            <rect x="27" y="78" width="66" height="9" rx="3" fill="#000" opacity="0.15"/>
            ${vaso.brilho ? `<path d="M40 90 L44 90 L42 108 L38 108 Z" fill="#fff" opacity="0.45"/>` : ""}
        </svg>`;
}

/* =========================================================
   EVOLUÇÃO
   ========================================================= */

function mostrarEvolucao(indice) {
    const estagio = ESTAGIOS[indice];
    abrirModal("Seu pé de grana evoluiu!", `
        <div class="evolucao">
            <div class="evolucao-antes" aria-hidden="true">${svgPe(indice - 1, vasoAtual())}</div>
            <p class="evolucao-seta" aria-hidden="true">➜</p>
            <div class="evolucao-depois">${svgPe(indice, vasoAtual())}</div>
        </div>
        <p class="comemoracao-titulo evolucao-titulo">${ESTAGIOS[indice - 1].nome} virou ${estagio.nome}!</p>
        <p class="evolucao-frase">${escapar(estagio.frase)}</p>
        ${indice === PRIMEIRO_ESTAGIO_COM_FRUTOS ? `<p class="dica evolucao-frase">A partir de agora, colha os frutos uma vez por dia no Perfil. Eles viram Granas!</p>` : ""}
        <button type="button" class="botao botao-destaque botao-largo" id="fechar-evolucao">Que demais!</button>`);
    $("#fechar-evolucao").addEventListener("click", fecharModal);
}

// A comemoração espera a vez: só aparece quando nenhuma janela está aberta,
// para não cobrir o resultado de uma fase ou outra comemoração.
let evolucaoPendente = null;

function tentarMostrarEvolucao() {
    if (evolucaoPendente === null || document.querySelector("dialog[open]")) {
        return;
    }
    const indice = evolucaoPendente;
    evolucaoPendente = null;
    mostrarEvolucao(indice);
}

// Chamado por ganharXp quando o nível muda
function verificarEvolucao(nivelAntes) {
    const antes = estagioDoNivel(nivelAntes);
    const depois = estagioDoNivel(nivelAtual());
    if (depois > antes) {
        evolucaoPendente = Math.max(evolucaoPendente || 0, depois);
        setTimeout(tentarMostrarEvolucao, 900);
    }
}

/* =========================================================
   PERFIL: árvore atual, colheita, linha do tempo e vasos
   ========================================================= */

function desenharPe() {
    const indice = estagioDoNivel(nivelAtual());
    const vaso = vasoAtual();
    const proximo = ESTAGIOS[indice + 1];
    const frutos = frutosParaColher();
    const valor = valorDaColheita(frutos);
    const descricaoFrutos = frutos.moedas + frutos.notas > 0
        ? `, com ${frutos.moedas} ${frutos.moedas === 1 ? "moeda" : "moedas"}${frutos.notas ? ` e ${frutos.notas} ${frutos.notas === 1 ? "nota" : "notas"}` : ""} para colher`
        : "";

    $("#perfil-pe").innerHTML = svgPe(indice, vaso, `Seu pé de grana: ${ESTAGIOS[indice].nome}${descricaoFrutos}`, frutos);
    $("#perfil-estagio").textContent = ESTAGIOS[indice].nome;
    if (proximo) {
        const xpFalta = (proximo.nivel - 1) * XP_POR_NIVEL - estado.xp;
        $("#perfil-proximo-estagio").textContent = `Faltam ${xpFalta} XP para virar ${proximo.nome} (nível ${proximo.nivel})`;
    } else {
        $("#perfil-proximo-estagio").textContent = "Estágio máximo! Sua árvore já dá frutos de ouro.";
    }

    const area = $("#perfil-colheita");
    if (indice < PRIMEIRO_ESTAGIO_COM_FRUTOS) {
        area.innerHTML = `<p class="colheita-texto">🍃 Árvores dão frutos a partir do nível ${ESTAGIOS[PRIMEIRO_ESTAGIO_COM_FRUTOS].nivel}. Continue aprendendo!</p>`;
    } else if (valor > 0) {
        area.innerHTML = `
            <button type="button" class="botao botao-amarelo botao-largo" id="botao-colher">🧺 Colher frutos (+${granas(valor)})</button>
            <p class="colheita-texto">Moedas crescem com seu patrimônio. Cada meta concluída dá uma nota.</p>`;
    } else {
        area.innerHTML = `<p class="colheita-texto">✅ Colheita de hoje feita! Novos frutos amanhã.</p>`;
    }

    $("#lista-estagios").innerHTML = ESTAGIOS.map((estagio, i) => {
        const alcancado = i <= indice;
        return `
            <li class="estagio ${alcancado ? "estagio-alcancado" : "estagio-futuro"} ${i === indice ? "estagio-atual" : ""}">
                <div class="estagio-desenho">${svgPe(i, alcancado ? vaso : VASOS[0], alcancado ? estagio.nome : `${estagio.nome}, bloqueado até o nível ${estagio.nivel}`, i >= PRIMEIRO_ESTAGIO_COM_FRUTOS ? { moedas: MOEDAS_BASE[i] + (i === 5 ? 3 : 0), notas: i === 5 ? 2 : i === 4 ? 1 : 0 } : undefined)}</div>
                <p class="estagio-nome">${escapar(estagio.nome)}</p>
                <p class="estagio-nivel">nível ${estagio.nivel}</p>
            </li>`;
    }).join("");

    $("#lista-vasos").innerHTML = VASOS.map((v) => {
        const liberado = vasoLiberado(v);
        const escolhido = vaso.id === v.id;
        return `
            <button type="button" class="vaso-opcao" role="radio" data-vaso="${v.id}" aria-checked="${escolhido}" ${liberado ? "" : "disabled"}
                aria-label="${liberado ? "Vaso " + v.nome : `Vaso ${v.nome}, bloqueado: conquiste ${v.conquista}`}">
                <span class="vaso-cor ${v.brilho ? "vaso-ouro" : ""}" style="--cor:${v.cor}" aria-hidden="true">${liberado ? "" : "🔒"}</span>
                <span class="vaso-nome" aria-hidden="true">${escapar(v.nome)}</span>
                ${liberado ? "" : `<span class="vaso-dica" aria-hidden="true">${escapar(v.conquista)}</span>`}
            </button>`;
    }).join("");
}

function avatarPequeno() {
    const indice = estagioDoNivel(nivelAtual());
    return svgPe(indice, vasoAtual(), `Seu pé de grana: ${ESTAGIOS[indice].nome}`, frutosParaColher());
}

function ligarEventosPe() {
    ["#modal", "#jogo"].forEach((seletor) => {
        $(seletor).addEventListener("close", () => setTimeout(tentarMostrarEvolucao, 400));
    });
    $("#perfil-colheita").addEventListener("click", (evento) => {
        if (evento.target.closest("#botao-colher")) {
            colherFrutos();
        }
    });
}
