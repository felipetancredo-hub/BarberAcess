import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc
}from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const colecaoProfissionais = collection(db, "profissionais");

export async function adicionarProfissional(dadosProfissional) {
    const documento = await addDoc(
        colecaoProfissionais,
        dadosProfissional
    );

    return documento.id;
}

export async function buscarProfissionaisPorPerfil(perfilId) {
    const consulta = query(
        colecaoProfissionais,
        where("perfilId", "==", perfilId)
    );

    const resultado = await getDocs(consulta);

    return resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
    }));
}

export async function excluirProfissional(idProfissional) {
    const referencia = doc(
        db,
        "profissionais",
        idProfissional
    );

    await deleteDoc(referencia);
}