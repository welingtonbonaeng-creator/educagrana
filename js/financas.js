// EducaGrana | Finanças (EAP 3: controle financeiro)
// Lançamentos com data, orçamento do mês, limites por categoria, gráfico, indicadores e regra 50-30-20.
// Usa o estado e as funções de apoio de app.js (carregado depois deste arquivo).

"use strict";

const CATEGORIAS_INFO = {
    despesa: [
        { nome: "Moradia", icone: "🏠", cor: "#012816", grupo: "necessidade" },
        { nome: "Alimentação", icone: "🛒", cor: "#8de113", grupo: "necessidade" },
        { nome: "Transporte", icone: "🚌", cor: "#fcc101", grupo: "necessidade" },
        { nome: "Saúde", icone: "💊", cor: "#c2417a", grupo: "necessidade" },
        { nome: "Educação", icone: "📚", cor: "#3b82c4", grupo: "necessidade" },
        { nome: "Lazer", icone: "🎉", cor: "#e8743b", grupo: "desejo" },
        { nome: "Outros", icone: "📦", cor: "#8a958c", grupo: "desejo" }
    ],
    receita: [
        { nome: "Salário", icone: "💼", cor: "#1b7a34" },
        { nome: "Renda extra", icone: "💸", cor: "#2e6b0a" },
        { nome: "Outros", icone: "➕", cor: "#45574b" }
    ]
};

const NOMES_MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

let mesFinancas = dataDeHoje(0).slice(0, 7);
let filtroLancamentos = "todos";

function infoCategoria(tipo, nome) {
    return CATEGORIAS_INFO[tipo].find((c) => c.nome === nome) || CATEGORIAS_INFO[tipo][CATEGORIAS_INFO[tipo].length - 1];
}

function nomeDoMes(chave) {
    const [ano, mes] = chave.split("-").map(Number);
    const nome = NOMES_MESES[mes - 1];
    return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}

function mudarMes(chave, passo) {
    const [ano, mes] = chave.split("-").map(Number);
    const data = new Date(ano, mes - 1 + passo, 1);
    return dataLocal(data).slice(0, 7);
}

function lancamentosDoMes(chave) {
    return estado.lancamentos.filter((l) => (l.data || dataDeHoje(0)).startsWith(chave || mesFinancas));
}

function totaisDoMes(chave) {
    let receitas = 0;
    let despesas = 0;
    const porCategoria = {};
    lancamentosDoMes(chave || dataDeHoje(0).slice(0, 7)).forEach((l) => {
        if (l.tipo === "receita") {
            receitas += l.valor;
        } else {
            despesas += l.valor;
            porCategoria[l.categoria] = (porCategoria[l.categoria] || 0) + l.valor;
        }
    });
    return { receitas, despesas, porCategoria };
}

function porcento(parte, todo) {
    return todo > 0 ? Math.round((parte / todo) * 100) : 0;
}

/* =========================================================
   DESENHO DA TELA
   ========================================================= */

function desenharFinancas() {
    const { receitas, despesas, porCategoria } = totaisDoMes(mesFinancas);
    const saldo = receitas - despesas;
    const ehMesAtual = mesFinancas === dataDeHoje(0).slice(0, 7);

    $("#fin-mes").textContent = nomeDoMes(mesFinancas);
    $("#fin-mes-proximo").disabled = ehMesAtual;
    $("#fin-receitas").textContent = reais(receitas);
    $("#fin-despesas").textContent = reais(despesas);
    const campoSaldo = $("#fin-saldo");
    campoSaldo.textContent = reais(saldo);
    campoSaldo.className = "mini-valor " + (saldo < 0 ? "negativo" : "positivo");

    desenharOrcamento(despesas, ehMesAtual);
    desenharAlertas(despesas, porCategoria);
    desenharGraficoGastos(despesas, porCategoria);
    desenharIndicadores(receitas, despesas, porCategoria);
    desenharRegra503020(receitas, despesas, porCategoria);
    desenharLimites(porCategoria);
    desenharLancamentos();
}

// EAP 3.2.1 e 3.2.4: limite mensal geral e saldo disponível no período
function desenharOrcamento(despesas, ehMesAtual) {
    const area = $("#fin-orcamento");
    if (!estado.orcamento) {
        area.innerHTML = `
            <h2 class="cartao-titulo">Orçamento do mês</h2>
            <p class="dica">Defina quanto pode gastar por mês. A gente avisa quando estiver chegando perto.</p>
            <button type="button" class="botao botao-destaque botao-largo" data-orcamento>Definir orçamento</button>`;
        return;
    }
    const uso = porcento(despesas, estado.orcamento);
    const sobra = estado.orcamento - despesas;
    let classeBarra = "barra";
    if (uso > 100) {
        classeBarra += " barra-estourada";
    } else if (uso >= 80) {
        classeBarra += " barra-alerta";
    }
    let restante = "";
    if (ehMesAtual) {
        const hoje = new Date();
        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
        const dias = ultimoDia - hoje.getDate() + 1;
        restante = ` · ${dias} ${dias === 1 ? "dia" : "dias"} para o mês acabar`;
    }
    area.innerHTML = `
        <div class="linha-entre">
            <h2 class="cartao-titulo">Orçamento do mês</h2>
            <button type="button" class="botao-link" data-orcamento aria-label="Editar orçamento do mês">Editar</button>
        </div>
        <p class="orcamento-valores"><strong>${reais(despesas)}</strong> de ${reais(estado.orcamento)}</p>
        <progress class="${classeBarra}" max="100" value="${Math.min(uso, 100)}" aria-label="Uso do orçamento do mês: ${uso}%"></progress>
        <p class="dica">${sobra >= 0 ? `Sobram <strong>${reais(sobra)}</strong>` : `Passou <strong class="negativo">${reais(-sobra)}</strong> do orçamento`}${restante}</p>`;
}

// EAP 3.2.5: alertas de aproximação ou estouro
function desenharAlertas(despesas, porCategoria) {
    const alertas = [];
    if (estado.orcamento) {
        if (despesas > estado.orcamento) {
            alertas.push(`<p class="alerta alerta-perigo">🚨 Você passou do orçamento do mês em ${reais(despesas - estado.orcamento)}.</p>`);
        } else if (despesas >= estado.orcamento * 0.8) {
            alertas.push(`<p class="alerta">⚠️ Você já usou ${porcento(despesas, estado.orcamento)}% do orçamento do mês.</p>`);
        }
    }
    Object.entries(estado.limites).forEach(([categoria, limite]) => {
        const gasto = porCategoria[categoria] || 0;
        if (gasto > limite) {
            alertas.push(`<p class="alerta alerta-perigo">🚨 Você passou do limite de <strong>${escapar(categoria)}</strong> em ${reais(gasto - limite)}.</p>`);
        } else if (gasto >= limite * 0.8) {
            alertas.push(`<p class="alerta">⚠️ Atenção: você já usou ${porcento(gasto, limite)}% do limite de <strong>${escapar(categoria)}</strong>.</p>`);
        }
    });
    $("#fin-alertas").innerHTML = alertas.join("");
}

// EAP 3.3.2: gráfico de gastos por categoria (rosca)
function desenharGraficoGastos(despesas, porCategoria) {
    const area = $("#fin-grafico");
    const fatias = CATEGORIAS_INFO.despesa
        .map((c) => ({ ...c, valor: porCategoria[c.nome] || 0 }))
        .filter((c) => c.valor > 0)
        .sort((a, b) => b.valor - a.valor);
    if (fatias.length === 0) {
        area.innerHTML = `<p class="vazio">Nenhum gasto em ${escapar(nomeDoMes(mesFinancas).toLowerCase())}. Toque no botão + para registrar.</p>`;
        return;
    }
    let acumulado = 0;
    const gradiente = fatias.map((f) => {
        const inicio = acumulado;
        acumulado += (f.valor / despesas) * 100;
        return `${f.cor} ${inicio.toFixed(2)}% ${acumulado.toFixed(2)}%`;
    }).join(", ");
    const resumo = fatias.map((f) => `${f.nome} ${porcento(f.valor, despesas)}%`).join(", ");
    area.innerHTML = `
        <div class="rosca" style="background: conic-gradient(${gradiente})" role="img" aria-label="Gráfico de gastos: ${escapar(resumo)}">
            <span class="rosca-centro"><span class="rosca-rotulo">Gastos</span><strong>${reais(despesas)}</strong></span>
        </div>
        <ul class="legenda">
            ${fatias.map((f) => `
                <li>
                    <span class="legenda-cor" style="background-color:${f.cor}" aria-hidden="true"></span>
                    <span class="legenda-nome"><span aria-hidden="true">${f.icone}</span> ${escapar(f.nome)}</span>
                    <span class="legenda-valor">${porcento(f.valor, despesas)}%</span>
                </li>`).join("")}
        </ul>`;
}

// EAP 3.3.1: indicadores
function desenharIndicadores(receitas, despesas, porCategoria) {
    const maior = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
    const comprometida = receitas > 0 ? `${porcento(despesas, receitas)}%` : "–";
    const poupanca = receitas > 0 ? `${porcento(Math.max(0, receitas - despesas), receitas)}%` : "–";
    const maiorTexto = maior ? `${infoCategoria("despesa", maior[0]).icone} ${escapar(maior[0])}` : "–";
    $("#fin-indicadores").innerHTML = `
        <div class="indicador"><p class="indicador-valor">${comprometida}</p><p class="indicador-nome">da renda já gasta</p></div>
        <div class="indicador"><p class="indicador-valor">${poupanca}</p><p class="indicador-nome">da renda sobrando</p></div>
        <div class="indicador"><p class="indicador-valor indicador-texto">${maiorTexto}</p><p class="indicador-nome">maior gasto</p></div>`;
}

// Insight educativo: regra 50-30-20 (necessidades, desejos, guardar)
function desenharRegra503020(receitas, despesas, porCategoria) {
    const fala = $("#fin-brotinho");
    if (receitas <= 0) {
        fala.textContent = "Registre sua renda do mês para eu analisar seus gastos pela regra 50-30-20.";
        return;
    }
    let necessidades = 0;
    let desejos = 0;
    Object.entries(porCategoria).forEach(([nome, valor]) => {
        if (infoCategoria("despesa", nome).grupo === "necessidade") {
            necessidades += valor;
        } else {
            desejos += valor;
        }
    });
    const pn = porcento(necessidades, receitas);
    const pd = porcento(desejos, receitas);
    const pg = porcento(receitas - despesas, receitas);
    let conselho;
    if (pn > 50) {
        conselho = `Necessidades estão em ${pn}% da renda. A regra sugere até 50%: vale revisar moradia, mercado e transporte.`;
    } else if (pd > 30) {
        conselho = `Desejos (lazer e outros) estão em ${pd}% da renda. A regra sugere até 30%.`;
    } else if (pg < 20) {
        conselho = `Você está guardando ${Math.max(0, pg)}% da renda. A regra sugere pelo menos 20% para o futuro.`;
    } else {
        conselho = `Mandou bem! ${pn}% em necessidades, ${pd}% em desejos e ${pg}% sobrando para guardar.`;
    }
    fala.textContent = `Regra 50-30-20: ${conselho}`;
}

// EAP 3.2.2 e 3.2.3: limites por categoria, planejado x realizado
function desenharLimites(porCategoria) {
    const usadas = CATEGORIAS_INFO.despesa.filter((c) => porCategoria[c.nome] || estado.limites[c.nome]);
    const lista = $("#lista-categorias");
    if (usadas.length === 0) {
        lista.innerHTML = `<li class="vazio">Quando você registrar gastos, as categorias aparecem aqui.</li>`;
        return;
    }
    lista.innerHTML = usadas.map((c) => {
        const gasto = porCategoria[c.nome] || 0;
        const limite = estado.limites[c.nome];
        const uso = limite ? porcento(gasto, limite) : 0;
        let classeBarra = "barra";
        if (limite && gasto > limite) {
            classeBarra += " barra-estourada";
        } else if (uso >= 80) {
            classeBarra += " barra-alerta";
        }
        return `
            <li class="categoria">
                <div class="linha-entre">
                    <p class="categoria-nome"><span class="categoria-icone" style="--cor:${c.cor}" aria-hidden="true">${c.icone}</span> ${escapar(c.nome)}</p>
                    <button type="button" class="botao botao-contorno botao-pequeno" data-limite="${escapar(c.nome)}"
                        aria-label="${limite ? "Editar" : "Definir"} limite de ${escapar(c.nome)}">${limite ? "Editar" : "Limite"}</button>
                </div>
                ${limite ? `<progress class="${classeBarra}" max="100" value="${Math.min(uso, 100)}" aria-label="Uso do limite de ${escapar(c.nome)}: ${uso}%"></progress>` : ""}
                <p class="dica">${reais(gasto)} ${limite ? `de ${reais(limite)} (${uso}%)` : "· sem limite definido"}</p>
            </li>`;
    }).join("");
}

function rotuloDoDia(data) {
    if (data === dataDeHoje(0)) {
        return "Hoje";
    }
    if (data === dataDeHoje(-1)) {
        return "Ontem";
    }
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function desenharLancamentos() {
    $$(".filtro-lanc").forEach((botao) => {
        botao.setAttribute("aria-pressed", String(botao.dataset.filtroLanc === filtroLancamentos));
    });
    const lista = $("#lista-lancamentos");
    const doMes = lancamentosDoMes(mesFinancas)
        .filter((l) => filtroLancamentos === "todos" || l.tipo === filtroLancamentos)
        .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
    if (doMes.length === 0) {
        lista.innerHTML = `<li class="vazio">Nenhum lançamento por aqui. Toque no botão + para começar.</li>`;
        return;
    }
    const grupos = {};
    doMes.forEach((l) => {
        const dia = l.data || dataDeHoje(0);
        (grupos[dia] = grupos[dia] || []).push(l);
    });
    lista.innerHTML = Object.entries(grupos).map(([dia, itens]) => `
        <li class="dia-grupo">
            <h3 class="dia-titulo">${rotuloDoDia(dia)}</h3>
            <ul class="lancamentos">
                ${itens.map((l) => {
                    const info = infoCategoria(l.tipo, l.categoria);
                    return `
                        <li class="lancamento">
                            <span class="categoria-icone" style="--cor:${info.cor}" aria-hidden="true">${info.icone}</span>
                            <div>
                                <p class="lancamento-desc">${escapar(l.descricao)}</p>
                                <p class="lancamento-cat">${escapar(l.categoria)}</p>
                            </div>
                            <p class="lancamento-valor ${l.tipo === "receita" ? "positivo" : "negativo"}">${l.tipo === "receita" ? "+" : "−"} ${reais(l.valor)}</p>
                            <div class="lancamento-acoes">
                                <button type="button" class="botao-icone" data-editar-lancamento="${l.id}" aria-label="Editar ${escapar(l.descricao)}">✏️</button>
                                <button type="button" class="botao-icone botao-icone-perigo" data-apagar-lancamento="${l.id}" aria-label="Apagar ${escapar(l.descricao)}">🗑</button>
                            </div>
                        </li>`;
                }).join("")}
            </ul>
        </li>`).join("");
}

/* =========================================================
   LANÇAR, EDITAR E APAGAR
   ========================================================= */

function chipsCategorias(tipo, selecionada) {
    return CATEGORIAS_INFO[tipo].map((c, i) => `
        <input type="radio" name="categoria" id="cat-${i}" value="${escapar(c.nome)}" ${c.nome === selecionada || (!selecionada && i === 0) ? "checked" : ""}>
        <label for="cat-${i}" class="chip-categoria"><span aria-hidden="true">${c.icone}</span> ${escapar(c.nome)}</label>`).join("");
}

function abrirLancamento(id) {
    const existente = id ? estado.lancamentos.find((l) => l.id === id) : null;
    const tipo = existente ? existente.tipo : "despesa";
    abrirModal(existente ? "Editar lançamento" : "Novo lançamento", `
        <form id="form-lancamento" class="formulario" novalidate>
            <fieldset class="alternador">
                <legend>Tipo</legend>
                <input type="radio" id="tipo-despesa" name="tipo" value="despesa" ${tipo === "despesa" ? "checked" : ""}>
                <label for="tipo-despesa">Despesa</label>
                <input type="radio" id="tipo-receita" name="tipo" value="receita" ${tipo === "receita" ? "checked" : ""}>
                <label for="tipo-receita">Receita</label>
            </fieldset>
            <div class="campo campo-valor">
                <label for="lanc-valor">Valor (R$)</label>
                <input type="number" id="lanc-valor" name="valor" required min="0.01" step="0.01" inputmode="decimal"
                    value="${existente ? existente.valor : ""}" aria-describedby="erro-lanc-valor">
                <p class="erro" id="erro-lanc-valor" aria-live="polite"></p>
            </div>
            <fieldset class="chips-categorias">
                <legend>Categoria</legend>
                <div class="chips-lista" id="lanc-categorias">${chipsCategorias(tipo, existente && existente.categoria)}</div>
            </fieldset>
            <div class="campos-lado">
                <div class="campo">
                    <label for="lanc-descricao">Descrição <span class="opcional">(opcional)</span></label>
                    <input type="text" id="lanc-descricao" name="descricao" maxlength="40" value="${existente ? escapar(existente.descricao) : ""}">
                </div>
                <div class="campo">
                    <label for="lanc-data">Data</label>
                    <input type="date" id="lanc-data" name="data" required value="${existente ? existente.data : dataDeHoje(0)}" aria-describedby="erro-lanc-data">
                    <p class="erro" id="erro-lanc-data" aria-live="polite"></p>
                </div>
            </div>
            <button type="submit" class="botao botao-destaque botao-largo">${existente ? "Salvar alterações" : "Adicionar"}</button>
        </form>`);

    $("#lanc-valor").focus();
    $$("#form-lancamento input[name='tipo']").forEach((radio) => {
        radio.addEventListener("change", () => {
            $("#lanc-categorias").innerHTML = chipsCategorias(radio.value);
        });
    });

    $("#form-lancamento").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const campoValor = $("#lanc-valor");
        const campoData = $("#lanc-data");
        const valor = Math.round(Number(campoValor.value) * 100) / 100;
        const valorOk = mostrarErro(campoValor, valor > 0 ? "" : "Digite um valor maior que zero.");
        const dataOk = mostrarErro(campoData, /^\d{4}-\d{2}-\d{2}$/.test(campoData.value) ? "" : "Escolha uma data.");
        if (!(valorOk && dataOk)) {
            $("#form-lancamento [aria-invalid='true']").focus();
            return;
        }
        const tipoEscolhido = $("#form-lancamento input[name='tipo']:checked").value;
        const categoria = $("#form-lancamento input[name='categoria']:checked").value;
        const dados = {
            tipo: tipoEscolhido,
            valor,
            categoria,
            descricao: $("#lanc-descricao").value.trim() || categoria,
            data: campoData.value
        };
        if (existente) {
            Object.assign(existente, dados);
            avisar("Lançamento atualizado");
        } else {
            estado.lancamentos.push({ id: novoId(), ...dados });
            avisar(`${tipoEscolhido === "receita" ? "Receita" : "Despesa"} registrada: ${reais(valor)}`);
            if (estado.lancamentos.length >= 3) {
                concluirMissao("tres-lancamentos");
            }
        }
        mesFinancas = dados.data.slice(0, 7);
        fecharModal();
        desenharTudo();
    });
}

function apagarLancamento(id) {
    const indice = estado.lancamentos.findIndex((l) => l.id === id);
    const [removido] = estado.lancamentos.splice(indice, 1);
    desenharTudo();
    avisarComAcao(`“${escapar(removido.descricao)}” apagado.`, "Desfazer", () => {
        estado.lancamentos.splice(indice, 0, removido);
        desenharTudo();
        avisar("Lançamento recuperado");
    });
}

/* =========================================================
   ORÇAMENTO E LIMITES
   ========================================================= */

function abrirOrcamento() {
    const atual = estado.orcamento || "";
    abrirModal("Orçamento do mês", `
        <p>Quanto você pode gastar, no total, por mês? Somamos todas as despesas e avisamos quando passar de 80%.</p>
        <form id="form-orcamento" class="formulario" novalidate>
            <div class="campo">
                <label for="orcamento-valor">Orçamento mensal (R$)</label>
                <input type="number" id="orcamento-valor" min="1" step="0.01" inputmode="decimal" value="${atual}" required aria-describedby="erro-orcamento-valor">
                <p class="erro" id="erro-orcamento-valor" aria-live="polite"></p>
            </div>
            <button type="submit" class="botao botao-destaque botao-largo">Salvar orçamento</button>
            ${atual ? `<button type="button" class="botao botao-perigo botao-largo" id="remover-orcamento">Remover orçamento</button>` : ""}
        </form>`);
    $("#form-orcamento").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const campo = $("#orcamento-valor");
        const valor = Number(campo.value);
        if (!mostrarErro(campo, valor > 0 ? "" : "Digite um valor maior que zero.")) {
            campo.focus();
            return;
        }
        estado.orcamento = Math.round(valor * 100) / 100;
        fecharModal();
        avisar(`Orçamento do mês: ${reais(valor)}`);
        concluirMissao("definir-limite");
        desenharTudo();
    });
    const remover = $("#remover-orcamento");
    if (remover) {
        remover.addEventListener("click", () => {
            estado.orcamento = null;
            fecharModal();
            desenharTudo();
        });
    }
}

function abrirLimite(categoria) {
    const escolherCategoria = !categoria;
    const atual = categoria ? estado.limites[categoria] || "" : "";
    abrirModal(categoria ? "Limite de " + categoria : "Novo limite", `
        <p>Quanto você quer gastar, no máximo, ${categoria ? `com <strong>${escapar(categoria)}</strong>` : "nessa categoria"} por mês? Vamos te avisar quando chegar perto.</p>
        <form id="form-limite" class="formulario" novalidate>
            ${escolherCategoria ? `
                <div class="campo">
                    <label for="limite-categoria">Categoria</label>
                    <select id="limite-categoria">
                        ${CATEGORIAS_INFO.despesa.map((c) => `<option value="${escapar(c.nome)}">${c.icone} ${escapar(c.nome)}</option>`).join("")}
                    </select>
                </div>` : ""}
            <div class="campo">
                <label for="limite-valor">Limite mensal (R$)</label>
                <input type="number" id="limite-valor" min="1" step="0.01" inputmode="decimal" value="${atual}" required aria-describedby="erro-limite-valor">
                <p class="erro" id="erro-limite-valor" aria-live="polite"></p>
            </div>
            <button type="submit" class="botao botao-destaque botao-largo">Salvar limite</button>
            ${atual ? `<button type="button" class="botao botao-perigo botao-largo" id="remover-limite">Remover limite</button>` : ""}
        </form>`);

    $("#form-limite").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const campo = $("#limite-valor");
        const valor = Number(campo.value);
        if (!mostrarErro(campo, valor > 0 ? "" : "Digite um valor maior que zero.")) {
            campo.focus();
            return;
        }
        const nome = categoria || $("#limite-categoria").value;
        estado.limites[nome] = Math.round(valor * 100) / 100;
        fecharModal();
        avisar(`Limite de ${escapar(nome)}: ${reais(valor)} por mês`);
        concluirMissao("definir-limite");
        desenharTudo();
    });

    const remover = $("#remover-limite");
    if (remover) {
        remover.addEventListener("click", () => {
            delete estado.limites[categoria];
            fecharModal();
            desenharTudo();
        });
    }
}

/* =========================================================
   EVENTOS
   ========================================================= */

function ligarEventosFinancas() {
    $("#fin-mes-anterior").addEventListener("click", () => {
        mesFinancas = mudarMes(mesFinancas, -1);
        desenharFinancas();
    });
    $("#fin-mes-proximo").addEventListener("click", () => {
        mesFinancas = mudarMes(mesFinancas, 1);
        desenharFinancas();
    });
    $("#botao-novo-lancamento").addEventListener("click", () => abrirLancamento());
    $("#botao-novo-limite").addEventListener("click", () => abrirLimite());
    $$(".filtro-lanc").forEach((botao) => {
        botao.addEventListener("click", () => {
            filtroLancamentos = botao.dataset.filtroLanc;
            desenharLancamentos();
        });
    });
    $("#tela-financas").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button");
        if (!botao) {
            return;
        }
        if (botao.dataset.orcamento !== undefined) {
            abrirOrcamento();
        } else if (botao.dataset.editarLancamento) {
            abrirLancamento(botao.dataset.editarLancamento);
        } else if (botao.dataset.apagarLancamento) {
            apagarLancamento(botao.dataset.apagarLancamento);
        }
    });
}
