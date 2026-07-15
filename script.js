const formulario = document.querySelector("#form-agendamento");
const mensagem = document.querySelector("#mensagem");
const areaAgendamentos = document.querySelector("#agendamentos");
const totalAgendamentos = document.querySelector("#total-agendamentos");
const totalAusentes = document.querySelector("#total-ausentes");
const totalConfirmados = document.querySelector("#total-confirmados");
const totalConcluidos = document.querySelector("#total-concluidos");
const campoData = document.querySelector("#data");
const campoHorario = document.querySelector("#horario");
const dataAtual = new Date();

const anoAtual = dataAtual.getFullYear();
const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, "0");
const diaAtual = String(dataAtual.getDate()).padStart(2, "0");

const hoje = `${anoAtual}-${mesAtual}-${diaAtual}`;

campoData.min = hoje;

let agendamentos = carregarAgendamentos();
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

        const dataEHorarioDaOpcao = new Date(
            `${dataSelecionada}T${opcao.value}:00`
        );

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
mostrarAgendamentos();
campoData.addEventListener("change", atualizarHorariosDisponiveis);
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const servico = document.querySelector("#servico").value;
    const data = document.querySelector("#data").value;
const horario = document.querySelector("#horario").value;

const dataEHorarioSelecionados = new Date(
    `${data}T${horario}:00`
);

const agora = new Date();

if (dataEHorarioSelecionados <= agora) {
    mensagem.textContent =
        "Não é possível realizar agendamentos em datas ou horários que já passaram.";

    mensagem.className = "mensagem erro";
    return;
}
    const acessibilidade =
        document.querySelector("#acessibilidade").value;
    const observacoes =
        document.querySelector("#observacoes").value.trim();

    const horarioOcupado = agendamentos.some(function (agendamento) {
        return (
            agendamento.data === data &&
            agendamento.horario === horario
        );
    });

    if (horarioOcupado) {
        mensagem.textContent =
            "Este horário já está ocupado. Escolha outro horário.";

        mensagem.className = "mensagem erro";
        return;
    }

    const novoAgendamento = {
        id: Date.now(),
        nome: nome,
        servico: servico,
        data: data,
        horario: horario,
        acessibilidade: acessibilidade,
        observacoes: observacoes,
        status: "Confirmado"
    
};

    agendamentos.push(novoAgendamento);

    salvarAgendamentos();
    mostrarAgendamentos();

    mensagem.textContent =
        `Agendamento confirmado para ${nome}: ${servico}, ` +
        `no dia ${formatarData(data)}, às ${horario}.`;

    mensagem.className = "mensagem sucesso";

    formulario.reset();
});

function mostrarAgendamentos() {
    areaAgendamentos.innerHTML = "";
    atualizarIndicadores();
    atualizarHorariosDisponiveis();

    if (agendamentos.length === 0) {
        areaAgendamentos.innerHTML =
            "<p>Nenhum agendamento realizado.</p>";

        return;
    }

    agendamentos.forEach(function (agendamento) {
        const card = document.createElement("article");

        card.classList.add("card-agendamento");

        card.innerHTML = `
    <h3>${agendamento.nome}</h3>

    <p>
        <strong>Serviço:</strong>
        ${agendamento.servico}
    </p>

    <p>
        <strong>Data:</strong>
        ${formatarData(agendamento.data)}
    </p>

    <p>
        <strong>Horário:</strong>
        ${agendamento.horario}
    </p>
        <p>
    <strong>Status:</strong>
    <span class="status-agendamento">
        ${agendamento.status || "Confirmado"}
    </span>
</p>

<p>
    <strong>Acessibilidade:</strong>
    ${agendamento.acessibilidade}
</p>


    
    ${
        agendamento.observacoes
            ? `
                <p>
                    <strong>Observações:</strong>
                    ${agendamento.observacoes}
                </p>
            `
            : ""
    }
<div class="acoes-status">

    <button
        type="button"
        class="botao-ausente"
        data-id="${agendamento.id}"
    >
       Marcar como ausente
    </button>

    <button
        type="button"
        class="botao-concluir"
        data-id="${agendamento.id}"
    >
        Concluir
    </button>

</div>
    <button
        type="button"
        class="botao-cancelar"
        data-id="${agendamento.id}"
    >
        Cancelar agendamento
    </button>
`;
        areaAgendamentos.appendChild(card);
const botaoCancelar = card.querySelector(".botao-cancelar");
const botaoAusente = card.querySelector(".botao-ausente");
const botaoConcluir = card.querySelector(".botao-concluir");

botaoCancelar.addEventListener("click", function () {
    cancelarAgendamento(agendamento.id);
});

botaoAusente.addEventListener("click", function () {
    alterarStatus(agendamento.id, "Ausente");
});

botaoConcluir.addEventListener("click", function () {
    alterarStatus(agendamento.id, "Concluído");
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
function alterarStatus(id, novoStatus) {
    agendamentos = agendamentos.map(function (agendamento) {
        if (agendamento.id === id) {
            return {
                ...agendamento,
                status: novoStatus
            };
        }

        return agendamento;
    });

    salvarAgendamentos();
    mostrarAgendamentos();

    mensagem.textContent =
        `Status alterado para ${novoStatus}.`;

    mensagem.className = "mensagem sucesso";
}

function cancelarAgendamento(id) {
    const confirmou = confirm(
        "Tem certeza de que deseja cancelar este agendamento?"
    );

    if (!confirmou) {
        return;
    }

    agendamentos = agendamentos.filter(function (agendamento) {
        return agendamento.id !== id;
    });

    salvarAgendamentos();
    mostrarAgendamentos();

    mensagem.textContent =
        "Agendamento cancelado com sucesso.";

    mensagem.className = "mensagem sucesso";
}
function salvarAgendamentos() {
    localStorage.setItem(
        "agendamentosBarberAcess",
        JSON.stringify(agendamentos)
    );
}

function carregarAgendamentos() {
    const dadosSalvos =
        localStorage.getItem("agendamentosBarberAcess");

    if (dadosSalvos === null) {
        return [];
    }

    try {
        return JSON.parse(dadosSalvos);
    } catch (erro) {
        console.error("Erro ao carregar agendamentos:", erro);
        return [];
    }

}

function formatarData(data) {
    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}