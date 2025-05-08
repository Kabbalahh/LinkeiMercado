// js/gerenciador.js

document.addEventListener("DOMContentLoaded", () => {
    // ESSENCIAL: Verifique se o firebase.js e firebase-config.js foram carregados ANTES deste script.
    // E se firebase.initializeApp(firebaseConfig) foi chamado em firebase-config.js
    if (typeof firebase === "undefined" || typeof firebase.database === "undefined") {
        console.error("Firebase SDK não carregado ou não inicializado! Verifique a ordem dos scripts e o firebase-config.js em gerenciador.html");
        alert("Erro crítico: Firebase não está configurado para o gerenciador. Verifique o console para mais detalhes.");
        // Desabilitar o formulário ou outras interações
        const form = document.getElementById("form-novo-produto");
        if(form) form.style.display = 'none';
        const mainContainer = document.querySelector("main.container");
        if(mainContainer) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = "Erro ao carregar gerenciador: Firebase não configurado.";
            errorMsg.style.color = "red";
            mainContainer.appendChild(errorMsg);
        }
        return;
    }

    const form = document.getElementById("form-novo-produto");
    const containerGrupos = document.getElementById("container-grupos-caracteristicas");
    const btnAdicionarGrupo = document.getElementById("btn-adicionar-grupo");
    // Remover elementos relacionados à exibição de JSON, pois agora salvaremos direto no Firebase
    const resultadoJsonContainer = document.getElementById("resultado-json-container");
    if (resultadoJsonContainer) {
        resultadoJsonContainer.style.display = "none"; // Esconde em vez de remover, caso haja alguma referência ainda
    }
    const btnCopiarJson = document.getElementById("btn-copiar-json");
    if(btnCopiarJson) btnCopiarJson.style.display = "none";

    // Adicionar um elemento para feedback de salvamento
    const feedbackContainer = document.createElement('div');
    feedbackContainer.id = "feedback-container";
    feedbackContainer.style.marginTop = "20px";
    form.parentNode.insertBefore(feedbackContainer, resultadoJsonContainer); // Insere antes da antiga área de JSON

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
            <div id="itens-grupo-${grupoIndex}" class="itens-grupo-container">
                <!-- Itens de característica serão adicionados aqui -->
            </div>
            <button type="button" class="btn-adicionar-item-caracteristica btn-secundario" data-grupo-id="${grupoIndex}">Adicionar Item Característica</button>
            <button type="button" class="btn-remover btn-remover-grupo" style="margin-left: 10px;">Remover Grupo</button>
            <hr style="margin-top: 10px; margin-bottom: 10px;">
        `;
        containerGrupos.appendChild(novoGrupoDiv);
        // Adiciona um item de característica automaticamente ao novo grupo
        adicionarItemCaracteristica(grupoIndex, document.getElementById(`itens-grupo-${grupoIndex}`));
    });

    // Função para adicionar um novo item de característica a um grupo
    function adicionarItemCaracteristica(grupoId, containerItens) {
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

    containerGrupos.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-adicionar-item-caracteristica")) {
            const grupoId = e.target.dataset.grupoId;
            const containerItens = document.getElementById(`itens-grupo-${grupoId}`);
            adicionarItemCaracteristica(grupoId, containerItens);
        }
        if (e.target.classList.contains("btn-remover-item")) {
            e.target.closest(".item-caracteristica").remove();
        }
        if (e.target.classList.contains("btn-remover-grupo")) {
            e.target.closest(".grupo-caracteristica-item").remove();
        }
    });

    // Submissão do formulário para salvar no Firebase
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        feedbackContainer.innerHTML = "Salvando produto...";
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const formData = new FormData(form);
        const produto = {};

        const produtoId = formData.get("id");
        if (!produtoId) {
            feedbackContainer.innerHTML = '<p style="color: red;">Erro: ID do Produto é obrigatório.</p>';
            submitButton.disabled = false;
            return;
        }
        produto.id = produtoId; // Conforme especificado, o ID também vai dentro do objeto
        produto.nome = formData.get("nome") || "Nome não informado";
        
        // Converter preço para número, removendo "R$" e trocando vírgula por ponto
        const precoStr = formData.get("preco") || "0";
        produto.preco = parseFloat(precoStr.replace(/[^0-9,-]+/g,"").replace(",", ".")) || 0;

        produto.linkAfiliado = formData.get("linkAfiliado") || "";
        produto.imagemPrincipal = formData.get("imagemPrincipal") || "";
        
        const miniaturasStr = formData.get("imagensMiniaturas");
        produto.imagensMiniaturas = miniaturasStr ? miniaturasStr.split(",").map(url => url.trim()).filter(url => url) : [];
        
        produto.descricaoCurta = formData.get("descricaoCurta") || "";
        
        // Estrutura de características: { "NomeDoGrupo": { "Chave1": "Valor1", "Chave2": "Valor2" } }
        produto.caracteristicas = {};
        document.querySelectorAll(".grupo-caracteristica-item").forEach((grupoDiv) => {
            const grupoNomeInput = grupoDiv.querySelector(`input[name^="grupo_nome_"]`);
            if (grupoNomeInput && grupoNomeInput.value) {
                const nomeGrupo = grupoNomeInput.value.trim();
                const itensGrupo = {};
                grupoDiv.querySelectorAll(".item-caracteristica").forEach(itemDiv => {
                    const chaveInput = itemDiv.querySelector(`input[name^="item_chave_"]`);
                    const valorInput = itemDiv.querySelector(`input[name^="item_valor_"]`);
                    if (chaveInput && valorInput && chaveInput.value && valorInput.value) {
                        itensGrupo[chaveInput.value.trim()] = valorInput.value.trim();
                    }
                });
                if (Object.keys(itensGrupo).length > 0) {
                    produto.caracteristicas[nomeGrupo] = itensGrupo;
                }
            }
        });

        try {
            // Salva o produto no Firebase Realtime Database usando o ID do produto como chave
            await firebase.database().ref('produtos/' + produtoId).set(produto);
            feedbackContainer.innerHTML = '<p style="color: green;">Produto salvo com sucesso!</p>';
            form.reset(); // Limpa o formulário
            // Limpar grupos de características dinâmicos
            containerGrupos.innerHTML = '';
            grupoIndex = 0;
            btnAdicionarGrupo.click(); // Adiciona o primeiro grupo novamente

        } catch (error) {
            console.error("Erro ao salvar produto no Firebase: ", error);
            feedbackContainer.innerHTML = `<p style="color: red;">Erro ao salvar produto: ${error.message}. Verifique o console.</p>`;
        }
        finally {
            submitButton.disabled = false;
        }
    });

    // Adiciona o primeiro grupo de características por padrão ao carregar a página
    if (btnAdicionarGrupo) {
        btnAdicionarGrupo.click(); 
    }

    // TODO: Implementar listagem, edição e exclusão de produtos
    // Para listagem, seria necessário buscar os dados do Firebase e popular uma tabela ou lista.
    // Para edição, carregar os dados de um produto no formulário.
    // Para exclusão, um botão para remover o item do Firebase.
});

