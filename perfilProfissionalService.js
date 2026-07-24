import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const colecaoPerfisProfissionais = collection(
    db,
    "perfisProfissionais"
);

async function adicionarPerfilProfissional(perfil) {
    const documento = await addDoc(
        colecaoPerfisProfissionais,
        perfil
    );

    return documento.id;
}

async function buscarPerfisProfissionais() {
    const resultado = await getDocs(
        colecaoPerfisProfissionais
    );

    return resultado.docs.map(function (documento) {
        return {
            id: documento.id,
            ...documento.data()
        };
    });
}

async function atualizarPerfilProfissional(
    id,
    dadosAtualizados
) {
    const referencia = doc(
        db,
        "perfisProfissionais",
        id
    );

    await updateDoc(
        referencia,
        dadosAtualizados
    );
}

async function excluirPerfilProfissional(id) {
    const referencia = doc(
        db,
        "perfisProfissionais",
        id
    );

    await deleteDoc(referencia);
}

export {
    adicionarPerfilProfissional,
    buscarPerfisProfissionais,
    atualizarPerfilProfissional,
    excluirPerfilProfissional
};