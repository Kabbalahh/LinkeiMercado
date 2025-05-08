// Funções para carregar e exibir produtos dinamicamente

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página inicial para carregar a grade de produtos
    if (document.getElementById('product-grid-dinamica')) {
        carregarProdutosPaginaInicial();
    }

    // Verifica se estamos na página de produto para carregar os detalhes
    if (document.body.classList.contains('pagina-produto-detalhe')) {
        carregarDetalhesProduto();
    }
});

async function fetchProdutos() {
    try {
        const response = await fetch('produtos.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const produtos = await response.json();
        return produtos;
    } catch (error) {
        console.error('Falha ao buscar produtos:', error);
        return []; // Retorna array vazio em caso de erro
    }
}

async function carregarProdutosPaginaInicial() {
    const produtos = await fetchProdutos();
    const productGrid = document.getElementById('product-grid-dinamica');
    productGrid.innerHTML = ''; // Limpa o conteúdo estático

    if (produtos.length === 0) {
        productGrid.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const productCard = `
            <div class="product-card">
                <img src="${produto.imagemPrincipal ? produto.imagemPrincipal : 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p class="price">${produto.preco}</p>
                <a href="produto.html?id=${produto.id}" class="btn-details">Ver Detalhes</a>
            </div>
        `;
        productGrid.innerHTML += productCard;
    });
}

async function carregarDetalhesProduto() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    if (!produtoId) {
        document.querySelector('main.container').innerHTML = '<p>Produto não especificado.</p>';
        return;
    }

    const produtos = await fetchProdutos();
    const produto = produtos.find(p => p.id === produtoId);

    if (!produto) {
        document.querySelector('main.container').innerHTML = '<p>Produto não encontrado.</p>';
        return;
    }

    // Atualiza o título da página
    document.title = `${produto.nome} - Afiliados Mercado Livre`;

    // Preenche a seção da imagem
    document.getElementById('main-product-image').src = produto.imagemPrincipal ? produto.imagemPrincipal : 'https://via.placeholder.com/400x400.png?text=Sem+Imagem';
    document.getElementById('main-product-image').alt = produto.nome;
    const thumbnailsContainer = document.querySelector('.thumbnail-images');
    thumbnailsContainer.innerHTML = ''; // Limpa thumbs de exemplo
    if (produto.imagensMiniaturas && produto.imagensMiniaturas.length > 0) {
        produto.imagensMiniaturas.forEach(thumbSrc => {
            const thumbImg = document.createElement('img');
            thumbImg.src = thumbSrc;
            thumbImg.alt = `Miniatura ${produto.nome}`;
            thumbImg.classList.add('thumbnail');
            // Adicionar evento para trocar imagem principal ao clicar na miniatura (opcional)
            thumbImg.addEventListener('click', () => {
                document.getElementById('main-product-image').src = thumbSrc; 
            });
            thumbnailsContainer.appendChild(thumbImg);
        });
    } else {
        thumbnailsContainer.style.display = 'none';
    }


    // Preenche a seção de informações do produto
    document.getElementById('product-name-detail').textContent = produto.nome;
    document.getElementById('product-price-detail').textContent = produto.preco;
    document.getElementById('product-description-short').textContent = produto.descricaoCurta;
    const buyButton = document.getElementById('btn-buy-now-link');
    if (produto.linkAfiliado) {
        buyButton.href = produto.linkAfiliado;
    } else {
        buyButton.style.display = 'none'; // Esconde o botão se não houver link
    }
    

    // Preenche as características do produto
    const characteristicsSection = document.getElementById('product-characteristics-dinamico');
    characteristicsSection.innerHTML = ''; // Limpa características de exemplo

    if (produto.caracteristicas && produto.caracteristicas.length > 0) {
        produto.caracteristicas.forEach(grupo => {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('characteristics-group');
            
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = grupo.grupo;
            groupDiv.appendChild(groupTitle);
            
            const itemList = document.createElement('ul');
            grupo.itens.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${item.chave}:</strong> ${item.valor}`;
                itemList.appendChild(listItem);
            });
            groupDiv.appendChild(itemList);
            characteristicsSection.appendChild(groupDiv);
        });
    } else {
        const noChar = document.createElement('p');
        noChar.textContent = 'Nenhuma característica adicional disponível para este produto.';
        characteristicsSection.appendChild(noChar);
    }
}

// Adicionar funcionalidade para miniaturas (se houver)
// Esta é uma simplificação, pode ser melhorada
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('thumbnail')) {
        const mainImage = document.getElementById('main-product-image');
        if(mainImage) mainImage.src = event.target.src;
        // Lógica para destacar thumbnail ativa, se desejado
        document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
        event.target.classList.add('active');
    }
});

