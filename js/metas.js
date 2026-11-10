// EducaGrana | Metas financeiras (EAP 4)
// 4.1 metas por prazo, 4.2 acompanhamento do progresso, 4.3 valores necessários para alcançar.
// Usa o estado e as funções de apoio de app.js.

"use strict";

const IDEIAS_DE_META = [
    { nome: "Reserva de emergência", icone: "🛟", valor: 6000, meses: 12 },
    { nome: "Viagem", icone: "✈️", valor: 5000, meses: 12 },
    { nome: "Celular novo", icone: "📱", valor: 3000, meses: 10 },
    { nome: "Curso", icone: "🎓", valor: 2000, meses: 6 },
    { nome: "Entrada do apê", icone: "🏠", valor: 60000, meses: 60 },
    { nome: "Carro", icone: "🚗", valor: 40000, meses: 48 }
];

const ICONES_META = ["🎯", "🛟", "✈️", "📱", "🎓", "🏠", "🚗", "💍", "🎮", "💻"];

// Rendimento usado na conta "e se investir?": o mesmo do CDB da simulação
const TAXA_META = 0.009;

let filtroPrazo = "todas";

function prazoDaMeta(meses) {
    if (meses <= 12) {
        return "Curto prazo";
    }
    if (meses <= 60) {
        return "Médio prazo";
    }
    return "Longo prazo";
}

function chavePrazo(meses) {
    return meses <= 12 ? "curto" : meses <= 60 ? "medio" : "longo";
}

function mesesEntre(inicio, fim) {
    const [a1, m1, d1] = inicio.split("-").map(Number);
    const [a2, m2, d2] = fim.split("-").map(Number);
    let meses = (a2 - a1) * 12 + (m2 - m1);
    if (d2 < d1) {
        meses--;
    }
    return Math.max(0, meses);
}

function dataFinalDaMeta(meta) {
    const [ano, mes] = meta.criadaEm.split("-").map(Number);
    const fim = new Date(ano, mes - 1 + meta.meses, 1);
    return `${NOMES_MESES[fim.getMonth()].slice(0, 3)}/${fim.getFullYear()}`;
}

// Parcela mensal para chegar ao valor investindo a uma taxa (fórmula de pagamento periódico)
function parcelaInvestindo(valorFinal, jaTem, meses, taxa) {
    const fator = Math.pow(1 + taxa, meses);
    const falta = valorFinal - jaTem * fator;
    if (falta <= 0) {
        return 0;
    }
    return (falta * taxa) / (fator - 1);
}

function situacaoDaMeta(meta) {
    const passados = mesesEntre(meta.criadaEm, dataDeHoje(0));
    const restantes = Math.max(1, meta.meses - passados);
    const falta = Math.max(0, meta.valor - meta.guardado);
    const esperado = meta.valor * Math.min(1, passados / meta.meses);
    let status;
    if (falta === 0) {
        status = { classe: "status-feita", texto: "🏆 Concluída" };
    } else if (meta.guardado >= esperado) {
        status = { classe: "status-ok", texto: "✅ No ritmo" };
    } else {
        status = { classe: "status-atraso", texto: "⚠️ Abaixo do ritmo" };
    }
    return { passados, restantes, falta, status, porMes: falta / restantes, investindo: parcelaInvestindo(meta.valor, meta.guardado, restantes, TAXA_META) };
}

/* =========================================================
   DESENHO DA TELA
   ========================================================= */

function desenharMetas() {
    const metas = estado.metas;
    const totalValor = metas.reduce((s, m) => s + m.valor, 0);
    const totalGuardado = metas.reduce((s, m) => s + Math.min(m.guardado, m.valor), 0);
    const concluidas = metas.filter((m) => m.guardado >= m.valor).length;
    const geral = totalValor ? Math.round((totalGuardado / totalValor) * 100) : 0;

    $("#metas-resumo").innerHTML = metas.length === 0
        ? `<p class="cartao-rotulo">Seus sonhos com data marcada</p>
           <p class="metas-resumo-texto">Crie uma meta e eu te mostro quanto guardar por mês.</p>`
        : `<span class="anel anel-claro" style="--p:${geral}" aria-hidden="true"><span>${geral}%</span></span>
           <div>
               <p class="cartao-rotulo">Guardado em todas as metas</p>
               <p class="cartao-valor-menor">${reais(totalGuardado)} <span class="metas-de">de ${reais(totalValor)}</span></p>
               <p class="cartao-detalhe">${concluidas} de ${metas.length} ${metas.length === 1 ? "meta concluída" : "metas concluídas"}</p>
           </div>`;

    $$(".filtro-prazo").forEach((botao) => {
        botao.setAttribute("aria-pressed", String(botao.dataset.filtroPrazo === filtroPrazo));
    });

    $("#ideias-metas").innerHTML = IDEIAS_DE_META.map((ideia, i) => `
        <button type="button" class="ideia-meta" data-ideia="${i}">
            <span aria-hidden="true">${ideia.icone}</span> ${escapar(ideia.nome)}
        </button>`).join("");

    const lista = $("#lista-metas");
    const visiveis = metas.filter((m) => filtroPrazo === "todas" || chavePrazo(m.meses) === filtroPrazo);
    if (metas.length === 0) {
        lista.innerHTML = `<li class="vazio">Você ainda não tem metas. Toque numa ideia acima ou em "Nova meta".</li>`;
        return;
    }
    if (visiveis.length === 0) {
        lista.innerHTML = `<li class="vazio">Nenhuma meta de ${filtroPrazo === "medio" ? "médio" : filtroPrazo} prazo.</li>`;
        return;
    }
    lista.innerHTML = visiveis.map((meta) => {
        const s = situacaoDaMeta(meta);
        const pct = Math.min(100, Math.round((meta.guardado / meta.valor) * 100));
        const concluida = s.falta === 0;
        return `
            <li class="meta ${concluida ? "meta-concluida" : ""}">
                <div class="meta-cabeca">
                    <span class="meta-icone" aria-hidden="true">${meta.icone}</span>
                    <div>
                        <h2 class="meta-nome">${escapar(meta.nome)}</h2>
                        <p class="meta-prazo-texto"><span class="meta-prazo">${prazoDaMeta(meta.meses)}</span> até ${dataFinalDaMeta(meta)}</p>
                    </div>
                    <div class="lancamento-acoes">
                        <button type="button" class="botao-icone" data-editar-meta="${meta.id}" aria-label="Editar meta ${escapar(meta.nome)}">✏️</button>
                        <button type="button" class="botao-icone botao-icone-perigo" data-apagar-meta="${meta.id}" aria-label="Apagar meta ${escapar(meta.nome)}">🗑</button>
                    </div>
                </div>
                <div class="meta-corpo">
                    <span class="anel" style="--p:${pct}" aria-hidden="true"><span>${pct}%</span></span>
                    <div>
                        <p class="meta-valores"><strong>${reais(meta.guardado)}</strong> de ${reais(meta.valor)}</p>
                        <p class="status-meta ${s.status.classe}">${s.status.texto}</p>
                        <p class="rotulo-invisivel">${pct}% da meta guardado.</p>
                    </div>
                </div>
                ${concluida ? `<p class="meta-parabens">Meta alcançada! Que tal criar a próxima?</p>` : `
                <ul class="meta-contas">
                    <li><span>Guardando na gaveta</span><strong>${reais(s.porMes)}/mês</strong></li>
                    <li><span>Investindo no CDB da simulação</span><strong>${reais(s.investindo)}/mês</strong></li>
                </ul>
                <p class="dica">Faltam ${reais(s.falta)} em ${s.restantes} ${s.restantes === 1 ? "mês" : "meses"}. Investindo, os juros fazem parte do trabalho por você.</p>`}
                <div class="meta-acoes">
                    ${concluida ? "" : `<button type="button" class="botao botao-destaque botao-pequeno" data-guardar="${meta.id}">Guardar dinheiro</button>`}
                    <button type="button" class="botao botao-contorno botao-pequeno" data-historico-meta="${meta.id}">Histórico (${meta.aportes.length})</button>
                </div>
            </li>`;
    }).join("");
}

/* =========================================================
   CRIAR, EDITAR, GUARDAR, APAGAR
   ========================================================= */

function abrirFormMeta(id, ideia) {
    const meta = id ? estado.metas.find((m) => m.id === id) : null;
    const base = meta || ideia || { nome: "", icone: "🎯", valor: "", meses: "" };
    abrirModal(meta ? "Editar meta" : "Nova meta", `
        <form id="form-meta" class="formulario" novalidate>
            <fieldset class="chips-categorias">
                <legend>Ícone</legend>
                <div class="chips-lista">
                    ${ICONES_META.map((icone, i) => `
                        <input type="radio" name="icone" id="icone-${i}" value="${icone}" ${icone === base.icone ? "checked" : ""}>
                        <label for="icone-${i}" class="chip-categoria chip-icone"><span aria-hidden="true">${icone}</span><span class="rotulo-invisivel">Ícone ${i + 1}</span></label>`).join("")}
                </div>
            </fieldset>
            <div class="campo">
                <label for="meta-nome">Qual é o sonho?</label>
                <input type="text" id="meta-nome" required maxlength="30" value="${escapar(base.nome)}" aria-describedby="erro-meta-nome">
                <p class="erro" id="erro-meta-nome" aria-live="polite"></p>
            </div>
            <div class="campos-lado">
                <div class="campo">
                    <label for="meta-valor">Valor (R$)</label>
                    <input type="number" id="meta-valor" required min="1" step="0.01" inputmode="decimal" value="${base.valor}" aria-describedby="erro-meta-valor">
                    <p class="erro" id="erro-meta-valor" aria-live="polite"></p>
                </div>
                <div class="campo">
                    <label for="meta-meses">Prazo (meses)</label>
                    <input type="number" id="meta-meses" required min="1" max="360" step="1" inputmode="numeric" value="${base.meses}" aria-describedby="erro-meta-meses">
                    <p class="erro" id="erro-meta-meses" aria-live="polite"></p>
                </div>
            </div>
            <p class="previa" id="meta-previa" aria-live="polite"></p>
            <button type="submit" class="botao botao-destaque botao-largo">${meta ? "Salvar alterações" : "Criar meta"}</button>
        </form>`);

    const previa = () => {
        const valor = Number($("#meta-valor").value);
        const meses = Number($("#meta-meses").value);
        const jaTem = meta ? meta.guardado : 0;
        $("#meta-previa").innerHTML = valor > 0 && meses > 0
            ? `${prazoDaMeta(meses)}: guarde <strong>${reais(Math.max(0, valor - jaTem) / meses)}/mês</strong>, ou ${reais(parcelaInvestindo(valor, jaTem, meses, TAXA_META))}/mês investindo.`
            : "";
    };
    $("#meta-valor").addEventListener("input", previa);
    $("#meta-meses").addEventListener("input", previa);
    previa();
    $("#meta-nome").focus();

    $("#form-meta").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const nome = $("#meta-nome");
        const valor = $("#meta-valor");
        const meses = $("#meta-meses");
        const nomeOk = mostrarErro(nome, nome.value.trim() ? "" : "Dê um nome para a sua meta.");
        const valorOk = mostrarErro(valor, Number(valor.value) > 0 ? "" : "Digite um valor maior que zero.");
        const mesesNum = Number(meses.value);
        const mesesOk = mostrarErro(meses, Number.isInteger(mesesNum) && mesesNum >= 1 && mesesNum <= 360 ? "" : "Use de 1 a 360 meses.");
        if (!(nomeOk && valorOk && mesesOk)) {
            $("#form-meta [aria-invalid='true']").focus();
            return;
        }
        const dados = {
            nome: nome.value.trim(),
            icone: $("#form-meta input[name='icone']:checked").value,
            valor: Math.round(Number(valor.value) * 100) / 100,
            meses: mesesNum
        };
        if (meta) {
            Object.assign(meta, dados);
            meta.guardado = Math.min(meta.guardado, meta.valor);
            avisar("Meta atualizada");
        } else {
            estado.metas.push({ id: novoId(), ...dados, guardado: 0, criadaEm: dataDeHoje(0), aportes: [] });
            avisar(`Meta criada: <strong>${escapar(dados.nome)}</strong>`);
            concluirMissao("criar-meta");
        }
        fecharModal();
        desenharTudo();
    });
}

function abrirGuardar(id) {
    const meta = estado.metas.find((m) => m.id === id);
    const s = situacaoDaMeta(meta);
    const sugestao = Math.min(s.falta, Math.ceil(s.porMes));
    abrirModal(`${meta.icone} Guardar para ${meta.nome}`, `
        <p>Faltam <strong>${reais(s.falta)}</strong>. O ideal é guardar ${reais(s.porMes)} por mês.</p>
        <form id="form-guardar" class="formulario" novalidate>
            <div class="campo campo-valor">
                <label for="guardar-valor">Quanto você guardou? (R$)</label>
                <input type="number" id="guardar-valor" min="0.01" step="0.01" inputmode="decimal" required aria-describedby="erro-guardar-valor">
                <p class="erro" id="erro-guardar-valor" aria-live="polite"></p>
            </div>
            <div class="chips-lista">
                ${[sugestao, 50, 100].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i).map((v) => `
                    <button type="button" class="chip-categoria" data-valor-rapido="${v}">${reais(v)}</button>`).join("")}
            </div>
            <button type="submit" class="botao botao-destaque botao-largo">Guardar</button>
        </form>`);

    $$("#form-guardar [data-valor-rapido]").forEach((botao) => {
        botao.addEventListener("click", () => {
            $("#guardar-valor").value = botao.dataset.valorRapido;
        });
    });

    $("#form-guardar").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const campo = $("#guardar-valor");
        const valor = Math.round(Number(campo.value) * 100) / 100;
        if (!mostrarErro(campo, valor > 0 ? "" : "Digite um valor maior que zero.")) {
            campo.focus();
            return;
        }
        const usado = Math.min(valor, meta.valor - meta.guardado);
        meta.guardado = Math.round((meta.guardado + usado) * 100) / 100;
        meta.aportes.push({ valor: usado, data: dataDeHoje(0) });
        if (meta.guardado >= meta.valor) {
            comemorarMeta(meta);
        } else {
            fecharModal();
            avisar(`${reais(usado)} guardados em ${escapar(meta.nome)}`);
        }
        desenharTudo();
    });
}

function comemorarMeta(meta) {
    ganharXp(100, "Meta alcançada");
    abrirModal("Meta alcançada!", `
        <div class="comemoracao">
            <p class="comemoracao-icone" aria-hidden="true">🏆</p>
            <p class="comemoracao-titulo">${meta.icone} ${escapar(meta.nome)}</p>
            <p>Você juntou <strong>${reais(meta.valor)}</strong>. Disciplina rende mais que sorte!</p>
            <p class="premio-valor">+100 XP</p>
        </div>
        <button type="button" class="botao botao-destaque botao-largo" id="fechar-comemoracao">Bora para a próxima</button>`);
    $("#fechar-comemoracao").addEventListener("click", fecharModal);
}

function abrirHistoricoMeta(id) {
    const meta = estado.metas.find((m) => m.id === id);
    const aportes = meta.aportes.slice().reverse();
    abrirModal(`Histórico de ${meta.nome}`, aportes.length === 0
        ? `<p class="vazio">Nenhum valor guardado ainda.</p>`
        : `<table class="tabela-resgate">
                <caption>Valores guardados</caption>
                <thead><tr><th scope="col">Data</th><th scope="col">Valor</th></tr></thead>
                <tbody>
                    ${aportes.map((a) => `<tr><td>${rotuloDoDia(a.data)}</td><td>${reais(a.valor)}</td></tr>`).join("")}
                    <tr><th scope="row">Total</th><td>${reais(meta.guardado)}</td></tr>
                </tbody>
            </table>`);
}

function apagarMeta(id) {
    const indice = estado.metas.findIndex((m) => m.id === id);
    const [removida] = estado.metas.splice(indice, 1);
    desenharTudo();
    avisarComAcao(`Meta “${escapar(removida.nome)}” apagada.`, "Desfazer", () => {
        estado.metas.splice(indice, 0, removida);
        desenharTudo();
        avisar("Meta recuperada");
    });
}

/* =========================================================
   EVENTOS
   ========================================================= */

function ligarEventosMetas() {
    $("#botao-nova-meta").addEventListener("click", () => abrirFormMeta());
    $$(".filtro-prazo").forEach((botao) => {
        botao.addEventListener("click", () => {
            filtroPrazo = botao.dataset.filtroPrazo;
            desenharMetas();
        });
    });
    $("#tela-metas").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button");
        if (!botao) {
            return;
        }
        const d = botao.dataset;
        if (d.ideia !== undefined) {
            abrirFormMeta(null, IDEIAS_DE_META[Number(d.ideia)]);
        } else if (d.guardar) {
            abrirGuardar(d.guardar);
        } else if (d.editarMeta) {
            abrirFormMeta(d.editarMeta);
        } else if (d.apagarMeta) {
            apagarMeta(d.apagarMeta);
        } else if (d.historicoMeta) {
            abrirHistoricoMeta(d.historicoMeta);
        }
    });
}
