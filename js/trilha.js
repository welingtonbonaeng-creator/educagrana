// EducaGrana | Trilha do Conhecimento (aba Aprender)
// Mapa com 9 fases; cada fase tem uma dica do Brotinho e um minijogo com perguntas sobre o ativo.
// Usa funções e o estado definidos em app.js (carregado logo depois deste arquivo).

"use strict";

/* =========================================================
   CONTEÚDO DAS FASES
   ========================================================= */

const JOGOS = {
    pescaria: { nome: "Pescaria", icone: "🎣" },
    mito: { nome: "Mito ou Verdade", icone: "🃏" },
    memoria: { nome: "Memória", icone: "🧠" },
    roleta: { nome: "Roleta", icone: "🎡" }
};

const FASES = [
    {
        id: "cdb", titulo: "CDB", icone: "🏦", jogo: "pescaria",
        dica: [
            "CDB é um empréstimo que você faz ao banco. Ele te devolve o dinheiro com juros.",
            "Tem a proteção do FGC até R$ 250 mil por CPF em cada banco.",
            "Paga IR na tabela regressiva: quanto mais tempo aplicado, menor o imposto."
        ],
        dados: {
            rodadas: [
                { pergunta: "Quando você investe em um CDB, para quem empresta dinheiro?", opcoes: ["Para o banco", "Para o governo", "Para uma empresa da bolsa"], certa: 0, explicacao: "CDB é Certificado de Depósito Bancário: o banco usa o seu dinheiro e paga juros por isso." },
                { pergunta: "Até quanto o FGC protege por CPF em cada banco?", opcoes: ["R$ 50 mil", "R$ 250 mil", "Sem limite"], certa: 1, explicacao: "O FGC garante até R$ 250 mil por CPF em cada instituição se o banco quebrar." },
                { pergunta: "O IR do CDB fica menor quando você...", opcoes: ["Resgata rápido", "Deixa mais tempo aplicado", "Investe mais dinheiro"], certa: 1, explicacao: "Na tabela regressiva o imposto cai de 22,5% (até 180 dias) para 15% (acima de 720 dias)." }
            ]
        }
    },
    {
        id: "tesouro", titulo: "Tesouro Direto", icone: "🏛️", jogo: "mito",
        dica: [
            "No Tesouro Direto você empresta dinheiro para o governo federal.",
            "É considerado o investimento mais seguro do Brasil.",
            "O Tesouro Selic é o queridinho da reserva de emergência."
        ],
        dados: {
            cartas: [
                { frase: "Investir no Tesouro Direto é emprestar dinheiro para o governo.", verdade: true, explicacao: "Verdade! Os títulos públicos financiam o governo federal, que devolve com juros." },
                { frase: "O Tesouro Direto é o investimento mais arriscado do país.", verdade: false, explicacao: "Mito! Ele é considerado o investimento mais seguro do Brasil." },
                { frase: "O Tesouro Selic é bastante usado para a reserva de emergência.", verdade: true, explicacao: "Verdade! Ele acompanha a taxa Selic e oscila pouco, ótimo para ter o dinheiro à mão." },
                { frase: "Só quem é rico consegue investir no Tesouro Direto.", verdade: false, explicacao: "Mito! Dá para começar com pouco dinheiro, comprando frações de um título." }
            ]
        }
    },
    {
        id: "lci", titulo: "LCI, LCA, CRI e CRA", icone: "🌾", jogo: "memoria",
        dica: [
            "LCI e LCA financiam imóveis e o agronegócio. São emitidas por bancos e têm FGC.",
            "CRI e CRA também, mas são emitidos por securitizadoras e NÃO têm FGC.",
            "Para pessoa física, os quatro costumam ser isentos de Imposto de Renda."
        ],
        dados: {
            pares: [
                ["LCI", "Financia imóveis"],
                ["LCA", "Financia o agro"],
                ["CRI e CRA", "Sem garantia do FGC"],
                ["Isenção", "Sem IR para pessoa física"]
            ]
        }
    },
    {
        id: "fundos", titulo: "Fundos de investimento", icone: "🧺", jogo: "roleta",
        dica: [
            "Num fundo, muita gente junta dinheiro e um gestor profissional decide onde investir.",
            "Você paga uma taxa de administração por esse serviço.",
            "Muitos fundos têm o come-cotas: IR cobrado antes, em maio e novembro."
        ],
        dados: {
            perguntas: [
                { pergunta: "Quem decide onde o dinheiro de um fundo é investido?", opcoes: ["O gestor do fundo", "Cada cotista sozinho", "O Banco Central"], certa: 0, explicacao: "O gestor é o profissional contratado para tomar as decisões de investimento do fundo." },
                { pergunta: "Como se chama quem investe em um fundo?", opcoes: ["Acionista", "Cotista", "Correntista"], certa: 1, explicacao: "Quem investe compra cotas do fundo, por isso é chamado de cotista." },
                { pergunta: "Em quais meses acontece o come-cotas?", opcoes: ["Janeiro e julho", "Maio e novembro", "Todo mês"], certa: 1, explicacao: "O come-cotas antecipa o IR duas vezes por ano: no último dia útil de maio e de novembro." }
            ]
        }
    },
    {
        id: "etf", titulo: "Fundos de índice (ETF)", icone: "📊", jogo: "pescaria",
        dica: [
            "Um ETF copia um índice da bolsa, como o Ibovespa.",
            "Com uma única compra você investe em dezenas de empresas.",
            "É negociado na bolsa como uma ação e o valor sobe e desce com o mercado."
        ],
        dados: {
            rodadas: [
                { pergunta: "O que um ETF faz?", opcoes: ["Copia um índice da bolsa", "Garante lucro todo mês", "Empresta para o banco"], certa: 0, explicacao: "O ETF replica uma carteira teórica, como o Ibovespa, e segue o desempenho dela." },
                { pergunta: "Qual é a grande vantagem do ETF para quem está começando?", opcoes: ["Rendimento fixo", "Diversificar com uma compra só", "Não oscilar"], certa: 1, explicacao: "Uma cota de ETF já te coloca em várias empresas ao mesmo tempo." },
                { pergunta: "Onde se compra um ETF?", opcoes: ["Na bolsa de valores", "Na lotérica", "Direto no governo"], certa: 0, explicacao: "ETFs são negociados na bolsa, pela sua corretora, como se fossem ações." }
            ]
        }
    },
    {
        id: "fii", titulo: "Fundos imobiliários", icone: "🏢", jogo: "memoria",
        dica: [
            "Um FII junta dinheiro de muita gente para investir em imóveis ou em títulos do setor.",
            "Os aluguéis viram rendimentos que costumam cair todo mês.",
            "Para pessoa física esses rendimentos em geral são isentos de IR."
        ],
        dados: {
            pares: [
                ["Cota", "Pedaço do fundo"],
                ["Rendimento", "Parte dos aluguéis"],
                ["FII de tijolo", "Imóveis de verdade"],
                ["FII de papel", "Títulos do setor imobiliário"]
            ]
        }
    },
    {
        id: "acoes", titulo: "Ações brasileiras", icone: "📈", jogo: "roleta",
        dica: [
            "Comprar uma ação é virar sócio de uma empresa listada na B3.",
            "Você ganha se a empresa valorizar e pode receber parte do lucro (dividendos).",
            "O preço muda todo dia. Ações combinam com objetivos de longo prazo."
        ],
        dados: {
            perguntas: [
                { pergunta: "Quem compra uma ação vira...", opcoes: ["Cliente da empresa", "Sócio da empresa", "Credor do banco"], certa: 1, explicacao: "A ação é um pedaço da empresa: você passa a ser um dos donos." },
                { pergunta: "Como se chama a parte do lucro dividida com os acionistas?", opcoes: ["Dividendos", "Juros do CDB", "Cashback"], certa: 0, explicacao: "Dividendos são a fatia do lucro que a empresa distribui para os sócios." },
                { pergunta: "Qual é a bolsa de valores do Brasil?", opcoes: ["B3", "Nasdaq", "FGC"], certa: 0, explicacao: "A B3 é a bolsa brasileira, onde as ações são negociadas." }
            ]
        }
    },
    {
        id: "globais", titulo: "Ações globais", icone: "🌎", jogo: "pescaria",
        dica: [
            "Dá para investir em empresas de fora pelos BDRs, negociados aqui na B3.",
            "Outra opção é abrir conta numa corretora internacional.",
            "O valor muda com a ação e também com o dólar."
        ],
        dados: {
            rodadas: [
                { pergunta: "Como investir em empresas de fora pela bolsa brasileira?", opcoes: ["Com BDRs", "Com LCI", "Com Tesouro Selic"], certa: 0, explicacao: "BDRs são recibos negociados na B3 que representam ações de empresas estrangeiras." },
                { pergunta: "Além da ação, o que mais mexe com o valor de um investimento no exterior?", opcoes: ["O dólar", "O preço da gasolina", "A taxa do cartão"], certa: 0, explicacao: "Como o ativo é cotado em moeda estrangeira, a variação do câmbio entra na conta." },
                { pergunta: "Por que investir lá fora?", opcoes: ["Para não depender só do Brasil", "Porque é garantido", "Porque não tem risco"], certa: 0, explicacao: "Investir em outros países espalha o risco e reduz a dependência da economia brasileira." }
            ]
        }
    },
    {
        id: "cripto", titulo: "Criptomoedas", icone: "🪙", jogo: "mito", final: true,
        dica: [
            "Criptomoedas como o Bitcoin são moedas digitais que não dependem de um banco central.",
            "O preço pode subir ou cair muito em poucos dias e não existe FGC.",
            "Desconfie de qualquer promessa de ganho fácil e rápido."
        ],
        dados: {
            cartas: [
                { frase: "Criptomoedas têm a proteção do FGC.", verdade: false, explicacao: "Mito! Nenhuma criptomoeda tem a garantia do FGC." },
                { frase: "O preço de uma cripto pode cair pela metade em pouco tempo.", verdade: true, explicacao: "Verdade! A volatilidade é extrema, para cima e para baixo." },
                { frase: "Promessa de lucro garantido com cripto é um bom sinal.", verdade: false, explicacao: "Mito! Lucro garantido é marca registrada de golpe e pirâmide financeira." },
                { frase: "O Bitcoin não é controlado por nenhum banco central.", verdade: true, explicacao: "Verdade! Ele funciona numa rede descentralizada, sem um banco central por trás." }
            ]
        }
    }
];

const FALAS = {
    acerto: ["Mandou bem! 🌱", "Isso aí, tá crescendo!", "Acertou em cheio!", "Conhecimento rende juros! 📈"],
    erro: ["Quase! Bora aprender com essa.", "Errar faz parte do jogo.", "Sem problema, a próxima é sua!"],
    roleta: "Aqui a roleta só escolhe a pergunta. Quem decide se você ganha é o seu conhecimento, não a sorte."
};

const MOEDAS_POR_ACERTO = 10;
const GRANAS_POR_ESTRELA = 100;

/* =========================================================
   PROGRESSO: ESTRELAS, SEQUÊNCIA DE DIAS E BAÚS
   ========================================================= */

function estrelasDaFase(id) {
    return estado.fases[id] || 0;
}

function fasesConcluidas() {
    return FASES.filter((fase) => estrelasDaFase(fase.id) > 0).length;
}

function totalDeEstrelas() {
    return FASES.reduce((soma, fase) => soma + estrelasDaFase(fase.id), 0);
}

function faseLiberada(indice) {
    return indice === 0 || estrelasDaFase(FASES[indice - 1].id) > 0;
}

function indiceFaseAtual() {
    const indice = FASES.findIndex((fase) => estrelasDaFase(fase.id) === 0);
    return indice === -1 ? FASES.length - 1 : indice;
}

// Data no fuso do aparelho (toISOString usaria UTC e viraria o dia às 21h no Brasil)
function dataLocal(data) {
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${data.getFullYear()}-${mes}-${dia}`;
}

function dataDeHoje(deslocamentoDias) {
    const data = new Date();
    data.setDate(data.getDate() + (deslocamentoDias || 0));
    return dataLocal(data);
}

function sequenciaAtual() {
    const { dias, ultimo } = estado.sequencia;
    return ultimo === dataDeHoje(0) || ultimo === dataDeHoje(-1) ? dias : 0;
}

function registrarDiaJogado() {
    const hoje = dataDeHoje(0);
    if (estado.sequencia.ultimo === hoje) {
        return;
    }
    estado.sequencia.dias = estado.sequencia.ultimo === dataDeHoje(-1) ? estado.sequencia.dias + 1 : 1;
    estado.sequencia.ultimo = hoje;
    estado.sequencia.recorde = Math.max(estado.sequencia.recorde || 0, estado.sequencia.dias);
}

function bauDisponivel(numero) {
    return fasesConcluidas() >= (numero + 1) * 3 && !estado.baus.includes(numero);
}

function estrelasTexto(quantidade) {
    return "★".repeat(quantidade) + "☆".repeat(3 - quantidade);
}

function sortear(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function semAnimacao() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("sem-animacao");
}

/* =========================================================
   MAPA DA TRILHA
   ========================================================= */

// Posição horizontal de cada fase no zigue-zague (em % da largura)
const POSICOES = [50, 72, 80, 62, 38, 20, 28, 50, 70];

// A trilha vai do mais seguro ao mais arriscado, em 3 mundos de 3 fases
const MUNDOS = [
    { nome: "Renda fixa", icone: "🛡️" },
    { nome: "Fundos", icone: "🧺" },
    { nome: "Renda variável", icone: "🎢" }
];

function desenharAprender() {
    const concluidas = fasesConcluidas();
    $("#trilha-sequencia").textContent = sequenciaAtual();
    $("#trilha-estrelas").textContent = `${totalDeEstrelas()}/${FASES.length * 3}`;
    $("#trilha-fases").textContent = `${concluidas}/${FASES.length}`;

    const atual = indiceFaseAtual();
    let fala;
    if (concluidas === FASES.length) {
        fala = "Você zerou a trilha! Volte nas fases para buscar 3 estrelas em todas. ⭐";
    } else if (concluidas === 0) {
        fala = "Oi, eu sou o Brotinho! Toque na primeira fase e bora pescar umas moedas. 🎣";
    } else {
        fala = `Próxima parada: ${FASES[atual].titulo}. Cada fase vale Granas para investir!`;
    }
    if (estado.baus.length < 3 && [0, 1, 2].some(bauDisponivel)) {
        fala = "Tem um baú surpresa esperando por você no mapa! 🎁";
    }
    $("#trilha-fala").textContent = fala;

    const itens = [];
    FASES.forEach((fase, indice) => {
        const estrelas = estrelasDaFase(fase.id);
        const liberada = faseLiberada(indice);
        let situacao = "bloqueada";
        if (estrelas > 0) {
            situacao = "concluida";
        } else if (liberada) {
            situacao = "atual";
        }
        if (indice % 3 === 0) {
            const mundo = MUNDOS[indice / 3];
            itens.push(`
                <li class="mundo-rotulo">
                    <p><span aria-hidden="true">${mundo.icone}</span> Mundo ${indice / 3 + 1} · ${mundo.nome}</p>
                </li>`);
        }
        const jogo = JOGOS[fase.jogo];
        const rotulo = liberada
            ? `Fase ${indice + 1}: ${fase.titulo}, jogo ${jogo.nome}, ${estrelas} de 3 estrelas`
            : `Fase ${indice + 1}: ${fase.titulo}, bloqueada`;

        itens.push(`
            <li class="parada" style="--x:${POSICOES[indice]}%">
                <button type="button" class="no-fase no-${situacao} ${fase.final ? "no-final" : ""}" data-fase="${indice}"
                    ${liberada ? "" : "disabled"} aria-label="${escapar(rotulo)}">
                    <span class="no-icone" aria-hidden="true">${liberada ? fase.icone : "🔒"}</span>
                    <span class="no-numero" aria-hidden="true">${indice + 1}</span>
                </button>
                <p class="no-titulo" aria-hidden="true">${escapar(fase.titulo)}</p>
                <p class="no-estrelas" aria-hidden="true">${liberada ? `${jogo.icone} ${estrelasTexto(estrelas)}` : "&nbsp;"}</p>
            </li>`);

        // Um baú depois de cada 3 fases
        if ((indice + 1) % 3 === 0) {
            const numero = (indice + 1) / 3 - 1;
            const aberto = estado.baus.includes(numero);
            const disponivel = bauDisponivel(numero);
            const textoBau = aberto ? "Baú aberto" : disponivel ? "Baú surpresa disponível, toque para abrir" : `Baú bloqueado: conclua ${(numero + 1) * 3} fases`;
            itens.push(`
                <li class="parada parada-bau" style="--x:${POSICOES[indice] > 50 ? 30 : 70}%">
                    <button type="button" class="no-bau ${disponivel ? "bau-disponivel" : ""} ${aberto ? "bau-aberto" : ""}"
                        data-bau="${numero}" ${disponivel ? "" : "disabled"} aria-label="${textoBau}">
                        <span aria-hidden="true">${aberto ? "📭" : "🎁"}</span>
                    </button>
                </li>`);
        }
    });
    itens.push(`
        <li class="parada parada-chegada" style="--x:50%">
            <p class="chegada ${concluidas === FASES.length ? "chegada-feita" : ""}">🏆 Mestre da Grana</p>
        </li>`);

    $("#trilha-mapa").innerHTML = itens.join("");
    desenharDesafio();
    requestAnimationFrame(desenharCaminho);
}

/* =========================================================
   DESAFIO DO DIA: uma pergunta por dia das fases já concluídas
   ========================================================= */

function perguntasDoDesafio() {
    const lista = [];
    FASES.filter((fase) => estrelasDaFase(fase.id) > 0).forEach((fase) => {
        const d = fase.dados;
        (d.rodadas || d.perguntas || []).forEach((q) => lista.push({ ...q, fase: fase.titulo }));
        (d.cartas || []).forEach((c) => lista.push({
            pergunta: `Mito ou verdade: “${c.frase}”`,
            opcoes: ["Mito", "Verdade"],
            certa: c.verdade ? 1 : 0,
            explicacao: c.explicacao,
            fase: fase.titulo
        }));
    });
    return lista;
}

function desafioDeHoje() {
    const lista = perguntasDoDesafio();
    if (lista.length === 0) {
        return null;
    }
    const hoje = dataDeHoje(0);
    const semente = hoje.split("-").reduce((s, n) => s * 31 + Number(n), 7);
    return lista[semente % lista.length];
}

function desenharDesafio() {
    const area = $("#trilha-desafio");
    const pergunta = desafioDeHoje();
    if (!pergunta) {
        area.innerHTML = `
            <h2 class="desafio-titulo">⚡ Desafio do dia</h2>
            <p class="dica">🔒 Conclua a fase 1 para liberar uma pergunta nova todo dia, valendo Granas.</p>`;
        return;
    }
    const feito = estado.desafio && estado.desafio.data === dataDeHoje(0);
    if (feito) {
        area.innerHTML = `
            <h2 class="desafio-titulo">⚡ Desafio do dia</h2>
            <p class="desafio-pergunta">${escapar(pergunta.pergunta)}</p>
            <p tabindex="-1" class="desafio-resultado ${estado.desafio.acertou ? "positivo" : "negativo"}">
                ${estado.desafio.acertou ? "✅ Você acertou! +50 Granas e +20 XP." : `❌ Resposta certa: ${escapar(pergunta.opcoes[pergunta.certa])}.`}
            </p>
            <p class="dica">${escapar(pergunta.explicacao)} Volte amanhã para um novo desafio!</p>`;
        return;
    }
    area.innerHTML = `
        <h2 class="desafio-titulo">⚡ Desafio do dia <span class="desafio-premio">+50 Granas</span></h2>
        <p class="desafio-pergunta" id="desafio-pergunta">${escapar(pergunta.pergunta)}</p>
        <div class="opcoes-jogo" role="group" aria-labelledby="desafio-pergunta">
            ${pergunta.opcoes.map((opcao, i) => `<button type="button" class="opcao-jogo" data-desafio="${i}">${escapar(opcao)}</button>`).join("")}
        </div>
        <p class="dica">Uma chance por dia. Sobre: ${escapar(pergunta.fase)}.</p>`;
}

function responderDesafio(indice) {
    const pergunta = desafioDeHoje();
    const acertou = indice === pergunta.certa;
    estado.desafio = { data: dataDeHoje(0), acertou };
    registrarDiaJogado();
    if (acertou) {
        estado.granas = Math.round((estado.granas + 50) * 100) / 100;
        ganharXp(20, "Desafio do dia");
    } else {
        avisar("Não foi dessa vez. Leia a explicação e volte amanhã!");
    }
    desenharTudo();
    $("#trilha-desafio .desafio-resultado").focus();
}

// Liga as fases com um caminho tracejado em SVG
function desenharCaminho() {
    const mapa = $("#trilha-mapa");
    const svg = $("#trilha-caminho");
    if (!mapa || mapa.offsetParent === null) {
        return;
    }
    const caixa = svg.getBoundingClientRect();
    const pontos = [...mapa.querySelectorAll(".no-fase, .no-bau, .chegada")].map((no) => {
        const r = no.getBoundingClientRect();
        return { x: r.left + r.width / 2 - caixa.left, y: r.top + r.height / 2 - caixa.top };
    });
    if (pontos.length < 2) {
        return;
    }
    let d = `M ${pontos[0].x} ${pontos[0].y}`;
    for (let i = 1; i < pontos.length; i++) {
        const a = pontos[i - 1];
        const b = pontos[i];
        const meioY = (a.y + b.y) / 2;
        d += ` C ${a.x} ${meioY}, ${b.x} ${meioY}, ${b.x} ${b.y}`;
    }
    // Trecho já percorrido em destaque
    const ultimoFeito = Math.min(pontos.length - 1, [...mapa.querySelectorAll(".no-fase, .no-bau, .chegada")]
        .reduce((ultimo, no, i) => (no.classList.contains("no-concluida") || no.classList.contains("bau-aberto") ? i : ultimo), 0));
    let feito = `M ${pontos[0].x} ${pontos[0].y}`;
    for (let i = 1; i <= ultimoFeito; i++) {
        const a = pontos[i - 1];
        const b = pontos[i];
        const meioY = (a.y + b.y) / 2;
        feito += ` C ${a.x} ${meioY}, ${b.x} ${meioY}, ${b.x} ${b.y}`;
    }
    svg.setAttribute("viewBox", `0 0 ${caixa.width} ${caixa.height}`);
    svg.innerHTML = `<path class="caminho-base" d="${d}"/>${ultimoFeito > 0 ? `<path class="caminho-feito" d="${feito}"/>` : ""}`;
}

/* =========================================================
   JANELA DO JOGO
   ========================================================= */

let partida = null;

function abrirJanelaJogo() {
    const janela = $("#jogo");
    if (!janela.open) {
        janela.showModal();
    }
}

function fecharJanelaJogo() {
    partida = null;
    $("#jogo").close();
    desenharTudo();
}

function atualizarCabecalhoJogo() {
    if (!partida) {
        return;
    }
    $("#jogo-titulo").textContent = `Fase ${partida.indice + 1} · ${partida.fase.titulo}`;
    $("#jogo-moedas").textContent = partida.moedas;
}

function anunciar(texto) {
    $("#jogo-anuncio").textContent = texto;
}

function telaJogo(html) {
    $("#jogo-corpo").innerHTML = html;
    atualizarCabecalhoJogo();
    const foco = $("#jogo-corpo [data-foco]") || $("#jogo-corpo button:not([disabled])");
    if (foco) {
        foco.focus();
    }
}

function balaoBrotinho(texto, extraClasse) {
    return `
        <div class="brotinho ${extraClasse || ""}">
            <span class="brotinho-rosto" aria-hidden="true">🌱</span>
            <p class="brotinho-fala">${texto}</p>
        </div>`;
}

function abrirFase(indice) {
    if (!faseLiberada(indice)) {
        return;
    }
    const fase = FASES[indice];
    partida = { indice, fase, erros: 0, moedas: 0, passo: 0 };
    const jogo = JOGOS[fase.jogo];
    abrirJanelaJogo();
    telaJogo(`
        <div class="jogo-intro">
            <p class="jogo-tipo">${jogo.icone} ${jogo.nome}${fase.final ? " · Fase final" : ""}</p>
            ${balaoBrotinho("Dica rápida antes de jogar:")}
            <ul class="dica-lista">
                ${fase.dica.map((linha) => `<li>${escapar(linha)}</li>`).join("")}
            </ul>
            <p class="dica">${regraDoJogo(fase.jogo)}</p>
            <button type="button" class="botao botao-destaque botao-largo" data-acao="comecar" data-foco>Jogar</button>
        </div>`);
}

function regraDoJogo(tipo) {
    return {
        pescaria: "Leia a pergunta e toque no peixe que leva a resposta certa. Cada acerto vale moedas.",
        mito: "Leia a frase e diga se é mito ou verdade.",
        memoria: "Vire as cartas e encontre os pares: cada termo com o seu significado.",
        roleta: "Gire a roleta para sortear o multiplicador e responda a pergunta."
    }[tipo];
}

function comecarJogo() {
    partida.passo = 0;
    const jogar = { pescaria: rodadaPescaria, mito: cartaMito, memoria: iniciarMemoria, roleta: telaRoleta };
    jogar[partida.fase.jogo]();
}

function ganharMoedas(quantidade) {
    partida.moedas += quantidade;
    const contador = $("#jogo-moedas");
    contador.textContent = partida.moedas;
    contador.parentElement.classList.remove("moedas-pulo");
    void contador.parentElement.offsetWidth;
    contador.parentElement.classList.add("moedas-pulo");
}

function rodapeResposta(acertou, explicacao, ultima) {
    return `
        <div class="resposta-feedback ${acertou ? "feedback-certo" : "feedback-errado"}">
            ${balaoBrotinho(`<strong>${acertou ? sortear(FALAS.acerto) : sortear(FALAS.erro)}</strong> ${escapar(explicacao)}`)}
            <button type="button" class="botao botao-destaque botao-largo" data-acao="${ultima ? "resultado" : "proxima"}" data-foco>
                ${ultima ? "Ver resultado" : "Próxima"}
            </button>
        </div>`;
}

function progressoPartida(atual, total) {
    return `<p class="jogo-passo">${atual} de ${total}</p>`;
}

/* ---------- Pescaria ---------- */

const PEIXES = ["🐟", "🐠", "🐡"];

function rodadaPescaria() {
    const rodadas = partida.fase.dados.rodadas;
    const rodada = rodadas[partida.passo];
    const ordem = embaralhar(rodada.opcoes.map((texto, i) => ({ texto, i })));
    telaJogo(`
        ${progressoPartida(partida.passo + 1, rodadas.length)}
        <p class="jogo-pergunta" id="pergunta-atual" tabindex="-1" data-foco>${escapar(rodada.pergunta)}</p>
        <div class="lago" role="group" aria-labelledby="pergunta-atual">
            ${ordem.map((opcao, n) => `
                <button type="button" class="peixe" data-acao="pescar" data-opcao="${opcao.i}"
                    style="--linha:${12 + n * 30}%; --duracao:${9 + n * 2}s; --atraso:-${n * 3}s">
                    <span class="peixe-corpo" aria-hidden="true">${PEIXES[n]}</span>
                    <span class="peixe-texto">${escapar(opcao.texto)}</span>
                </button>`).join("")}
            <span class="bolhas" aria-hidden="true"></span>
        </div>
        <div id="area-resposta" aria-live="polite"></div>`);
}

function pescar(botao) {
    const rodadas = partida.fase.dados.rodadas;
    const rodada = rodadas[partida.passo];
    const escolhida = Number(botao.dataset.opcao);
    const acertou = escolhida === rodada.certa;
    $$("#jogo-corpo .peixe").forEach((peixe) => {
        peixe.disabled = true;
        if (Number(peixe.dataset.opcao) === rodada.certa) {
            peixe.classList.add("peixe-certo");
        }
    });
    if (acertou) {
        botao.classList.add("peixe-fisgado");
        ganharMoedas(MOEDAS_POR_ACERTO);
    } else {
        botao.classList.add("peixe-errado");
        partida.erros++;
    }
    const ultima = partida.passo === rodadas.length - 1;
    $("#area-resposta").innerHTML = rodapeResposta(acertou, rodada.explicacao, ultima);
    $("#area-resposta [data-foco]").focus();
}

/* ---------- Mito ou Verdade ---------- */

function cartaMito() {
    const cartas = partida.fase.dados.cartas;
    const carta = cartas[partida.passo];
    telaJogo(`
        ${progressoPartida(partida.passo + 1, cartas.length)}
        <div class="carta-mito" id="carta-mito">
            <p class="carta-aspas" aria-hidden="true">“</p>
            <p class="carta-frase" tabindex="-1" data-foco>${escapar(carta.frase)}</p>
        </div>
        <div class="botoes-mito">
            <button type="button" class="botao botao-mito" data-acao="mito" data-resposta="false">🙅 Mito</button>
            <button type="button" class="botao botao-verdade" data-acao="mito" data-resposta="true">✅ Verdade</button>
        </div>
        <div id="area-resposta" aria-live="polite"></div>`);
}

function responderMito(botao) {
    const cartas = partida.fase.dados.cartas;
    const carta = cartas[partida.passo];
    const acertou = (botao.dataset.resposta === "true") === carta.verdade;
    $$("#jogo-corpo .botoes-mito button").forEach((b) => {
        b.disabled = true;
    });
    $("#carta-mito").classList.add(acertou ? "carta-certa" : "carta-errada");
    if (acertou) {
        ganharMoedas(MOEDAS_POR_ACERTO);
    } else {
        partida.erros++;
    }
    const ultima = partida.passo === cartas.length - 1;
    $("#area-resposta").innerHTML = rodapeResposta(acertou, carta.explicacao, ultima);
    $("#area-resposta [data-foco]").focus();
}

/* ---------- Memória ---------- */

function iniciarMemoria() {
    const pares = partida.fase.dados.pares;
    const cartas = [];
    pares.forEach((par, i) => {
        cartas.push({ par: i, lado: "termo", texto: par[0] });
        cartas.push({ par: i, lado: "significado", texto: par[1] });
    });
    partida.memoria = { cartas: embaralhar(cartas), abertas: [], encontrados: [], travado: false };
    desenharMemoria("Encontre os 4 pares.");
}

function desenharMemoria(mensagem) {
    const m = partida.memoria;
    telaJogo(`
        <p class="jogo-passo">${m.encontrados.length} de ${partida.fase.dados.pares.length} pares</p>
        <p class="jogo-pergunta" tabindex="-1" data-foco>Ligue cada termo ao seu significado</p>
        <div class="memoria">
            ${m.cartas.map((carta, i) => {
                const achada = m.encontrados.includes(carta.par);
                const aberta = achada || m.abertas.includes(i);
                return `
                    <button type="button" class="carta ${aberta ? "carta-aberta" : ""} ${achada ? "carta-achada" : ""} carta-${carta.lado}"
                        data-acao="virar" data-carta="${i}" ${achada ? "disabled" : ""}
                        aria-label="${aberta ? escapar(carta.texto) + (achada ? ", par encontrado" : "") : "Carta " + (i + 1) + ", virada para baixo"}">
                        <span aria-hidden="true">${aberta ? escapar(carta.texto) : "?"}</span>
                    </button>`;
            }).join("")}
        </div>
        <p class="memoria-mensagem" aria-live="polite">${mensagem}</p>`);
}

function virarCarta(botao) {
    const m = partida.memoria;
    const i = Number(botao.dataset.carta);
    if (m.travado || m.abertas.includes(i)) {
        return;
    }
    m.abertas.push(i);
    if (m.abertas.length < 2) {
        desenharMemoria("Agora escolha o par dela.");
        $(`#jogo-corpo [data-carta="${i}"]`).focus();
        return;
    }
    const [a, b] = m.abertas.map((n) => m.cartas[n]);
    if (a.par === b.par && a.lado !== b.lado) {
        m.encontrados.push(a.par);
        m.abertas = [];
        ganharMoedas(MOEDAS_POR_ACERTO);
        if (m.encontrados.length === partida.fase.dados.pares.length) {
            const pares = partida.fase.dados.pares;
            telaJogo(`
                <p class="jogo-pergunta" tabindex="-1" data-foco>Todos os pares encontrados! 🎉</p>
                <ul class="pares-resumo">
                    ${pares.map((par) => `<li><strong>${escapar(par[0])}</strong> <span aria-hidden="true">→</span><span class="rotulo-invisivel">:</span> ${escapar(par[1])}</li>`).join("")}
                </ul>
                <button type="button" class="botao botao-destaque botao-largo" data-acao="resultado">Ver resultado</button>`);
            return;
        }
        desenharMemoria(`${sortear(FALAS.acerto)} Par encontrado: ${escapar(a.texto)} e ${escapar(b.texto)}.`);
        return;
    }
    partida.erros++;
    m.travado = true;
    desenharMemoria("Não formam par. Elas vão virar de novo.");
    $(`#jogo-corpo [data-carta="${i}"]`).focus();
    setTimeout(() => {
        m.abertas = [];
        m.travado = false;
        if (partida && partida.memoria === m) {
            desenharMemoria("Tente outra combinação.");
            $(`#jogo-corpo [data-carta="${i}"]`).focus();
        }
    }, semAnimacao() ? 1500 : 1100);
}

/* ---------- Roleta ---------- */

const FATIAS = [
    { rotulo: "1x", multiplicador: 1, cor: "#8de113" },
    { rotulo: "2x", multiplicador: 2, cor: "#fcc101" },
    { rotulo: "1x", multiplicador: 1, cor: "#ffffff" },
    { rotulo: "3x", multiplicador: 3, cor: "#0a3b23" },
    { rotulo: "1x", multiplicador: 1, cor: "#8de113" },
    { rotulo: "2x", multiplicador: 2, cor: "#fcc101" }
];

function telaRoleta() {
    const perguntas = partida.fase.dados.perguntas;
    if (partida.giro === undefined) {
        partida.giro = 0;
    }
    const fatia = 360 / FATIAS.length;
    const gradiente = FATIAS.map((f, i) => `${f.cor} ${i * fatia}deg ${(i + 1) * fatia}deg`).join(", ");
    telaJogo(`
        ${progressoPartida(partida.passo + 1, perguntas.length)}
        ${partida.passo === 0 ? balaoBrotinho(escapar(FALAS.roleta), "brotinho-pequeno") : ""}
        <div class="roleta-area">
            <span class="roleta-seta" aria-hidden="true">▼</span>
            <div class="roleta" id="roleta" style="background: conic-gradient(${gradiente}); transform: rotate(${partida.giro}deg)" aria-hidden="true">
                ${FATIAS.map((f, i) => `<span class="roleta-rotulo ${f.cor === "#0a3b23" ? "rotulo-claro" : ""}" style="--angulo:${i * fatia + fatia / 2}deg">${f.rotulo}</span>`).join("")}
                <span class="roleta-centro"></span>
            </div>
        </div>
        <button type="button" class="botao botao-amarelo botao-largo" data-acao="girar" data-foco>🎡 Girar a roleta</button>
        <div id="area-pergunta" aria-live="polite"></div>`);
}

function girarRoleta(botao) {
    botao.disabled = true;
    const escolhida = Math.floor(Math.random() * FATIAS.length);
    const fatia = 360 / FATIAS.length;
    // A seta fica no topo: giramos para o centro da fatia escolhida parar embaixo dela
    const alvo = 360 - (escolhida * fatia + fatia / 2);
    const voltasAtuais = Math.ceil(partida.giro / 360) * 360;
    partida.giro = voltasAtuais + 360 * 4 + alvo;
    const roleta = $("#roleta");
    roleta.style.transition = semAnimacao() ? "none" : "transform 3s cubic-bezier(0.17, 0.67, 0.2, 1)";
    roleta.style.transform = `rotate(${partida.giro}deg)`;
    anunciar("Girando a roleta...");
    setTimeout(() => mostrarPerguntaRoleta(FATIAS[escolhida]), semAnimacao() ? 0 : 3100);
}

function mostrarPerguntaRoleta(fatia) {
    if (!partida) {
        return;
    }
    const pergunta = partida.fase.dados.perguntas[partida.passo];
    partida.multiplicador = fatia.multiplicador;
    $("#area-pergunta").innerHTML = `
        <p class="roleta-resultado">Saiu <strong>${fatia.rotulo}</strong>! Acerte para ganhar ${MOEDAS_POR_ACERTO * fatia.multiplicador} moedas.</p>
        <p class="jogo-pergunta" id="pergunta-roleta" tabindex="-1">${escapar(pergunta.pergunta)}</p>
        <div class="opcoes-jogo" role="group" aria-labelledby="pergunta-roleta">
            ${pergunta.opcoes.map((opcao, i) => `<button type="button" class="opcao-jogo" data-acao="responder-roleta" data-opcao="${i}">${escapar(opcao)}</button>`).join("")}
        </div>
        <div id="area-resposta"></div>`;
    $("#pergunta-roleta").focus();
}

function responderRoleta(botao) {
    const perguntas = partida.fase.dados.perguntas;
    const pergunta = perguntas[partida.passo];
    const acertou = Number(botao.dataset.opcao) === pergunta.certa;
    $$("#jogo-corpo .opcao-jogo").forEach((b) => {
        b.disabled = true;
        if (Number(b.dataset.opcao) === pergunta.certa) {
            b.classList.add("opcao-certa");
        }
    });
    if (acertou) {
        ganharMoedas(MOEDAS_POR_ACERTO * partida.multiplicador);
    } else {
        botao.classList.add("opcao-errada");
        partida.erros++;
    }
    const ultima = partida.passo === perguntas.length - 1;
    $("#area-resposta").innerHTML = rodapeResposta(acertou, pergunta.explicacao, ultima);
    $("#area-resposta [data-foco]").focus();
}

/* ---------- Próxima etapa e resultado ---------- */

function proximaEtapa() {
    partida.passo++;
    const continuar = { pescaria: rodadaPescaria, mito: cartaMito, roleta: telaRoleta };
    continuar[partida.fase.jogo]();
}

function calcularEstrelas() {
    // Na memória errar faz parte da exploração, então a régua é mais generosa
    const erros = partida.fase.jogo === "memoria" ? Math.max(0, partida.erros - 2) / 2 : partida.erros;
    if (erros === 0) {
        return 3;
    }
    return erros <= 1 ? 2 : 1;
}

function mostrarResultadoFase() {
    const { fase, indice, moedas } = partida;
    const estrelas = calcularEstrelas();
    const anteriores = estrelasDaFase(fase.id);
    const primeiraVez = anteriores === 0;
    const novasEstrelas = Math.max(0, estrelas - anteriores);
    const granasGanhas = moedas + novasEstrelas * GRANAS_POR_ESTRELA;
    const xpGanho = (primeiraVez ? 40 : 0) + novasEstrelas * 10;
    const basesAntes = [0, 1, 2].filter(bauDisponivel).length;

    estado.fases[fase.id] = Math.max(anteriores, estrelas);
    estado.granas = Math.round((estado.granas + granasGanhas) * 100) / 100;
    registrarDiaJogado();
    if (xpGanho > 0) {
        ganharXp(xpGanho, "Trilha: " + fase.titulo);
    }
    concluirMissao("primeiro-conteudo");
    salvar();

    const apareceuBau = [0, 1, 2].filter(bauDisponivel).length > basesAntes;
    const temProxima = indice < FASES.length - 1;
    let fala;
    if (estrelas === 3) {
        fala = "Perfeito! Três estrelas! Você é fera. ⭐";
    } else if (estrelas === 2) {
        fala = "Muito bom! Jogue de novo para buscar a terceira estrela.";
    } else {
        fala = "Fase concluída! Que tal tentar de novo para ganhar mais estrelas?";
    }
    if (fase.final) {
        fala = "Você chegou ao fim da trilha e virou Mestre da Grana! 🏆";
    }

    telaJogo(`
        <div class="resultado">
            <p class="resultado-estrelas" role="img" aria-label="${estrelas} de 3 estrelas">
                ${[1, 2, 3].map((n) => `<span class="estrela ${n <= estrelas ? "estrela-ganha" : ""}" style="--ordem:${n}" aria-hidden="true">★</span>`).join("")}
            </p>
            <h3 class="resultado-titulo" tabindex="-1" data-foco>${estrelas === 3 ? "Fase perfeita!" : "Fase concluída!"}</h3>
            ${balaoBrotinho(escapar(fala))}
            <div class="premios">
                <div class="premio"><p class="premio-valor">+${granasGanhas}</p><p>Granas</p></div>
                <div class="premio"><p class="premio-valor">+${xpGanho}</p><p>XP</p></div>
                <div class="premio"><p class="premio-valor">🔥 ${sequenciaAtual()}</p><p>${sequenciaAtual() === 1 ? "dia seguido" : "dias seguidos"}</p></div>
            </div>
            ${!primeiraVez && novasEstrelas === 0 ? `<p class="dica">Prêmio de estrelas só vale para estrelas novas. As moedas da partida entraram no saldo.</p>` : ""}
            ${apareceuBau ? `<p class="aviso-bau">🎁 Um baú surpresa apareceu no mapa!</p>` : ""}
            <div class="resultado-botoes">
                ${temProxima ? `<button type="button" class="botao botao-destaque botao-largo" data-acao="proxima-fase">Próxima fase ›</button>` : ""}
                <button type="button" class="botao botao-contorno botao-largo" data-acao="jogar-de-novo">Jogar de novo</button>
                <button type="button" class="botao botao-contorno botao-largo" data-acao="mapa">Voltar ao mapa</button>
            </div>
        </div>`);
}

/* ---------- Baú surpresa ---------- */

function abrirBau(numero) {
    if (!bauDisponivel(numero)) {
        return;
    }
    const granasBau = sortear([300, 400, 500, 600]);
    estado.baus.push(numero);
    estado.granas += granasBau;
    partida = { indice: -1, fase: { titulo: "Baú surpresa" }, moedas: 0 };
    abrirJanelaJogo();
    telaJogo(`
        <div class="bau-abrindo">
            <p class="bau-grande" aria-hidden="true">🎁</p>
            <h3 class="resultado-titulo" tabindex="-1" data-foco>Baú surpresa!</h3>
            <p class="premio-valor bau-premio">+${granasBau} Granas</p>
            ${balaoBrotinho("Use essas Granas na aba Investir. Lembre: diversificar é proteger!")}
            <button type="button" class="botao botao-destaque botao-largo" data-acao="mapa">Voltar ao mapa</button>
            <button type="button" class="botao botao-contorno botao-largo" data-acao="ir-investir">Ir investir</button>
        </div>`);
    $("#jogo-titulo").textContent = "Baú surpresa";
    ganharXp(50, "Baú surpresa");
    salvar();
}

/* =========================================================
   EVENTOS DA TRILHA
   ========================================================= */

function ligarEventosTrilha() {
    $("#trilha-mapa").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button");
        if (!botao || botao.disabled) {
            return;
        }
        if (botao.dataset.fase !== undefined) {
            abrirFase(Number(botao.dataset.fase));
        } else if (botao.dataset.bau !== undefined) {
            abrirBau(Number(botao.dataset.bau));
        }
    });

    $("#jogo-corpo").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao || botao.disabled || !partida) {
            return;
        }
        const acoes = {
            comecar: comecarJogo,
            pescar: () => pescar(botao),
            mito: () => responderMito(botao),
            virar: () => virarCarta(botao),
            girar: () => girarRoleta(botao),
            "responder-roleta": () => responderRoleta(botao),
            proxima: proximaEtapa,
            resultado: mostrarResultadoFase,
            "jogar-de-novo": () => abrirFase(partida.indice),
            "proxima-fase": () => abrirFase(partida.indice + 1),
            mapa: fecharJanelaJogo,
            "ir-investir": () => {
                fecharJanelaJogo();
                location.hash = "investir";
            }
        };
        acoes[botao.dataset.acao]();
    });

    $("#trilha-desafio").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-desafio]");
        if (botao) {
            responderDesafio(Number(botao.dataset.desafio));
        }
    });

    $("#jogo-fechar").addEventListener("click", fecharJanelaJogo);
    $("#jogo").addEventListener("cancel", () => {
        partida = null;
        setTimeout(desenharTudo, 0);
    });
    window.addEventListener("resize", () => requestAnimationFrame(desenharCaminho));
}
