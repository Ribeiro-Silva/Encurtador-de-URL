const input = document.getElementById("url");
const erro = document.getElementById("erro");
const resultado = document.getElementById("resultado");
const link = document.getElementById("link");
const lista = document.getElementById("historico");
const modal = document.getElementById("modal")
const copiar = document.getElementById("copiar");


async function encurtar() {
    erro.textContent = "";

    let resp, dados;
    try {
        resp = await fetch("/api/encurtar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: input.value }),
        });
        dados = await resp.json();
    } catch (e) {
        console.error("Falha na requisição:", e);
        erro.textContent = "Não foi possível conectar ao servidor.";
        return;
    }

    if (!resp.ok) {
        erro.textContent = dados.erro || "Erro ao encurtar";
        return;
    }

    link.href = link.textContent = dados.url_curta;
    copiar.textContent = "Copiar";
    input.value = "";
    modal.showModal();
}

function criarCelula(classes) {
    const td = document.createElement("td");
    td.className = classes;
    return td;
}

async function carregarHistorico() {
    const resp = await fetch("/api/historico");
    const itens = await resp.json();
    lista.innerHTML = "";

    for (const i of itens) {
        const tr = document.createElement("tr");
        tr.className = "boder-n norder-slate-200  border border-gray-200";

        const tdLink = criarCelula("py-2 pr4 p-4  border border-gray-200")
        const a = document.createElement("a");
        a.href = a.textContent = i.url_curta;
        a.target = "_blank";
        a.className = "text-[#E113F0] hover:underline";
        tdLink.appendChild(a);

        const tdCliques = criarCelula("py-2 pr-4 text-right  border border-gray-200");
        tdCliques.textContent = i.cliques;

        const tdData = criarCelula("py-2 text-slate-500 text-center whitespace-nowrap  border border-gray-200");
        tdData.textContent = i.criado;

        tr.append(tdLink, tdCliques, tdData);
        lista.appendChild(tr);
    }
}

document.getElementById("btn").addEventListener("click", encurtar);
input.addEventListener("keydown", e => {
    if (e.key === "Enter") encurtar();
});

copiar.addEventListener("click", async () => {
    await navigator.clipboard.writeText(link.textContent);
    copiar.textContent = "Copiado!";
});

document.getElementById("fechar").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => {
    if (e.target === modal) modal.close();   
});
modal.addEventListener("close", carregarHistorico);
carregarHistorico();