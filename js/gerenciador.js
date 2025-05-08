// js/gerenciador.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-novo-produto");
    const containerGrupos = document.getElementById("container-grupos-caracteristicas");
    const btnAdicionarGrupo = document.getElementById("btn-adicionar-grupo");
    const resultadoJsonContainer = document.getElementById("resultado-json-container");
    const jsonGeradoOutput = document.getElementById("json-gerado-output");
    const btnCopiarJson = document.getElementById("btn-copiar-json");

    let grupoIndex = 0;

    // Função para adicionar um novo grupo de características
    btnAdicionarGrupo.addEventListener("click", () => {
        grupoIndex++;
        const novoGrupoDiv = document.createElement("div");
        novoGrupoDiv.classList.add("grupo-caracteristica-item");
        novoGrupoDiv.innerHTML = `
            <div class="form-group">
                <label for="grupo-nome-${grupoIndex}">Nome do Grupo de Características (ex: Tela, Bateria):</label>
                <input type="text" id="grupo-nome-${grupoIndex}" name="grupo_nome_${grupoIndex}" required>
            </div>
            <div id="itens-grupo-${grupoIndex}">
                <!-- Itens de característica serão adicionados aqui -->
            </div>
            <button type="button" class="btn-adicionar-item-caracteristica btn-secundario" data-grupo-id="${grupoIndex}">Adicionar Item Característica</button>
            <button type="button" class="btn-remover btn-remover-grupo" style="margin-left: 10px;">Remover Grupo</button>
        `;
        containerGrupos.appendChild(novoGrupoDiv);
    });

    // Função para adicionar um novo item de característica a um grupo
    containerGrupos.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-adicionar-item-caracteristica")) {
            const grupoId = e.target.dataset.grupoId;
            const containerItens = document.getElementById(`itens-grupo-${grupoId}`);
            const itemIndex = containerItens.children.length;
            
            const novoItemDiv = document.createElement("div");
            novoItemDiv.classList.add("item-caracteristica");
            novoItemDiv.innerHTML = `
                <input type="text" placeholder="Chave (ex: Cor)" name="item_chave_${grupoId}_${itemIndex}" required>
                <input type="text" placeholder="Valor (ex: Preto)" name="item_valor_${grupoId}_${itemIndex}" required>
                <button type="button" class="btn-remover btn-remover-item">Remover Item</button>
            `;
            containerItens.appendChild(novoItemDiv);
        }

        // Remover item de característica
        if (e.target.classList.contains("btn-remover-item")) {
            e.target.closest(".item-caracteristica").remove();
        }
        // Remover grupo de característica
        if (e.target.classList.contains("btn-remover-grupo")) {
            e.target.closest(".grupo-caracteristica-item").remove();
        }
    });

    // Submissão do formulário para gerar JSON
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const produto = {};

        produto.id = formData.get("id");
        produto.nome = formData.get("nome");
        produto.preco = formData.get("preco");
        produto.linkAfiliado = formData.get("linkAfiliado") || "#";
        produto.imagemPrincipal = formData.get("imagemPrincipal") || "https://via.placeholder.com/400x400.png?text=Sem+Imagem";
        
        const miniaturasStr = formData.get("imagensMiniaturas");
        produto.imagensMiniaturas = miniaturasStr ? miniaturasStr.split(",").map(url => url.trim()).filter(url => url) : [];
        
        produto.descricaoCurta = formData.get("descricaoCurta") || "";
        produto.caracteristicas = [];

        document.querySelectorAll(".grupo-caracteristica-item").forEach((grupoDiv, index) => {
            const grupoNomeInput = grupoDiv.querySelector(`input[name^="grupo_nome_"]`);
            if (!grupoNomeInput || !grupoNomeInput.value) return; // Pula se o nome do grupo estiver vazio

            const grupoObj = {
                grupo: grupoNomeInput.value,
                itens: []
            };

            grupoDiv.querySelectorAll(".item-caracteristica").forEach(itemDiv => {
                const chaveInput = itemDiv.querySelector(`input[name^="item_chave_"]`);
                const valorInput = itemDiv.querySelector(`input[name^="item_valor_"]`);
                if (chaveInput && valorInput && chaveInput.value && valorInput.value) {
                    grupoObj.itens.push({
                        chave: chaveInput.value,
                        valor: valorInput.value
                    });
                }
            });
            if(grupoObj.itens.length > 0) {
                 produto.caracteristicas.push(grupoObj);
            }
        });

        jsonGeradoOutput.textContent = JSON.stringify(produto, null, 2);
        resultadoJsonContainer.style.display = "block";
    });

    // Copiar JSON para a área de transferência
    btnCopiarJson.addEventListener("click", () => {
        navigator.clipboard.writeText(jsonGeradoOutput.textContent)
            .then(() => {
                alert("JSON copiado para a área de transferência!");
            })
            .catch(err => {
                console.error("Erro ao copiar JSON: ", err);
                alert("Erro ao copiar JSON. Verifique o console.");
            });
    });

     // Adiciona o primeiro grupo de características por padrão
    if (btnAdicionarGrupo) {
        btnAdicionarGrupo.click(); 
    }
});

