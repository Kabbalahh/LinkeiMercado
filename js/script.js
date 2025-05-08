// Funções para carregar e exibir produtos dinamicamente

document.addEventListener('DOMContentLoaded', () => {
    // ESSENCIAL: Verifique se o firebase.js e firebase-config.js foram carregados ANTES deste script.
    // E se firebase.initializeApp(firebaseConfig) foi chamado em firebase-config.js
    if (typeof firebase === "undefined" || typeof firebase.database === "undefined") {
        console.error("Firebase SDK não carregado ou não inicializado! Verifique a ordem dos scripts e o firebase-config.js");
        alert("Erro crítico: Firebase não está configurado. Verifique o console para mais detalhes.");
        // Opcionalmente, desabilitar funcionalidades que dependem do Firebase
        if (document.getElementById('product-grid-dinamica')) {
            document.getElementById('product-grid-dinamica').innerHTML = '<p>Erro ao carregar produtos: Firebase não configurado.</p>';
        }
        if (document.body.classList.contains('pagina-produto-detalhe')) {
             document.querySelector('main.container').innerHTML = '<p>Erro ao carregar detalhes do produto: Firebase não configurado.</p>';
        }
        return;
    }

    // Verifica se estamos na página inicial para carregar a grade de produtos
    if (document.getElementById('product-grid-dinamica')) {
        carregarProdutosPaginaInicial();
    }

    // Verifica se estamos na página de produto para carregar os detalhes
    if (document.body.classList.contains('pagina-produto-detalhe')) {
        carregarDetalhesProduto();
    }
});

async function fetchProdutosFromFirebase() {
    try {
        const snapshot = await firebase.database().ref('produtos').once('value');
        const produtos = snapshot.val();
        return produtos || {}; // Retorna um objeto vazio se não houver produtos
    } catch (error) {
        console.error('Falha ao buscar produtos do Firebase:', error);
        // Notificar o usuário de forma mais amigável, se apropriado
        if (document.getElementById('product-grid-dinamica')) {
            document.getElementById('product-grid-dinamica').innerHTML = '<p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
        }
        if (document.body.classList.contains('pagina-produto-detalhe') && document.querySelector('main.container')) {
             document.querySelector('main.container').innerHTML = '<p>Não foi possível carregar os detalhes do produto. Tente novamente mais tarde.</p>';
        }
        return {}; // Retorna objeto vazio em caso de erro para evitar quebras
    }
}

async function carregarProdutosPaginaInicial() {
    const productGrid = document.getElementById('product-grid-dinamica');
    if (!productGrid) return;

    productGrid.innerHTML = '<p>Carregando produtos...</p>'; // Feedback para o usuário

    const produtos = await fetchProdutosFromFirebase();

    if (Object.keys(produtos).length === 0) {
        productGrid.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    productGrid.innerHTML = ''; // Limpa o "Carregando produtos..."

    for (const produtoId in produtos) {
        if (produtos.hasOwnProperty(produtoId)) {
            const produto = produtos[produtoId];
            // O Firebase retorna o produto com seu ID como chave, mas o objeto produto em si pode não ter uma propriedade 'id'.
            // Se sua estrutura de dados no Firebase não inclui 'id' dentro do objeto do produto, use produtoId.
            // Para consistência com o código anterior que espera produto.id, vamos adicionar se não existir.
            if (!produto.id) {
                produto.id = produtoId; // Garante que o produto.id está disponível para o link
            }

            const productCard = `
                <div class="product-card">
                    <img src="${produto.imagemPrincipal ? produto.imagemPrincipal : 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" alt="${produto.nome}">
                    <h3>${produto.nome}</h3>
                    <p class="price">${produto.preco}</p>
                    <a href="produto.html?id=${produto.id}" class="btn-details">Ver Detalhes</a>
                </div>
            `;
            productGrid.innerHTML += productCard;
        }
    }
}

async function carregarDetalhesProduto() {
    const mainContainer = document.querySelector('main.container');
    if (!mainContainer) return;

    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    if (!produtoId) {
        mainContainer.innerHTML = '<p>Produto não especificado.</p>';
        return;
    }

    try {
        const snapshot = await firebase.database().ref('produtos/' + produtoId).once('value');
        const produto = snapshot.val();

        if (!produto) {
            mainContainer.innerHTML = '<p>Produto não encontrado.</p>';
            return;
        }
        // Adiciona o ID ao objeto produto se não estiver presente, para consistência
        if (!produto.id) {
            produto.id = produtoId;
        }

        // Atualiza o título da página
        document.title = `${produto.nome || 'Detalhes do Produto'} - Afiliados Mercado Livre`;

        // Preenche a seção da imagem
        const mainProductImage = document.getElementById('main-product-image');
        if (mainProductImage) {
            mainProductImage.src = produto.imagemPrincipal ? produto.imagemPrincipal : 'https://via.placeholder.com/400x400.png?text=Sem+Imagem';
            mainProductImage.alt = produto.nome || 'Imagem do Produto';
        }

        const thumbnailsContainer = document.querySelector('.thumbnail-images');
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = ''; // Limpa thumbs de exemplo
            if (produto.imagensMiniaturas && produto.imagensMiniaturas.length > 0) {
                produto.imagensMiniaturas.forEach(thumbSrc => {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = thumbSrc;
                    thumbImg.alt = `Miniatura ${produto.nome || 'Produto'}`;
                    thumbImg.classList.add('thumbnail');
                    thumbImg.addEventListener('click', () => {
                        if(mainProductImage) mainProductImage.src = thumbSrc;
                    });
                    thumbnailsContainer.appendChild(thumbImg);
                });
                thumbnailsContainer.style.display = '';
            } else {
                thumbnailsContainer.style.display = 'none';
            }
        }

        // Preenche a seção de informações do produto
        const productNameDetail = document.getElementById('product-name-detail');
        if (productNameDetail) productNameDetail.textContent = produto.nome || 'Nome Indisponível';
        
        const productPriceDetail = document.getElementById('product-price-detail');
        if (productPriceDetail) productPriceDetail.textContent = typeof produto.preco === 'number' ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}` : (produto.preco || 'Preço Indisponível');
        
        const productDescriptionShort = document.getElementById('product-description-short');
        if (productDescriptionShort) productDescriptionShort.textContent = produto.descricaoCurta || '';
        
        const buyButton = document.getElementById('btn-buy-now-link'); // Assumindo que o botão de comprar agora tenha este ID no produto.html
        if (buyButton) {
            if (produto.linkAfiliado) {
                buyButton.href = produto.linkAfiliado;
                buyButton.style.display = '';
            } else {
                buyButton.style.display = 'none'; // Esconde o botão se não houver link
            }
        }

        // Preenche as características do produto
        const characteristicsSection = document.getElementById('product-characteristics-dinamico'); // Certifique-se que este ID existe no produto.html
        if (characteristicsSection) {
            characteristicsSection.innerHTML = ''; // Limpa características de exemplo
            // A estrutura de características no Firebase é { "grupo": { "chave1": "valor1", ... } }
            if (produto.caracteristicas && typeof produto.caracteristicas === 'object' && Object.keys(produto.caracteristicas).length > 0) {
                for (const nomeGrupo in produto.caracteristicas) {
                    if (produto.caracteristicas.hasOwnProperty(nomeGrupo)) {
                        const itensGrupo = produto.caracteristicas[nomeGrupo];
                        const groupDiv = document.createElement('div');
                        groupDiv.classList.add('characteristics-group');
                        
                        const groupTitle = document.createElement('h3');
                        groupTitle.textContent = nomeGrupo; // O nome do grupo é a chave do objeto
                        groupDiv.appendChild(groupTitle);
                        
                        const itemList = document.createElement('ul');
                        if (typeof itensGrupo === 'object' && Object.keys(itensGrupo).length > 0) {
                            for (const chaveItem in itensGrupo) {
                                if (itensGrupo.hasOwnProperty(chaveItem)) {
                                    const valorItem = itensGrupo[chaveItem];
                                    const listItem = document.createElement('li');
                                    listItem.innerHTML = `<strong>${chaveItem}:</strong> ${valorItem}`;
                                    itemList.appendChild(listItem);
                                }
                            }
                        } else {
                            const noItems = document.createElement('p');
                            noItems.textContent = 'Nenhum item neste grupo.';
                            itemList.appendChild(noItems);
                        }
                        groupDiv.appendChild(itemList);
                        characteristicsSection.appendChild(groupDiv);
                    }
                }
            } else {
                const noChar = document.createElement('p');
                noChar.textContent = 'Nenhuma característica adicional disponível para este produto.';
                characteristicsSection.appendChild(noChar);
            }
        }

    } catch (error) {
        console.error('Falha ao buscar detalhes do produto do Firebase:', error);
        mainContainer.innerHTML = '<p>Erro ao carregar detalhes do produto. Tente novamente mais tarde.</p>';
    }
}

// Funcionalidade para miniaturas (mantida, mas certifique-se que os seletores são válidos)
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('thumbnail')) {
        const mainImage = document.getElementById('main-product-image');
        if(mainImage) mainImage.src = event.target.src;
        document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
        event.target.classList.add('active');
    }
});

