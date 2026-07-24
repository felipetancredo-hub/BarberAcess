import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const colecao = collection(db, "servicos");

export async function adicionarServico(servico) {
    await addDoc(colecao, servico);
}

export async function buscarServicosPorProfissional(profissionalId) {

    const consulta = query(
        colecao,
        where("profissionalId", "==", profissionalId)
    );

    const resultado = await getDocs(consulta);

    return resultado.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function excluirServico(id) {

    await deleteDoc(doc(db, "servicos", id));

}