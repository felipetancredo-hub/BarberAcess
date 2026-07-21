import {
    adicionarAgendamento,
    buscarAgendamentos,
    atualizarStatusAgendamento,
    excluirAgendamento
} from "./firebaseService.js";

const formulario = document.querySelector("#form-agendamento");
const mensagem = document.querySelector("#mensagem");
const areaAgendamentos = document.querySelector("#agendamentos");
const totalAgendamentos = document.querySelector("#total-agendamentos");
const agendaEstabelecimento = document.querySelector("#agenda-estabelecimento");
const totalAusentes = document.querySelector("#total-ausentes");
const totalConfirmados = document.querySelector("#total-confirmados");
const totalConcluidos = document.querySelector("#total-concluidos");
const campoData = document.querySelector("#data");
const campoHorario = document.querySelector("#horario");

let agendamentos = [];

configurarDataMinima();
iniciarAplicacao();

campoData.addEventListener("change", atualizarHorariosDisponiveis);

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const servico = document.querySelector("#servico").value;
    const data = campoData.value;
    const horario = campoHorario.value;
    const acessibilidade = document.querySelector("#acessibilidade").value;
    const observacoes = document.querySelector("#observacoes").value.trim();

    const dataEHorarioSelecionados = new Date(`${data}T${horario}:00`);
    const agora = new Date();

    if (dataEHorarioSelecionados <= agora) {
        exibirMensagem(
            "Não é possível realizar agendamentos em datas ou horários que já passaram.",
            "erro"
        );
        return;
    }

    const horarioOcupado = agendamentos.some(function (agendamento) {
        return (
            agendamento.data === data &&
            agendamento.horario === horario
        );
    });

    if (horarioOcupado) {
        exibirMensagem(
            "Este horário já está ocupado. Escolha outro horário.",
            "erro"
        );
        return;
    }

    const novoAgendamento = {
        nome,
        servico,
        data,
        horario,
        acessibilidade,
        observacoes,
        status: "Confirmado"
    };

    try {
        const idFirebase = await adicionarAgendamento(novoAgendamento);

        agendamentos.push({
            id: idFirebase,
            ...novoAgendamento
        });

        atualizarInterface();

        exibirMensagem(
            `Agendamento confirmado para ${nome}: ${servico}, no dia ${formatarData(data)}, às ${horario}.`,
            "sucesso"
        );

        formulario.reset();
        atualizarHorariosDisponiveis();
    } catch (erro) {
        console.error("Erro ao salvar agendamento no Firebase:", erro);

        exibirMensagem(
            "Não foi possível salvar o agendamento. Verifique a conexão e tente novamente.",
            "erro"
        );
    }
});

async function iniciarAplicacao() {
    try {
        exibirMensagem("Carregando agendamentos...", "");

        agendamentos = await buscarAgendamentos();

        atualizarInterface();
        limparMensagem();
    } catch (erro) {
        console.error("Erro ao buscar agendamentos no Firebase:", erro);

        agendamentos = [];
        atualizarInterface();

        exibirMensagem(
            "Não foi possível acessar o banco de dados. Verifique a conexão e as configurações do Firebase.",
            "erro"
        );
    }
}

function configurarDataMinima() {
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const diaAtual = String(dataAtual.getDate()).padStart(2, "0");

    campoData.min = `${anoAtual}-${mesAtual}-${diaAtual}`;
}

function atualizarInterface() {
    mostrarAgendamentos();
    mostrarAgendaEstabelecimento();
}

function atualizarHorariosDisponiveis() {
    const dataSelecionada = campoData.value;
    const opcoesHorario = campoHorario.querySelectorAll("option");
    const agora = new Date();

    opcoesHorario.forEach(function (opcao) {
        if (opcao.value === "") {
            return;
        }

        const horarioOcupado = agendamentos.some(function (agendamento) {
            return (
                agendamento.data === dataSelecionada &&
                agendamento.horario === opcao.value
            );
        });

        const dataEHorarioDaOpcao = new Date(`${dataSelecionada}T${opcao.value}:00`);

        const horarioJaPassou =
            dataSelecionada !== "" &&
            dataEHorarioDaOpcao <= agora;

        const indisponivel = horarioOcupado || horarioJaPassou;

        opcao.disabled = indisponivel;

        if (horarioOcupado) {
            opcao.textContent = `${opcao.value} — ocupado`;
        } else if (horarioJaPassou) {
            opcao.textContent = `${opcao.value} — horário encerrado`;
        } else {
            opcao.textContent = opcao.value;
        }
    });

    campoHorario.value = "";
}

function mostrarAgendamentos() {
    areaAgendamentos.innerHTML = "";
    atualizarIndicadores();
    atualizarHorariosDisponiveis();

    if (agendamentos.length === 0) {
        areaAgendamentos.innerHTML = "<p>Nenhum agendamento realizado.</p>";
        return;
    }

    agendamentos.forEach(function (agendamento) {
        const card = document.createElement("article");

        card.classList.add("card-agendamento");

        card.innerHTML = `
            <h3>${agendamento.nome}</h3>

            <p><strong>Serviço:</strong> ${agendamento.servico}</p>
            <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
            <p><strong>Horário:</strong> ${agendamento.horario}</p>
            <p>
                <strong>Status:</strong>
                <span class="status-agendamento">
                    ${agendamento.status || "Confirmado"}
                </span>
            </p>
            <p><strong>Acessibilidade:</strong> ${agendamento.acessibilidade}</p>

            ${
                agendamento.observacoes
                    ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>`
                    : ""
            }

            <div class="acoes-status">
                <button type="button" class="botao-ausente" data-id="${agendamento.id}">
                    Ausente
                </button>

                <button type="button" class="botao-concluir" data-id="${agendamento.id}">
                    Concluir
                </button>
            </div>

            <button type="button" class="botao-cancelar" data-id="${agendamento.id}">
                Cancelar
            </button>
        `;

        areaAgendamentos.appendChild(card);

        const botaoCancelar = card.querySelector(".botao-cancelar");
        const botaoAusente = card.querySelector(".botao-ausente");
        const botaoConcluir = card.querySelector(".botao-concluir");

        botaoCancelar.addEventListener("click", async function () {
            await cancelarAgendamento(agendamento.id);
        });

        botaoAusente.addEventListener("click", async function () {
            await alterarStatus(agendamento.id, "Ausente");
        });

        botaoConcluir.addEventListener("click", async function () {
            await alterarStatus(agendamento.id, "Concluído");
        });
    });
}

function atualizarIndicadores() {
    const confirmados = agendamentos.filter(function (agendamento) {
        return (agendamento.status || "Confirmado") === "Confirmado";
    });

    const concluidos = agendamentos.filter(function (agendamento) {
        return agendamento.status === "Concluído";
    });

    const ausentes = agendamentos.filter(function (agendamento) {
        return agendamento.status === "Ausente";
    });

    totalAgendamentos.textContent = agendamentos.length;
    totalConfirmados.textContent = confirmados.length;
    totalConcluidos.textContent = concluidos.length;
    totalAusentes.textContent = ausentes.length;
}

async function alterarStatus(id, novoStatus) {
    try {
        await atualizarStatusAgendamento(id, novoStatus);

        agendamentos = agendamentos.map(function (agendamento) {
            if (agendamento.id === id) {
                return {
                    ...agendamento,
                    status: novoStatus
                };
            }

            return agendamento;
        });

        atualizarInterface();

        exibirMensagem(`Status alterado para ${novoStatus}.`, "sucesso");
    } catch (erro) {
        console.error("Erro ao alterar o status no Firebase:", erro);

        exibirMensagem(
            "Não foi possível alterar o status. Tente novamente.",
            "erro"
        );
    }
}

async function cancelarAgendamento(id) {
    const confirmou = confirm(
        "Tem certeza de que deseja cancelar este agendamento?"
    );

    if (!confirmou) {
        return;
    }

    try {
        await excluirAgendamento(id);

        agendamentos = agendamentos.filter(function (agendamento) {
            return agendamento.id !== id;
        });

        atualizarInterface();

        exibirMensagem("Agendamento cancelado com sucesso.", "sucesso");
    } catch (erro) {
        console.error("Erro ao excluir o agendamento no Firebase:", erro);

        exibirMensagem(
            "Não foi possível cancelar o agendamento. Tente novamente.",
            "erro"
        );
    }
}

function mostrarAgendaEstabelecimento() {
    agendaEstabelecimento.innerHTML = "";

    const agendamentosOrdenados = [...agendamentos];

    agendamentosOrdenados.sort(function (a, b) {
        const dataHoraA = new Date(`${a.data}T${a.horario}`);
        const dataHoraB = new Date(`${b.data}T${b.horario}`);

        return dataHoraA - dataHoraB;
    });

    if (agendamentosOrdenados.length === 0) {
        agendaEstabelecimento.innerHTML =
            "<p>Nenhum agendamento encontrado.</p>";
        return;
    }

    let dataAtualAgenda = "";

    agendamentosOrdenados.forEach(function (agendamento) {
        if (agendamento.data !== dataAtualAgenda) {
            const tituloData = document.createElement("h3");

            tituloData.textContent = `📅 ${formatarData(agendamento.data)}`;

            agendaEstabelecimento.appendChild(tituloData);

            dataAtualAgenda = agendamento.data;
        }

        const item = document.createElement("div");

        let iconeStatus = "";

        if (agendamento.status === "Confirmado") {
            iconeStatus = "🟢";
        } else if (agendamento.status === "Concluído") {
            iconeStatus = "🔵";
        } else if (agendamento.status === "Ausente") {
            iconeStatus = "🔴";
        }

        item.innerHTML = `
            <p>
                ${agendamento.horario}
                - ${agendamento.nome}
                - ${iconeStatus} ${agendamento.status || "Confirmado"}
            </p>
        `;

        agendaEstabelecimento.appendChild(item);
    });
}

function formatarData(data) {
    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function exibirMensagem(texto, tipo) {
    mensagem.textContent = texto;

    if (tipo) {
        mensagem.className = `mensagem ${tipo}`;
    } else {
        mensagem.className = "mensagem";
    }
}

function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "";
}
