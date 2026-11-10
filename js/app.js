// EducaGrana | protótipo de front-end
// Tudo roda no navegador: os dados ficam salvos no localStorage deste aparelho.

"use strict";

/* =========================================================
   DADOS FIXOS DO PROTÓTIPO
   ========================================================= */

const CHAVE_SALVAR = "educagrana-prototipo-v1";
const GRANAS_INICIAIS = 10000;
const XP_POR_NIVEL = 150;

const PERGUNTAS_PERFIL = [
    {
        pergunta: "Você investiu G$ 1.000 e no mês seguinte eles viraram G$ 850. O que você faz?",
        opcoes: [
            { texto: "Tiro tudo na hora, não quero perder mais.", pontos: 1 },
            { texto: "Espero um pouco para entender o que aconteceu.", pontos: 2 },
            { texto: "Aproveito que está mais barato e invisto mais.", pontos: 3 }
        ]
    },
    {
        pergunta: "Quando você pensa em usar o dinheiro investido?",
        opcoes: [
            { texto: "Em menos de 1 ano.", pontos: 1 },
            { texto: "Entre 1 e 5 anos.", pontos: 2 },
            { texto: "Daqui a mais de 5 anos.", pontos: 3 }
        ]
    },
    {
        pergunta: "Qual frase combina mais com você?",
        opcoes: [
            { texto: "Prefiro ganhar pouco, mas com segurança.", pontos: 1 },
            { texto: "Aceito alguns altos e baixos para ganhar um pouco mais.", pontos: 2 },
            { texto: "Topo bastante risco em busca de ganhos maiores.", pontos: 3 }
        ]
    }
];

const PERFIS = {
    conservador: {
        nome: "Investidor Conservador",
        icone: "🛡️",
        texto: "Você valoriza segurança. Produtos de renda fixa, como CDB e Tesouro Selic, combinam com você."
    },
    moderado: {
        nome: "Investidor Moderado",
        icone: "⚖️",
        texto: "Você busca equilíbrio: uma base segura com uma parte em produtos que oscilam mais."
    },
    arrojado: {
        nome: "Investidor Arrojado",
        icone: "🚀",
        texto: "Você aceita sobe e desce em busca de ganhos maiores. Lembre-se: diversificar protege a carteira."
    }
};

// Taxas FICTÍCIAS, só para a simulação. "variacao" é o quanto o rendimento pode oscilar por mês.
const PRODUTOS = [
    { id: "cdb", nome: "CDB Banco Folha", tipo: "Renda fixa", risco: "baixo", taxa: 0.009, variacao: 0, imposto: "regressivo", info: "Rende todo mês, sem sustos. Garantido pelo FGC." },
    { id: "tesouro", nome: "Tesouro Selic", tipo: "Título público", risco: "baixo", taxa: 0.0085, variacao: 0, imposto: "regressivo", info: "Você empresta para o governo. Ótimo para reserva de emergência." },
    { id: "lci", nome: "LCI Casa Verde", tipo: "Renda fixa", risco: "baixo", taxa: 0.0075, variacao: 0, imposto: "isento", info: "Rende um pouco menos, mas o Leão não morde: é isenta de IR." },
    { id: "fii", nome: "FII Galpões do Porto", tipo: "Fundo imobiliário", risco: "medio", taxa: 0.008, variacao: 0.025, imposto: "fii", info: "Você vira sócio de galpões e recebe parte dos aluguéis." },
    { id: "etf", nome: "ETF Brasil 50", tipo: "Fundo de índice", risco: "alto", taxa: 0.009, variacao: 0.06, imposto: "renda-variavel", info: "Uma cesta com as 50 maiores empresas da bolsa numa compra só." },
    { id: "acao", nome: "Ação Energia Limpa S.A.", tipo: "Ação", risco: "alto", taxa: 0.01, variacao: 0.08, imposto: "renda-variavel", info: "Você vira sócio de uma empresa. Pode subir muito ou cair muito." },
    { id: "cripto", nome: "GranaCoin", tipo: "Criptomoeda", risco: "alto", taxa: 0.012, variacao: 0.18, imposto: "renda-variavel", info: "A mais volátil de todas. Nunca coloque o que não pode perder." }
];

const NOMES_RISCO = { baixo: "Risco baixo", medio: "Risco médio", alto: "Risco alto" };

const MISSOES = [
    { id: "primeiro-investimento", nome: "Faça seu primeiro investimento", icone: "📈", xp: 100 },
    { id: "tres-lancamentos", nome: "Registre 3 lançamentos", icone: "🧾", xp: 50 },
    { id: "definir-limite", nome: "Defina um limite de gastos", icone: "🚦", xp: 40 },
    { id: "criar-meta", nome: "Crie sua primeira meta", icone: "🎯", xp: 50 },
    { id: "avancar-mes", nome: "Avance 1 mês na simulação", icone: "📅", xp: 30 },
    { id: "primeiro-conteudo", nome: "Conclua a 1ª fase da Trilha", icone: "🗺️", xp: 50 },
    { id: "resgatar", nome: "Resgate um investimento e encare o Leão", icone: "🦁", xp: 60 },
    { id: "diversificar", nome: "Tenha 3 produtos diferentes na carteira", icone: "🧺", xp: 80 }
];

const DICAS_DO_DIA = [
    "Monte sua reserva de emergência antes de arriscar: o ideal é guardar de 3 a 6 meses dos seus gastos.",
    "Juros compostos são juros sobre juros. Quanto antes você começa, mais o tempo trabalha por você.",
    "Diversificar é não colocar todos os ovos na mesma cesta.",
    "Promessa de ganho garantido e rápido é sinal de golpe. Desconfie sempre.",
    "Anote todos os gastos por um mês: os pequenos somam mais do que parece.",
    "Bet não é investimento: no longo prazo, quem ganha é a casa.",
    "Compare investimentos pela rentabilidade líquida, já descontando o imposto.",
    "Uma meta com valor e prazo definidos é muito mais fácil de alcançar.",
    "Dinheiro parado perde valor para a inflação. Guardar no colchão também tem custo.",
    "Antes de comprar por impulso, espere 24 horas. Se ainda fizer sentido, compre."
];

/* =========================================================
   ESTADO (o que o usuário fez) E SALVAMENTO
   ========================================================= */

function estadoInicial() {
    return {
        usuario: null,
        perfil: null,
        vaso: "terracota",
        xp: 0,
        granas: GRANAS_INICIAIS,
        mes: 1,
        carteira: [],
        lancamentos: [],
        limites: {},
        metas: [],
        fases: {},
        baus: [],
        sequencia: { dias: 0, ultimo: null },
        historico: [GRANAS_INICIAIS],
        orcamento: null,
        ajustes: { textoMaior: false, semAnimacao: false },
        impostoPago: 0,
        lucroRealizado: 0,
        desafio: null,
        noticia: null,
        missoesFeitas: []
    };
}

let estado = carregar();
estado.lancamentos.forEach((lancamento) => {
    if (!lancamento.data) {
        lancamento.data = dataDeHoje(0);
    }
});
// Metas criadas em versões anteriores do protótipo ganham os campos novos
estado.metas.forEach((meta) => {
    meta.icone = meta.icone || "🎯";
    meta.criadaEm = meta.criadaEm || dataDeHoje(0);
    meta.aportes = meta.aportes || (meta.guardado > 0 ? [{ valor: meta.guardado, data: meta.criadaEm }] : []);
});

function carregar() {
    try {
        const salvo = localStorage.getItem(CHAVE_SALVAR);
        return salvo ? Object.assign(estadoInicial(), JSON.parse(salvo)) : estadoInicial();
    } catch (erro) {
        return estadoInicial();
    }
}

function salvar() {
    try {
        localStorage.setItem(CHAVE_SALVAR, JSON.stringify(estado));
    } catch (erro) {
        // Sem localStorage (aba anônima, por exemplo) o app continua funcionando, só não guarda.
    }
}

/* =========================================================
   FUNÇÕES DE APOIO
   ========================================================= */

const $ = (seletor) => document.querySelector(seletor);
const $$ = (seletor) => document.querySelectorAll(seletor);

function reais(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function granas(valor) {
    return "G$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function novoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function nivelAtual() {
    return Math.floor(estado.xp / XP_POR_NIVEL) + 1;
}

function avisar(mensagem) {
    const aviso = document.createElement("div");
    aviso.className = "aviso-rapido";
    aviso.innerHTML = mensagem;
    const area = $("#avisos");
    area.appendChild(aviso);
    // No máximo 3 avisos na tela: os mais antigos saem para não cobrir o app
    while (area.children.length > 3) {
        area.firstElementChild.remove();
    }
    setTimeout(() => aviso.remove(), 3800);
}

function avisarComAcao(mensagem, rotulo, acao) {
    const aviso = document.createElement("div");
    aviso.className = "aviso-rapido aviso-com-acao";
    aviso.innerHTML = `<span>${mensagem}</span>`;
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "aviso-botao";
    botao.textContent = rotulo;
    botao.addEventListener("click", () => {
        aviso.remove();
        acao();
    });
    aviso.appendChild(botao);
    $("#avisos").appendChild(aviso);
    setTimeout(() => aviso.remove(), 6000);
}

function mostrarErro(campo, mensagem) {
    const erro = $("#erro-" + campo.id);
    if (erro) {
        erro.textContent = mensagem;
    }
    campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
    return !mensagem;
}

function ajustarBarra(barra, porcentagem) {
    barra.value = Math.round(Math.max(0, Math.min(100, porcentagem)));
}

/* =========================================================
   GAMIFICAÇÃO: XP, NÍVEIS E MISSÕES
   ========================================================= */

function ganharXp(quantidade, motivo) {
    const nivelAntes = nivelAtual();
    estado.xp += quantidade;
    avisar(`+${quantidade} XP · ${escapar(motivo)}`);
    if (nivelAtual() > nivelAntes) {
        setTimeout(() => avisar(`🎉 Você subiu para o <strong>nível ${nivelAtual()}</strong>!`), 600);
        verificarEvolucao(nivelAntes);
    }
}

function concluirMissao(id) {
    if (estado.missoesFeitas.includes(id)) {
        return;
    }
    const missao = MISSOES.find((m) => m.id === id);
    estado.missoesFeitas.push(id);
    ganharXp(missao.xp, "Missão: " + missao.nome);
}

/* =========================================================
   ENTRADA: CADASTRO E QUIZ DE PERFIL
   ========================================================= */

let perguntaAtual = 0;
let pontosQuiz = 0;
let refazendoQuiz = false;

function irParaPasso(id) {
    $$(".passo").forEach((passo) => {
        passo.hidden = passo.id !== id;
    });
    const titulo = $("#" + id + " h1");
    if (titulo) {
        titulo.setAttribute("tabindex", "-1");
        titulo.focus();
    }
}

function validarCadastro(evento) {
    evento.preventDefault();
    const nome = $("#cad-nome");
    const email = $("#cad-email");
    const senha = $("#cad-senha");
    const termos = $("#cad-termos");

    const nomeOk = mostrarErro(nome, nome.value.trim().length < 2 ? "Digite pelo menos 2 letras." : "");
    const emailOk = mostrarErro(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : "Digite um e-mail válido, como nome@email.com.");
    let erroSenha = "";
    if (senha.value.length < 6) {
        erroSenha = "A senha precisa ter pelo menos 6 caracteres.";
    } else if (!/\d/.test(senha.value)) {
        erroSenha = "Inclua pelo menos um número na senha.";
    }
    const senhaOk = mostrarErro(senha, erroSenha);
    const termosOk = mostrarErro(termos, termos.checked ? "" : "Marque para continuar.");

    if (!(nomeOk && emailOk && senhaOk && termosOk)) {
        $("#form-cadastro [aria-invalid='true']").focus();
        return;
    }

    // A senha não é guardada: no protótipo ela só passa pela validação.
    estado.usuario = { nome: nome.value.trim(), email: email.value.trim() };
    salvar();
    iniciarQuiz();
}

function iniciarQuiz() {
    perguntaAtual = 0;
    pontosQuiz = 0;
    mostrarPergunta();
    irParaPasso("passo-perfil");
}

function mostrarPergunta() {
    const dados = PERGUNTAS_PERFIL[perguntaAtual];
    $("#quiz-etapa").textContent = `Pergunta ${perguntaAtual + 1} de ${PERGUNTAS_PERFIL.length}`;
    $("#quiz-pergunta").textContent = dados.pergunta;
    $("#quiz-opcoes").innerHTML = dados.opcoes.map((opcao) => `
        <label class="opcao">
            <input type="radio" name="resposta" value="${opcao.pontos}">
            <span>${escapar(opcao.texto)}</span>
        </label>`).join("");
    $("#erro-quiz").textContent = "";
    $("#quiz-botao").textContent = perguntaAtual === PERGUNTAS_PERFIL.length - 1 ? "Ver meu perfil" : "Próxima";
}

function responderQuiz(evento) {
    evento.preventDefault();
    const marcada = $("#form-quiz input[name='resposta']:checked");
    if (!marcada) {
        $("#erro-quiz").textContent = "Escolha uma opção para continuar.";
        return;
    }
    pontosQuiz += Number(marcada.value);
    perguntaAtual++;

    if (perguntaAtual < PERGUNTAS_PERFIL.length) {
        mostrarPergunta();
        $("#quiz-pergunta").focus();
        return;
    }

    if (pontosQuiz <= 4) {
        estado.perfil = "conservador";
    } else if (pontosQuiz <= 7) {
        estado.perfil = "moderado";
    } else {
        estado.perfil = "arrojado";
    }
    salvar();
    mostrarResultado();
}

function mostrarResultado() {
    const perfil = PERFIS[estado.perfil];
    $("#resultado-selo").textContent = perfil.icone;
    $("#resultado-perfil").textContent = perfil.nome.replace("Investidor ", "");
    $("#resultado-texto").textContent = perfil.texto;
    $("#botao-entrar").textContent = refazendoQuiz ? "Voltar ao app" : "Fazer meu primeiro investimento";
    irParaPasso("passo-resultado");
}

function mostrarEntrada(mostrar) {
    $("#entrada").hidden = !mostrar;
    $("#app").hidden = mostrar;
    $("#conteudo").hidden = mostrar;
}

function entrarNoApp(telaInicial) {
    mostrarEntrada(false);
    if (telaInicial) {
        location.hash = telaInicial;
    }
    mostrarTela();
}

/* =========================================================
   NAVEGAÇÃO ENTRE AS TELAS
   ========================================================= */

const TELAS = ["inicio", "financas", "metas", "investir", "aprender", "perfil"];

function mostrarTela() {
    let nome = location.hash.replace("#", "");
    if (!TELAS.includes(nome)) {
        nome = "inicio";
    }
    TELAS.forEach((tela) => {
        $("#tela-" + tela).hidden = tela !== nome;
    });
    $$(".navegacao a").forEach((link) => {
        if (link.dataset.tela === nome) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    desenharTudo();
    window.scrollTo(0, 0);
    $("#tela-" + nome + " h1").setAttribute("tabindex", "-1");
}

/* =========================================================
   DESENHO DE CADA TELA
   ========================================================= */

function valorInvestido() {
    return estado.carteira.reduce((total, posicao) => total + posicao.valorAtual, 0);
}

function desenharTudo() {
    desenharTopo();
    desenharInicio();
    desenharFinancas();
    desenharMetas();
    desenharInvestir();
    desenharAprender();
    desenharPerfil();
    salvar();
}

function desenharTopo() {
    $("#topo-saldo").textContent = granas(estado.granas);
    $("#topo-nivel").textContent = `Nível ${nivelAtual()} · ${estado.xp} XP`;
}

let mostrarTodasMissoes = false;

function saudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
        return "Bom dia";
    }
    if (hora >= 12 && hora < 18) {
        return "Boa tarde";
    }
    return "Boa noite";
}

function dicaDeHoje() {
    const inicioDoAno = new Date(new Date().getFullYear(), 0, 0);
    const diaDoAno = Math.floor((Date.now() - inicioDoAno) / 86400000);
    return DICAS_DO_DIA[diaDoAno % DICAS_DO_DIA.length];
}

// Minigráfico (sparkline) da evolução do patrimônio
function desenharGrafico(pontos) {
    const svg = $("#inicio-grafico");
    const legenda = $("#inicio-grafico-legenda");
    if (pontos.length < 2) {
        svg.innerHTML = `<line x1="0" y1="16" x2="100" y2="16" class="grafico-vazio"/>`;
        legenda.textContent = "Invista e avance meses na aba Investir para ver sua evolução aqui.";
        return;
    }
    const menor = Math.min(...pontos);
    const maior = Math.max(...pontos);
    const faixa = maior - menor || 1;
    const coords = pontos.map((valor, i) => {
        const x = (i / (pontos.length - 1)) * 100;
        const y = 29 - ((valor - menor) / faixa) * 26;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    svg.innerHTML = `
        <polygon class="grafico-area" points="0,32 ${coords.join(" ")} 100,32"/>
        <polyline class="grafico-linha" points="${coords.join(" ")}"/>`;
    const meses = pontos.length - 1;
    legenda.textContent = `De ${granas(pontos[0])} para ${granas(pontos[pontos.length - 1])} em ${meses} ${meses === 1 ? "mês" : "meses"} de simulação.`;
}

function passosIniciais() {
    return [
        { nome: "Faça seu primeiro investimento", feito: estado.missoesFeitas.includes("primeiro-investimento"), tela: "investir", acao: "Investir" },
        { nome: "Registre um gasto ou uma receita", feito: estado.lancamentos.length > 0, tela: "financas", acao: "Registrar" },
        { nome: "Jogue a fase 1 da Trilha", feito: estrelasDaFase(FASES[0].id) > 0, tela: "aprender", acao: "Jogar" }
    ];
}

function desenharInicio() {
    const perfil = PERFIS[estado.perfil] || PERFIS.moderado;
    $("#inicio-saudacao").textContent = saudacao();
    $("#inicio-nome").textContent = estado.usuario ? estado.usuario.nome : "";
    $("#inicio-avatar").innerHTML = avatarPequeno();
    $("#inicio-colheita").hidden = valorDaColheita(frutosParaColher()) === 0;
    $("#inicio-selo").textContent = `${perfil.icone} ${perfil.nome}`;

    const dias = sequenciaAtual();
    $("#inicio-sequencia").textContent = `🔥 ${dias}`;
    $("#inicio-sequencia").setAttribute("title", `${dias} ${dias === 1 ? "dia seguido" : "dias seguidos"} jogando a Trilha`);

    const xpNoNivel = estado.xp % XP_POR_NIVEL;
    $("#inicio-nivel").textContent = nivelAtual();
    $("#inicio-falta-xp").textContent = `faltam ${XP_POR_NIVEL - xpNoNivel} XP`;
    ajustarBarra($("#inicio-barra-xp"), (xpNoNivel / XP_POR_NIVEL) * 100);

    // Patrimônio e evolução
    const total = estado.granas + valorInvestido();
    const variacao = ((total - GRANAS_INICIAIS) / GRANAS_INICIAIS) * 100;
    $("#inicio-patrimonio").textContent = granas(total);
    const campoVariacao = $("#inicio-variacao");
    campoVariacao.textContent = `${variacao >= 0 ? "▲" : "▼"} ${Math.abs(variacao).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    campoVariacao.className = "variacao " + (variacao >= 0 ? "variacao-alta" : "variacao-baixa");
    campoVariacao.setAttribute("aria-label", `${variacao >= 0 ? "alta" : "queda"} de ${Math.abs(variacao).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% desde o começo`);
    const pontos = estado.historico.slice();
    if (Math.abs(pontos[pontos.length - 1] - total) > 0.01) {
        pontos.push(total);
    }
    desenharGrafico(pontos);

    $("#inicio-dica").textContent = dicaDeHoje();

    // Primeiros passos ou resumo
    const passos = passosIniciais();
    const novato = passos.some((passo) => !passo.feito);
    $("#inicio-comece").hidden = !novato;
    $("#inicio-resumo").hidden = novato;
    if (novato) {
        $("#inicio-passos").innerHTML = passos.map((passo, i) => `
            <li class="passo-item ${passo.feito ? "passo-feito" : ""}">
                <span class="passo-numero" aria-hidden="true">${passo.feito ? "✔" : i + 1}</span>
                <span class="passo-nome">${escapar(passo.nome)}${passo.feito ? "<span class='rotulo-invisivel'> (feito)</span>" : ""}</span>
                ${passo.feito ? "" : `<button type="button" class="botao botao-destaque botao-pequeno" data-ir-tela="${passo.tela}">${passo.acao}</button>`}
            </li>`).join("");
    } else {
        const { receitas, despesas } = totaisDoMes();
        const saldo = receitas - despesas;
        const meta = estado.metas.find((m) => m.guardado < m.valor) || estado.metas[0];
        const progressoMeta = meta ? Math.min(100, Math.round((meta.guardado / meta.valor) * 100)) : 0;
        $("#inicio-resumo").innerHTML = `
            <button type="button" class="resumo-cartao" data-ir-tela="financas">
                <span class="cartao-rotulo">Saldo do mês</span>
                <span class="resumo-valor ${saldo < 0 ? "negativo" : "positivo"}">${reais(saldo)}</span>
                <span class="dica">${reais(despesas)} em gastos</span>
            </button>
            <button type="button" class="resumo-cartao" data-ir-tela="metas">
                <span class="cartao-rotulo">${meta ? "Meta: " + escapar(meta.nome) : "Metas"}</span>
                ${meta
                    ? `<span class="anel" style="--p:${progressoMeta}" aria-hidden="true"><span>${progressoMeta}%</span></span>
                       <span class="rotulo-invisivel">${progressoMeta}% concluída</span>`
                    : `<span class="resumo-valor">🎯</span><span class="dica">Crie sua primeira meta</span>`}
            </button>`;
    }

    // Missões: só as 3 próximas pendentes, ou todas
    // Enquanto os primeiros passos aparecem, as missões não repetem o que já está neles
    const jaNosPassos = novato ? ["primeiro-investimento", "primeiro-conteudo"] : [];
    const pendentes = MISSOES.filter((missao) => !estado.missoesFeitas.includes(missao.id) && !jaNosPassos.includes(missao.id));
    const lista = mostrarTodasMissoes ? MISSOES : pendentes.slice(0, 3);
    const botaoTodas = $("#botao-todas-missoes");
    botaoTodas.textContent = mostrarTodasMissoes ? "Mostrar menos" : `Ver todas (${estado.missoesFeitas.length}/${MISSOES.length})`;
    botaoTodas.setAttribute("aria-expanded", String(mostrarTodasMissoes));
    $("#lista-missoes").innerHTML = lista.length === 0
        ? `<li class="vazio">Todas as missões concluídas! 🏆</li>`
        : lista.map((missao) => {
            const feita = estado.missoesFeitas.includes(missao.id);
            return `
                <li class="missao ${feita ? "missao-feita" : ""}">
                    <span class="missao-icone" aria-hidden="true">${feita ? "✔" : missao.icone}</span>
                    <div>
                        <p class="missao-nome">${escapar(missao.nome)}</p>
                        <p class="missao-xp">+${missao.xp} XP</p>
                    </div>
                    <span class="missao-status">${feita ? "Feita" : "A fazer"}</span>
                </li>`;
        }).join("");

    // Trilha
    const indice = indiceFaseAtual();
    const fase = FASES[indice];
    const completa = fasesConcluidas() === FASES.length;
    $("#inicio-trilha-texto").textContent = completa
        ? "Trilha completa! Busque 3 estrelas em todas as fases."
        : `Fase ${indice + 1}: ${fase.titulo} · ${JOGOS[fase.jogo].icone} ${JOGOS[fase.jogo].nome}`;
    $("#botao-jogar-trilha").textContent = completa ? "Ver o mapa" : `Jogar fase ${indice + 1}`;
}

/* =========================================================
   MODAL
   ========================================================= */

function abrirModal(titulo, html) {
    $("#modal-titulo").textContent = titulo;
    $("#modal-corpo").innerHTML = html;
    const modal = $("#modal");
    if (!modal.open) {
        modal.showModal();
    }
    const primeiroCampo = modal.querySelector(".modal-corpo input, .modal-corpo button");
    if (primeiroCampo) {
        primeiroCampo.focus();
    }
}

function fecharModal() {
    $("#modal").close();
}

/* =========================================================
   EVENTOS (cliques e envios de formulário)
   ========================================================= */

function ligarEventos() {
    // Entrada
    $$("[data-ir-passo]").forEach((botao) => {
        botao.addEventListener("click", () => irParaPasso(botao.dataset.irPasso));
    });
    $("#form-cadastro").addEventListener("submit", validarCadastro);
    $("#form-quiz").addEventListener("submit", responderQuiz);
    $("#botao-entrar").addEventListener("click", () => {
        const telaInicial = refazendoQuiz ? "perfil" : "investir";
        if (!refazendoQuiz) {
            setTimeout(() => avisar("Escolha um produto e toque em <strong>Investir</strong> para cumprir sua primeira missão."), 400);
        }
        refazendoQuiz = false;
        entrarNoApp(telaInicial);
    });

    // Validação ao sair de cada campo do cadastro
    $$("#form-cadastro input").forEach((campo) => {
        campo.addEventListener("input", () => mostrarErro(campo, ""));
    });

    // Navegação
    window.addEventListener("hashchange", mostrarTela);
    $("#botao-todas-missoes").addEventListener("click", () => {
        mostrarTodasMissoes = !mostrarTodasMissoes;
        desenharInicio();
    });
    $("#botao-jogar-trilha").addEventListener("click", () => {
        location.hash = "aprender";
        if (fasesConcluidas() < FASES.length) {
            abrirFase(indiceFaseAtual());
        }
    });

    // Botões criados dinamicamente: um único ouvinte no app inteiro
    $("#app").addEventListener("click", (evento) => {
        const alvo = evento.target.closest("button");
        if (!alvo) {
            return;
        }
        const d = alvo.dataset;
        if (d.irTela) {
            location.hash = d.irTela;
        } else if (d.limite) {
            abrirLimite(d.limite);
        }
    });

    // Perfil
    $("#botao-refazer-quiz").addEventListener("click", () => {
        refazendoQuiz = true;
        mostrarEntrada(true);
        iniciarQuiz();
    });
    $("#botao-reiniciar").addEventListener("click", () => {
        abrirModal("Apagar tudo?", `
            <p>Isso apaga sua conta, carteira, metas e progresso deste aparelho. Não dá para desfazer.</p>
            <button type="button" class="botao botao-perigo botao-largo" id="confirmar-reiniciar">Sim, apagar tudo</button>
            <button type="button" class="botao botao-contorno botao-largo" id="cancelar-reiniciar">Cancelar</button>`);
        $("#confirmar-reiniciar").addEventListener("click", () => {
            estado = estadoInicial();
            salvar();
            aplicarAjustes();
            fecharModal();
            location.hash = "";
            mostrarEntrada(true);
            $("#form-cadastro").reset();
            irParaPasso("passo-intro");
        });
        $("#cancelar-reiniciar").addEventListener("click", fecharModal);
    });

    // Modal
    $("#modal-fechar").addEventListener("click", fecharModal);
    $("#modal").addEventListener("click", (evento) => {
        if (evento.target.id === "modal") {
            fecharModal();
        }
    });
}

/* =========================================================
   INÍCIO
   ========================================================= */

ligarEventos();
ligarEventosTrilha();
ligarEventosFinancas();
ligarEventosMetas();
ligarEventosInvestir();
ligarEventosPerfil();
ligarEventosPe();
aplicarAjustes();

if (estado.usuario && estado.perfil) {
    entrarNoApp();
} else {
    mostrarEntrada(true);
}
