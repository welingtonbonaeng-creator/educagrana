// EducaGrana | Simulação de investimentos (EAP 6)
// 6.1 moeda virtual, 6.2 produtos simulados, 6.3 operações, 6.4 desempenho, 6.5 lógica do imposto.
// Usa o estado e as funções de apoio de app.js.

"use strict";

const NIVEL_RISCO = { baixo: 1, medio: 2, alto: 3 };
const CORES_RISCO = { baixo: "#8de113", medio: "#fcc101", alto: "#e8743b" };

// Quais riscos combinam com cada perfil do quiz
const RISCOS_DO_PERFIL = {
    conservador: ["baixo"],
    moderado: ["baixo", "medio"],
    arrojado: ["baixo", "medio", "alto"]
};

// Quanto de risco alto cada perfil costuma tolerar na carteira (referência educativa simplificada)
const LIMITE_ALTO_RISCO = { conservador: 10, moderado: 30, arrojado: 100 };

let filtroRisco = "todos";

function combinaComPerfil(produto) {
    return (RISCOS_DO_PERFIL[estado.perfil] || RISCOS_DO_PERFIL.moderado).includes(produto.risco);
}

function medidorRisco(risco) {
    const nivel = NIVEL_RISCO[risco];
    return `<span class="medidor-risco medidor-${risco}" aria-hidden="true">${[1, 2, 3].map((n) => `<span class="${n <= nivel ? "cheio" : ""}"></span>`).join("")}</span>`;
}

function miniGrafico(valores) {
    if (!valores || valores.length < 2) {
        return "";
    }
    const menor = Math.min(...valores);
    const maior = Math.max(...valores);
    const faixa = maior - menor || 1;
    const pontos = valores.map((v, i) => `${((i / (valores.length - 1)) * 100).toFixed(1)},${(22 - ((v - menor) / faixa) * 20).toFixed(1)}`).join(" ");
    const subiu = valores[valores.length - 1] >= valores[0];
    return `<svg class="mini-grafico ${subiu ? "mini-alta" : "mini-baixa"}" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline points="${pontos}"/></svg>`;
}

/* =========================================================
   DESENHO DA TELA
   ========================================================= */

function desenharInvestir() {
    const investido = valorInvestido();
    const aplicado = estado.carteira.reduce((s, p) => s + p.aplicado, 0);
    const lucro = investido - aplicado;
    const rent = aplicado > 0 ? (lucro / aplicado) * 100 : 0;

    $("#inv-disponivel").textContent = granas(estado.granas);
    $("#inv-investido").textContent = granas(investido);
    $("#inv-mes").textContent = estado.mes;
    const campoRent = $("#inv-rentabilidade");
    campoRent.textContent = aplicado > 0
        ? `${lucro >= 0 ? "▲" : "▼"} ${granas(Math.abs(lucro))} (${Math.abs(rent).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)`
        : "Sem investimentos ainda";
    campoRent.className = "variacao " + (aplicado === 0 ? "" : lucro >= 0 ? "variacao-alta" : "variacao-baixa");

    const noticia = $("#inv-noticia");
    noticia.hidden = !estado.noticia;
    if (estado.noticia) {
        noticia.innerHTML = `
            <h2 class="noticia-titulo">📰 Mercado no mês ${estado.noticia.mes} <span class="noticia-selo">notícia fictícia</span></h2>
            <ul class="noticia-lista">${estado.noticia.itens.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    }

    desenharComposicao(investido);
    desenharCarteira();
    desenharProdutos();
}

function desenharComposicao(investido) {
    const area = $("#inv-composicao");
    if (investido <= 0) {
        area.innerHTML = `<p class="vazio">Quando você investir, mostro aqui como a carteira está dividida por risco.</p>`;
        $("#inv-brotinho").textContent = `Seu perfil é ${(PERFIS[estado.perfil] || PERFIS.moderado).nome.replace("Investidor ", "").toLowerCase()}. Procure o selo "combina com você" nos produtos abaixo.`;
        return;
    }
    const porRisco = { baixo: 0, medio: 0, alto: 0 };
    estado.carteira.forEach((posicao) => {
        const produto = PRODUTOS.find((p) => p.id === posicao.produtoId);
        porRisco[produto.risco] += posicao.valorAtual;
    });
    let acumulado = 0;
    const fatias = Object.entries(porRisco).filter(([, v]) => v > 0);
    const gradiente = fatias.map(([risco, valor]) => {
        const inicio = acumulado;
        acumulado += (valor / investido) * 100;
        return `${CORES_RISCO[risco]} ${inicio.toFixed(2)}% ${acumulado.toFixed(2)}%`;
    }).join(", ");
    const pct = (risco) => Math.round((porRisco[risco] / investido) * 100);
    area.innerHTML = `
        <div class="rosca rosca-pequena" style="background: conic-gradient(${gradiente})" role="img"
            aria-label="Carteira por risco: baixo ${pct("baixo")}%, médio ${pct("medio")}%, alto ${pct("alto")}%">
            <span class="rosca-centro"><span class="rosca-rotulo">${new Set(estado.carteira.map((p) => p.produtoId)).size}</span><strong>produtos</strong></span>
        </div>
        <ul class="legenda">
            ${["baixo", "medio", "alto"].map((risco) => `
                <li>
                    <span class="legenda-cor" style="background-color:${CORES_RISCO[risco]}" aria-hidden="true"></span>
                    <span class="legenda-nome">${NOMES_RISCO[risco]}</span>
                    <span class="legenda-valor">${pct(risco)}%</span>
                </li>`).join("")}
        </ul>`;

    const perfil = estado.perfil || "moderado";
    const alto = pct("alto");
    const diferentes = new Set(estado.carteira.map((p) => p.produtoId)).size;
    let fala;
    if (alto > LIMITE_ALTO_RISCO[perfil]) {
        fala = `Atenção: ${alto}% da carteira está em risco alto, mais do que costuma combinar com o perfil ${perfil}. Diversificar protege!`;
    } else if (diferentes < 3) {
        fala = `Você tem ${diferentes} ${diferentes === 1 ? "produto" : "produtos"}. Espalhar por 3 ou mais reduz o susto se um deles cair.`;
    } else {
        fala = `Carteira equilibrada para o perfil ${perfil}: ${diferentes} produtos e ${alto}% em risco alto. Mandou bem!`;
    }
    $("#inv-brotinho").textContent = fala;
}

function desenharCarteira() {
    const carteira = $("#lista-carteira");
    if (estado.carteira.length === 0) {
        carteira.innerHTML = `<li class="vazio">Sua carteira está vazia. Escolha um produto abaixo e faça seu primeiro investimento.</li>`;
        return;
    }
    carteira.innerHTML = estado.carteira.map((posicao) => {
        const produto = PRODUTOS.find((p) => p.id === posicao.produtoId);
        const lucro = posicao.valorAtual - posicao.aplicado;
        const rent = (lucro / posicao.aplicado) * 100;
        return `
            <li class="posicao">
                <div class="linha-entre">
                    <p class="produto-nome">${escapar(produto.nome)}</p>
                    ${medidorRisco(produto.risco)}
                </div>
                <div class="posicao-valores">
                    <p class="posicao-atual">${granas(posicao.valorAtual)}</p>
                    <p class="${lucro >= 0 ? "positivo" : "negativo"}"><strong>${lucro >= 0 ? "+" : "−"}${granas(Math.abs(lucro))} (${Math.abs(rent).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)</strong></p>
                </div>
                ${miniGrafico(posicao.historico)}
                <p class="produto-info">Aplicado ${granas(posicao.aplicado)} no mês ${posicao.mesCompra} · ${NOMES_RISCO[produto.risco]}</p>
                <button type="button" class="botao botao-contorno botao-pequeno" data-resgatar="${posicao.id}">Resgatar</button>
            </li>`;
    }).join("");
}

function desenharProdutos() {
    const produtos = PRODUTOS.filter((p) => filtroRisco === "todos" || p.risco === filtroRisco);
    $("#lista-produtos").innerHTML = produtos.map((produto) => {
        const doze = 1000 * Math.pow(1 + produto.taxa, 12);
        return `
            <li class="produto ${combinaComPerfil(produto) ? "produto-combina" : ""}">
                <div class="linha-entre">
                    <p class="produto-nome">${escapar(produto.nome)}</p>
                    ${medidorRisco(produto.risco)}
                </div>
                <div class="etiquetas">
                    <span class="etiqueta">${escapar(produto.tipo)}</span>
                    <span class="etiqueta risco-${produto.risco}">${NOMES_RISCO[produto.risco]}</span>
                    ${combinaComPerfil(produto) ? `<span class="etiqueta etiqueta-perfil">✓ combina com você</span>` : ""}
                </div>
                <p class="produto-info">${escapar(produto.info)}</p>
                <p class="produto-simulacao">${produto.variacao
                    ? `≈ ${(produto.taxa * 100).toLocaleString("pt-BR")}% ao mês, podendo variar até ${(produto.variacao * 100).toLocaleString("pt-BR")}% para cima ou para baixo`
                    : `G$ 1.000 viram ≈ <strong>${granas(doze)}</strong> em 12 meses (antes do imposto)`}</p>
                <button type="button" class="botao botao-destaque botao-pequeno" data-investir="${produto.id}">Investir</button>
            </li>`;
    }).join("");

    $$(".filtro-risco").forEach((botao) => {
        botao.setAttribute("aria-pressed", botao.dataset.filtro === filtroRisco ? "true" : "false");
    });
}

/* =========================================================
   OPERAÇÕES
   ========================================================= */

function abrirInvestir(produtoId) {
    const produto = PRODUTOS.find((p) => p.id === produtoId);
    const estimativa = 1000 * Math.pow(1 + produto.taxa, 12);
    abrirModal(produto.nome, `
        <div class="etiquetas">
            <span class="etiqueta">${escapar(produto.tipo)}</span>
            <span class="etiqueta risco-${produto.risco}">${NOMES_RISCO[produto.risco]}</span>
            ${combinaComPerfil(produto) ? `<span class="etiqueta etiqueta-perfil">✓ combina com você</span>` : ""}
        </div>
        <p>${escapar(produto.info)}</p>
        ${combinaComPerfil(produto) ? "" : `<p class="alerta">⚠️ Este produto tem mais risco do que o seu perfil costuma aceitar. Tudo bem testar aqui, o dinheiro é virtual!</p>`}
        <p class="dica">${produto.variacao
            ? "Este produto oscila: em alguns meses rende mais, em outros pode cair."
            : `Exemplo: G$ 1.000 aqui viram cerca de ${granas(estimativa)} em 12 meses, antes do imposto.`}</p>
        <form id="form-investir" class="formulario" novalidate>
            <div class="campo campo-valor">
                <label for="investir-valor">Quanto investir? (disponível: ${granas(estado.granas)})</label>
                <input type="number" id="investir-valor" min="1" step="0.01" inputmode="decimal" required aria-describedby="erro-investir-valor">
                <p class="erro" id="erro-investir-valor" aria-live="polite"></p>
            </div>
            <div class="chips-lista">
                <button type="button" class="chip-categoria" data-preencher="0.1">10%</button>
                <button type="button" class="chip-categoria" data-preencher="0.25">25%</button>
                <button type="button" class="chip-categoria" data-preencher="0.5">50%</button>
            </div>
            <button type="submit" class="botao botao-destaque botao-largo">Confirmar investimento</button>
        </form>`);

    $$("#form-investir [data-preencher]").forEach((botao) => {
        botao.addEventListener("click", () => {
            $("#investir-valor").value = Math.floor(estado.granas * Number(botao.dataset.preencher));
        });
    });

    $("#form-investir").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const campo = $("#investir-valor");
        const valor = Math.round(Number(campo.value) * 100) / 100;
        let erro = "";
        if (!(valor > 0)) {
            erro = "Digite um valor maior que zero.";
        } else if (valor > estado.granas) {
            erro = `Você só tem ${granas(estado.granas)} disponíveis.`;
        }
        if (!mostrarErro(campo, erro)) {
            campo.focus();
            return;
        }
        estado.granas = Math.round((estado.granas - valor) * 100) / 100;
        estado.carteira.push({ id: novoId(), produtoId, aplicado: valor, valorAtual: valor, mesCompra: estado.mes, historico: [valor] });
        fecharModal();
        avisar(`Investimento feito: ${granas(valor)} em ${escapar(produto.nome)}`);
        concluirMissao("primeiro-investimento");
        if (new Set(estado.carteira.map((p) => p.produtoId)).size >= 3) {
            concluirMissao("diversificar");
        }
        desenharTudo();
    });
}

// Um mês de mercado: cada produto rende a taxa dele mais um sorteio dentro da variação
function simularUmMes() {
    const movimentos = {};
    estado.carteira.forEach((posicao) => {
        const produto = PRODUTOS.find((p) => p.id === posicao.produtoId);
        if (movimentos[produto.id] === undefined) {
            movimentos[produto.id] = produto.taxa + (Math.random() * 2 - 1) * produto.variacao;
        }
        posicao.valorAtual = Math.max(0, Math.round(posicao.valorAtual * (1 + movimentos[produto.id]) * 100) / 100);
        posicao.historico = (posicao.historico || [posicao.aplicado]).concat(posicao.valorAtual).slice(-24);
    });
    estado.mes++;
    estado.historico.push(Math.round((estado.granas + valorInvestido()) * 100) / 100);
    return movimentos;
}

function montarNoticia(movimentos) {
    const itens = Object.entries(movimentos).map(([id, mov]) => {
        const produto = PRODUTOS.find((p) => p.id === id);
        const pct = (Math.abs(mov) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
        if (!produto.variacao) {
            return `<strong>${escapar(produto.nome)}</strong> rendeu ${pct}%, como combinado. Renda fixa é assim: sem sustos.`;
        }
        if (mov >= 0.03) {
            return `<strong>${escapar(produto.nome)}</strong> subiu ${pct}% com notícias boas do setor. 📈`;
        }
        if (mov <= -0.03) {
            return `<strong>${escapar(produto.nome)}</strong> caiu ${pct}% num mês de pessimismo. Calma: oscilar faz parte. 📉`;
        }
        return `<strong>${escapar(produto.nome)}</strong> andou de lado: ${mov >= 0 ? "+" : "−"}${pct}%.`;
    });
    return { mes: estado.mes, itens };
}

function avancarMeses(quantidade) {
    if (estado.carteira.length === 0) {
        avisar("Invista em algum produto antes de avançar o tempo.");
        return;
    }
    const antes = valorInvestido();
    let movimentos = {};
    for (let i = 0; i < quantidade; i++) {
        movimentos = simularUmMes();
    }
    estado.noticia = montarNoticia(movimentos);
    const diferenca = valorInvestido() - antes;
    avisar(`${quantidade === 1 ? `Mês ${estado.mes}` : `+${quantidade} meses`}: sua carteira ${diferenca >= 0 ? "rendeu" : "caiu"} <strong>${granas(Math.abs(diferenca))}</strong>`);
    concluirMissao("avancar-mes");
    desenharTudo();
}

// Regras simplificadas de IR para fins educativos.
function aliquotaImposto(produto, mesesAplicado) {
    if (produto.imposto === "isento") {
        return { taxa: 0, regra: "LCI é isenta de IR para pessoa física." };
    }
    if (produto.imposto === "fii") {
        return { taxa: 0.2, regra: "Lucro na venda de cotas de FII paga 20%." };
    }
    if (produto.imposto === "renda-variavel") {
        return { taxa: 0.15, regra: "Lucro em renda variável paga 15% (regra simplificada)." };
    }
    // Tabela regressiva da renda fixa: 1 mês da simulação = 30 dias
    const dias = mesesAplicado * 30;
    if (dias <= 180) {
        return { taxa: 0.225, regra: "Até 180 dias: 22,5% sobre o lucro." };
    }
    if (dias <= 360) {
        return { taxa: 0.2, regra: "De 181 a 360 dias: 20% sobre o lucro." };
    }
    if (dias <= 720) {
        return { taxa: 0.175, regra: "De 361 a 720 dias: 17,5% sobre o lucro." };
    }
    return { taxa: 0.15, regra: "Acima de 720 dias: 15% sobre o lucro." };
}

function abrirResgate(posicaoId) {
    const posicao = estado.carteira.find((p) => p.id === posicaoId);
    const produto = PRODUTOS.find((p) => p.id === posicao.produtoId);
    const mesesAplicado = estado.mes - posicao.mesCompra;
    const lucro = posicao.valorAtual - posicao.aplicado;
    const { taxa, regra } = aliquotaImposto(produto, mesesAplicado);
    const imposto = lucro > 0 ? Math.round(lucro * taxa * 100) / 100 : 0;
    const liquido = Math.round((posicao.valorAtual - imposto) * 100) / 100;

    let falaDoLeao;
    if (lucro <= 0) {
        falaDoLeao = "Sem lucro, sem mordida. Hoje eu passo fome... 😤";
    } else if (taxa === 0) {
        falaDoLeao = "Isento?! Essa eu não posso morder. 😾";
    } else {
        falaDoLeao = `Nhac! Vou levar <strong>${granas(imposto)}</strong> do seu lucro.`;
    }
    const dicaLeao = produto.imposto === "regressivo" && taxa > 0.15
        ? `<p class="dica">💡 Se esperasse mais, o Leão morderia menos: a alíquota cai até 15% depois de 720 dias (24 meses na simulação).</p>`
        : "";

    abrirModal("Resgatar " + produto.nome, `
        <div class="vilao">
            <span class="vilao-rosto" aria-hidden="true">🦁</span>
            <p><strong>Leão Faminto:</strong> ${falaDoLeao}</p>
        </div>
        <table class="tabela-resgate">
            <caption>Resumo do resgate</caption>
            <tbody>
                <tr><th scope="row">Valor bruto</th><td>${granas(posicao.valorAtual)}</td></tr>
                <tr><th scope="row">Valor aplicado</th><td>${granas(posicao.aplicado)}</td></tr>
                <tr><th scope="row">Lucro</th><td>${granas(lucro)}</td></tr>
                <tr><th scope="row">Imposto (${(taxa * 100).toLocaleString("pt-BR")}%)</th><td>− ${granas(imposto)}</td></tr>
                <tr><th scope="row">Você recebe</th><td>${granas(liquido)}</td></tr>
            </tbody>
        </table>
        <p class="dica">${escapar(regra)} Ficou ${mesesAplicado} ${mesesAplicado === 1 ? "mês" : "meses"} aplicado.</p>
        ${dicaLeao}
        <button type="button" class="botao botao-destaque botao-largo" id="confirmar-resgate">Confirmar resgate</button>`);

    $("#confirmar-resgate").addEventListener("click", () => {
        estado.granas = Math.round((estado.granas + liquido) * 100) / 100;
        estado.carteira = estado.carteira.filter((p) => p.id !== posicaoId);
        estado.impostoPago = Math.round(((estado.impostoPago || 0) + imposto) * 100) / 100;
        estado.lucroRealizado = Math.round(((estado.lucroRealizado || 0) + (lucro - imposto)) * 100) / 100;
        fecharModal();
        avisar(`Resgate feito: ${granas(liquido)} voltaram para o seu saldo`);
        concluirMissao("resgatar");
        desenharTudo();
    });
}

/* =========================================================
   EVENTOS
   ========================================================= */

function ligarEventosInvestir() {
    $("#botao-avancar-mes").addEventListener("click", () => avancarMeses(1));
    $("#botao-avancar-6").addEventListener("click", () => avancarMeses(6));
    $$(".filtro-risco").forEach((botao) => {
        botao.addEventListener("click", () => {
            filtroRisco = botao.dataset.filtro;
            desenharProdutos();
        });
    });
    $("#tela-investir").addEventListener("click", (evento) => {
        const botao = evento.target.closest("button");
        if (!botao) {
            return;
        }
        if (botao.dataset.investir) {
            abrirInvestir(botao.dataset.investir);
        } else if (botao.dataset.resgatar) {
            abrirResgate(botao.dataset.resgatar);
        }
    });
}
