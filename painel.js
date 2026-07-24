import {
    adicionarServico,
    buscarServicosPorProfissional,
    excluirServico
} from "./servicoService.js";

import {
    adicionarPerfilProfissional,
    buscarPerfisProfissionais,
    atualizarPerfilProfissional
} from "./perfilProfissionalService.js";

import {
    adicionarProfissional,
    buscarProfissionaisPorPerfil,
    excluirProfissional
} from "./profissionalService.js";

const formularioPerfil = document.querySelector(
    "#form-perfil-profissional"
);

const campoNome = document.querySelector("#nome-perfil");
const campoTelefone = document.querySelector("#telefone-perfil");
const campoInstagram = document.querySelector("#instagram-perfil");
const campoEndereco = document.querySelector("#endereco-perfil");
const campoDescricao = document.querySelector("#descricao-perfil");
const mensagemPerfil = document.querySelector("#mensagem-perfil");
const resumoPerfil = document.querySelector("#resumo-perfil");
const formProfissional =
    document.querySelector("#form-profissional");
const nomeProfissional =
    document.querySelector("#nome-profissional");
const especialidadeProfissional =
    document.querySelector("#especialidade-profissional");
const listaProfissionais =
    document.querySelector("#lista-profissionais");
const formServico = document.getElementById("form-servico");
const profissionalServico = document.getElementById("profissional-servico");
const nomeServico = document.getElementById("nome-servico");
const valorServico = document.getElementById("valor-servico");
const listaServicos = document.getElementById("lista-servicos");

let perfilAtual = null;

let profissionais = [];

iniciarPainel();

formularioPerfil.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const dadosPerfil = {
        nome: campoNome.value.trim(),
        telefone: campoTelefone.value.trim(),
        instagram: campoInstagram.value.trim(),
        endereco: campoEndereco.value.trim(),
        descricao: campoDescricao.value.trim(),
        ativo: true,
        dataAtualizacao: new Date().toISOString()
    };

    try {
        if (perfilAtual) {
            await atualizarPerfilProfissional(
                perfilAtual.id,
                dadosPerfil
            );

            perfilAtual = {
                ...perfilAtual,
                ...dadosPerfil
            };

            exibirMensagemPerfil(
                "Perfil atualizado com sucesso.",
                "sucesso"
            );
        } else {
            const idPerfil = await adicionarPerfilProfissional({
                ...dadosPerfil,
                dataCadastro: new Date().toISOString()
            });

            perfilAtual = {
                id: idPerfil,
                ...dadosPerfil
            };

            exibirMensagemPerfil(
                "Perfil criado com sucesso.",
                "sucesso"
            );
        }

        mostrarResumoPerfil();
    } catch (erro) {
        console.error("Erro ao salvar perfil profissional:", erro);

        exibirMensagemPerfil(
            "Não foi possível salvar o perfil. Tente novamente.",
            "erro"
        );
    }
});

async function iniciarPainel() {
   
    await carregarProfissionais();
   
    try {
        exibirMensagemPerfil("Carregando perfil...", "");

        const perfis = await buscarPerfisProfissionais();

        if (perfis.length > 0) {
            perfilAtual = perfis[0];
            preencherFormulario();
            mostrarResumoPerfil();
        }

        limparMensagemPerfil();
    } catch (erro) {
        console.error("Erro ao carregar perfil profissional:", erro);

        exibirMensagemPerfil(
            "Não foi possível carregar o perfil.",
            "erro"
        );
    }
}

function preencherFormulario() {
    campoNome.value = perfilAtual.nome || "";
    campoTelefone.value = perfilAtual.telefone || "";
    campoInstagram.value = perfilAtual.instagram || "";
    campoEndereco.value = perfilAtual.endereco || "";
    campoDescricao.value = perfilAtual.descricao || "";
}

function mostrarResumoPerfil() {
    if (!perfilAtual) {
        resumoPerfil.innerHTML = "<p>Nenhum perfil carregado.</p>";
        return;
    }

    resumoPerfil.innerHTML = `
        <article class="card-agendamento">
            <h3>${perfilAtual.nome}</h3>

            <p>
                <strong>Telefone:</strong>
                ${perfilAtual.telefone || "Não informado"}
            </p>

            <p>
                <strong>Instagram:</strong>
                ${perfilAtual.instagram || "Não informado"}
            </p>

            <p>
                <strong>Endereço:</strong>
                ${perfilAtual.endereco || "Não informado"}
            </p>

            <p>
                <strong>Descrição:</strong>
                ${perfilAtual.descricao || "Não informada"}
            </p>
        </article>
    `;
}

function exibirMensagemPerfil(texto, tipo) {
    mensagemPerfil.textContent = texto;

    if (tipo) {
        mensagemPerfil.className = `mensagem ${tipo}`;
    } else {
        mensagemPerfil.className = "mensagem";
    }
}

function limparMensagemPerfil() {
    mensagemPerfil.textContent = "";
    mensagemPerfil.className = "";
}
async function carregarProfissionais() {

    if (!perfilAtual) return;

    profissionais =
        await buscarProfissionaisPorPerfil(
            perfilAtual.id
        );

    renderizarProfissionais();

}

function renderizarProfissionais() {

    if (profissionais.length === 0) {
        listaProfissionais.innerHTML =
            "<p>Nenhum profissional cadastrado.</p>";

        preencherSelectProfissionais();
        return;
    }

    listaProfissionais.innerHTML =
        profissionais.map(profissional => `

            <div class="card-agendamento">

                <h3>${profissional.nome}</h3>

                <p>
                    ${profissional.especialidade || "Especialidade não informada"}
                </p>

                <button
                    type="button"
                    onclick="removerProfissional('${profissional.id}')">

                    Excluir

                </button>

            </div>

        `).join("");

    preencherSelectProfissionais();
}
function preencherSelectProfissionais() {

    profissionalServico.innerHTML = `
        <option value="">Selecione um profissional</option>
    `;

    profissionais.forEach((profissional) => {
        profissionalServico.innerHTML += `
            <option value="${profissional.id}">
                ${profissional.nome}
            </option>
        `;
    });
}

    formProfissional.addEventListener(
    "submit",
    async function(evento){

        evento.preventDefault();
       
        if (!perfilAtual) {
    alert("Salve o perfil profissional antes de cadastrar um profissional.");
    return;
}        

        await adicionarProfissional({

            perfilId: perfilAtual.id,

            nome:
                nomeProfissional.value,

            especialidade:
                especialidadeProfissional.value

        });

        nomeProfissional.value="";

        especialidadeProfissional.value="";

        await carregarProfissionais();

    }
);

window.removerProfissional =
async function(id){

    await excluirProfissional(id);

    await carregarProfissionais();

};
formProfissional.addEventListener(
    "submit",
    async function(evento){

        evento.preventDefault();
       
        if (!perfilAtual) {
    alert("Salve o perfil profissional antes de cadastrar um profissional.");
    return;
}        

        await adicionarProfissional({

            perfilId: perfilAtual.id,

            nome:
                nomeProfissional.value,

            especialidade:
                especialidadeProfissional.value

        });

        nomeProfissional.value="";

        especialidadeProfissional.value="";

        await carregarProfissionais();

    }
);

window.removerProfissional =
async function(id){

    await excluirProfissional(id);

    await carregarProfissionais();

};

formServico.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!profissionalServico.value) {
        alert("Selecione um profissional.");
        return;
    }

    await adicionarServico({
        profissionalId: profissionalServico.value,
        nome: nomeServico.value,
        valor: Number(valorServico.value)
    });

    formServico.reset();

});