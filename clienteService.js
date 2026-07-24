import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const colecaoClientes = collection(db, "clientes");

async function adicionarCliente(cliente) {
    const documento = await addDoc(
        colecaoClientes,
        cliente
    );

    return documento.id;
}

async function buscarClientes() {
    const resultado = await getDocs(colecaoClientes);

    return resultado.docs.map(function (documento) {
        return {
            id: documento.id,
            ...documento.data()
        };
    });
}

async function atualizarCliente(id, dadosAtualizados) {
    const referencia = doc(db, "clientes", id);

    await updateDoc(
        referencia,
        dadosAtualizados
    );
}

async function excluirCliente(id) {
    const referencia = doc(db, "clientes", id);

    await deleteDoc(referencia);
}

export {
    adicionarCliente,
    buscarClientes,
    atualizarCliente,
    excluirCliente
};