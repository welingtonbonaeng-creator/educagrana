// EducaGrana | Perfil (EAP 2.2 e 2.3: perfil do usuário, perfil de investidor, avatar, selo e pontuação)
// Estatísticas, conquistas, coleção de cartas da Trilha, Pé de Grana e ajustes de acessibilidade.
// Usa o estado e as funções de apoio de app.js.

"use strict";

const CONQUISTAS = [
    { nome: "Primeiro passo", descricao: "Faça o primeiro investimento", icone: "🌱", feita: () => estado.missoesFeitas.includes("primeiro-investimento") },
    { nome: "Organizado", descricao: "Registre 3 lançamentos", icone: "🗂️", feita: () => estado.missoesFeitas.includes("tres-lancamentos") },
    { nome: "Sonhador", descricao: "Crie uma meta", icone: "🎯", feita: () => estado.missoesFeitas.includes("criar-meta") },
    { nome: "Realizador", descricao: "Conclua uma meta", icone: "🏆", feita: () => estado.metas.some((m) => m.guardado >= m.valor) },
    { nome: "Domador do Leão", descricao: "Resgate um investimento", icone: "🦁", feita: () => estado.missoesFeitas.includes("resgatar") },
    { nome: "Diversificado", descricao: "Tenha 3 produtos na carteira", icone: "🧺", feita: () => estado.missoesFeitas.includes("diversificar") },
    { nome: "Explorador", descricao: "Conclua 3 fases da Trilha", icone: "🧭", feita: () => fasesConcluidas() >= 3 },
    { nome: "Perfeccionista", descricao: "Faça 3 estrelas em uma fase", icone: "⭐", feita: () => Object.values(estado.fases).some((e) => e === 3) },
    { nome: "Em chamas", descricao: "Jogue 3 dias seguidos", icone: "🔥", feita: () => (estado.sequencia.recorde || estado.sequencia.dias) >= 3 },
    { nome: "Mestre da Grana", descricao: "Conclua a Trilha inteira", icone: "🎓", feita: () => fasesConcluidas() === FASES.length },
    { nome: "Veterano", descricao: "Chegue ao nível 5", icone: "🏅", feita: () => nivelAtual() >= 5 }
];

const EQUIPE = [
    ["Alexandre da Rocha Rodrigues", "Gerente do Projeto"],
    ["Guilherme Gomes Carvalho", "Analista Financeiro"],
    ["Isaque Esteves Tavares da Silva", "Testador"],
    ["João Pedro da Silva Lima", "Programador Back-End"],
    ["João Victor P. de M. Andrade", "Programador Front-End"],
    ["Welington Silva Pereira", "Programador Front-End e Documentador"]
];

/* =========================================================
   AJUSTES DE ACESSIBILIDADE
   ========================================================= */

function aplicarAjustes() {
    const ajustes = estado.ajustes || {};
    document.documentElement.classList.toggle("texto-maior", !!ajustes.textoMaior);
    document.documentElement.classList.toggle("sem-animacao", !!ajustes.semAnimacao);
}

/* =========================================================
   DESENHO DA TELA
   ========================================================= */

function desenharPerfil() {
    const perfil = PERFIS[estado.perfil] || PERFIS.moderado;
    const xpNoNivel = estado.xp % XP_POR_NIVEL;
    $("#perfil-nome").textContent = estado.usuario ? estado.usuario.nome : "";
    $("#perfil-selo").textContent = perfil.icone + " " + perfil.nome;
    $("#perfil-nivel").textContent = nivelAtual();
    $("#perfil-xp-texto").textContent = `${estado.xp} XP · faltam ${XP_POR_NIVEL - xpNoNivel} para o nível ${nivelAtual() + 1}`;
    ajustarBarra($("#perfil-barra-xp"), (xpNoNivel / XP_POR_NIVEL) * 100);

    const metasFeitas = estado.metas.filter((m) => m.guardado >= m.valor).length;
    const estatisticas = [
        ["🔥", sequenciaAtual(), "dias seguidos"],
        ["🏅", estado.sequencia.recorde || estado.sequencia.dias || 0, "recorde de dias"],
        ["⭐", `${totalDeEstrelas()}/${FASES.length * 3}`, "estrelas"],
        ["🎯", metasFeitas, metasFeitas === 1 ? "meta concluída" : "metas concluídas"],
        ["💰", granas(estado.lucroRealizado || 0), "lucro realizado"],
        ["🦁", granas(estado.impostoPago || 0), "pago ao Leão"]
    ];
    $("#perfil-estatisticas").innerHTML = estatisticas.map(([icone, valor, nome]) => `
        <div class="estatistica">
            <p class="estatistica-valor"><span aria-hidden="true">${icone}</span> ${valor}</p>
            <p class="estatistica-nome">${nome}</p>
        </div>`).join("");

    const feitas = CONQUISTAS.filter((c) => c.feita()).length;
    $("#perfil-conquistas-total").textContent = `${feitas} de ${CONQUISTAS.length}`;
    $("#lista-conquistas").innerHTML = CONQUISTAS.map((c) => {
        const feita = c.feita();
        return `
            <li class="medalha ${feita ? "medalha-feita" : ""}">
                <span class="medalha-icone" aria-hidden="true">${feita ? c.icone : "🔒"}</span>
                <p class="medalha-nome">${escapar(c.nome)}<span class="rotulo-invisivel">${feita ? ": conquistada" : ": bloqueada"}</span></p>
                <p class="medalha-descricao">${escapar(c.descricao)}</p>
            </li>`;
    }).join("");

    $("#perfil-cartas-total").textContent = `${fasesConcluidas()} de ${FASES.length}`;
    $("#lista-cartas").innerHTML = FASES.map((fase, i) => {
        const liberada = estrelasDaFase(fase.id) > 0;
        return `
            <li>
                <button type="button" class="carta-colecao ${liberada ? "" : "carta-bloqueada"}" data-carta-colecao="${i}" ${liberada ? "" : "disabled"}
                    aria-label="${liberada ? "Carta " + escapar(fase.titulo) : "Carta bloqueada: conclua a fase " + (i + 1)}">
                    <span class="carta-colecao-icone" aria-hidden="true">${liberada ? fase.icone : "❔"}</span>
                    <span class="carta-colecao-nome" aria-hidden="true">${liberada ? escapar(fase.titulo) : "Fase " + (i + 1)}</span>
                </button>
            </li>`;
    }).join("");

    desenharPe();

    const ajustes = estado.ajustes || {};
    $$(".interruptor").forEach((botao) => {
        botao.setAttribute("aria-checked", String(!!ajustes[botao.dataset.ajuste]));
    });
}

/* =========================================================
   JANELAS
   ========================================================= */

function abrirCarta(indice) {
    const fase = FASES[indice];
    abrirModal(`${fase.icone} ${fase.titulo}`, `
        <p class="carta-estrelas" role="img" aria-label="${estrelasDaFase(fase.id)} de 3 estrelas">${estrelasTexto(estrelasDaFase(fase.id))}</p>
        <ul class="dica-lista">${fase.dica.map((linha) => `<li>${escapar(linha)}</li>`).join("")}</ul>
        <button type="button" class="botao botao-contorno botao-largo" id="rejogar-carta">Jogar esta fase de novo</button>`);
    $("#rejogar-carta").addEventListener("click", () => {
        fecharModal();
        location.hash = "aprender";
        abrirFase(indice);
    });
}

function abrirEditarNome() {
    abrirModal("Editar nome", `
        <form id="form-nome" class="formulario" novalidate>
            <div class="campo">
                <label for="novo-nome">Como quer ser chamado?</label>
                <input type="text" id="novo-nome" maxlength="30" required value="${escapar(estado.usuario.nome)}" aria-describedby="erro-novo-nome">
                <p class="erro" id="erro-novo-nome" aria-live="polite"></p>
            </div>
            <button type="submit" class="botao botao-destaque botao-largo">Salvar</button>
        </form>`);
    $("#form-nome").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const campo = $("#novo-nome");
        if (!mostrarErro(campo, campo.value.trim().length >= 2 ? "" : "Digite pelo menos 2 letras.")) {
            campo.focus();
            return;
        }
        estado.usuario.nome = campo.value.trim();
        fecharModal();
        avisar("Nome atualizado");
        desenharTudo();
    });
}

function abrirSobre() {
    abrirModal("Sobre o EducaGrana", `
        <img src="img/logo-claro.png" alt="EducaGrana" class="sobre-logo" width="480" height="173">
        <p>App de educação financeira gamificada: aprenda jogando, controle seus gastos, crie metas e simule investimentos com dinheiro virtual. Uma alternativa saudável às apostas.</p>
        <p class="alerta">Simulação educativa. Todo o dinheiro é virtual, as taxas são fictícias e nada aqui é recomendação de investimento.</p>
        <table class="tabela-resgate">
            <caption>Equipe do projeto</caption>
            <tbody>
                ${EQUIPE.map(([nome, funcao]) => `<tr><th scope="row">${escapar(nome)}</th><td>${escapar(funcao)}</td></tr>`).join("")}
            </tbody>
        </table>
        <p class="dica">Práticas Extensionistas Integradoras II · Engenharia de Software · Universidade de Vassouras · 2026</p>`);
}

/* =========================================================
   EVENTOS
   ========================================================= */

function ligarEventosPerfil() {
    $("#tela-perfil").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button");
        if (!botao || botao.disabled) {
            return;
        }
        const d = botao.dataset;
        if (d.vaso) {
            estado.vaso = d.vaso;
            avisar(`Vaso ${escapar(VASOS.find((v) => v.id === d.vaso).nome)} escolhido`);
            desenharTudo();
        } else if (d.cartaColecao !== undefined) {
            abrirCarta(Number(d.cartaColecao));
        } else if (d.ajuste) {
            estado.ajustes = estado.ajustes || {};
            estado.ajustes[d.ajuste] = !estado.ajustes[d.ajuste];
            aplicarAjustes();
            desenharTudo();
        }
    });
    $("#botao-editar-nome").addEventListener("click", abrirEditarNome);
    $("#botao-sobre").addEventListener("click", abrirSobre);
}
