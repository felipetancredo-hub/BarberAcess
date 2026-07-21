import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const colecaoAgendamentos = collection(db, "agendamentos");

async function adicionarAgendamento(agendamento) {
    const documento = await addDoc(
        colecaoAgendamentos,
        agendamento
    );

    return documento.id;
}

async function buscarAgendamentos() {
    const resultado = await getDocs(colecaoAgendamentos);

    return resultado.docs.map(function (documento) {
        return {
            id: documento.id,
            ...documento.data()
        };
    });
}

async function atualizarStatusAgendamento(id, novoStatus) {
    const referencia = doc(db, "agendamentos", id);

    await updateDoc(referencia, {
        status: novoStatus
    });
}

async function excluirAgendamento(id) {
    const referencia = doc(db, "agendamentos", id);

    await deleteDoc(referencia);
}

export {
    adicionarAgendamento,
    buscarAgendamentos,
    atualizarStatusAgendamento,
    excluirAgendamento
};