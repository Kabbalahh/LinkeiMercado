/**
 * Linkei Mercado - Script de Interatividade e Dados
 * Atualizado com técnicas UX AI e Design System Apple-like
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Integridade do Firebase
    if (typeof firebase === "undefined" || typeof firebase.database === "undefined") {
        console.error("Firebase não inicializado corretamente.");
        return;
    }

    // 2. Inicialização de Observadores de Scroll (UX Reveal)
    initScrollReveal();

    // 3. Roteamento de Página
    if (document.getElementById('product-grid-dinamica')) {
        carregarProdutosEFeatured();
    }

    if (document.body.classList.contains('pagina-produto-detalhe')) {
        carregarDetalhesProduto();
    }
});

/**
 * Aplica efeitos de entrada suave (Fade-in) conforme o scroll
 */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // CSS deve lidar com a opacidade
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));
}

/**
 * Carrega os produtos e define o destaque (Featured Product)
 */
async function carregarProdutosEFeatured() {
    const gridDinamica = document.getElementById('product-grid-dinamica');
    
    try {
        const snapshot = await firebase.database().ref('produtos').once('value');
        const produtos = snapshot.val();

        if (!produtos) {
            gridDinamica.innerHTML = '<p>Nenhuma oferta encontrada no momento.</p>';
            return;
        }

        // Limpa o grid e remove estado de loading
        gridDinamica.innerHTML = '';

        // Converte objeto em array para manipulação
        const listaProdutos = Object.keys(produtos).map(id => ({ id, ...produtos[id] }));

        // Técnica UX: Definir o primeiro produto com maior desconto como Destaque
        const produtoDestaque = listaProdutos[0]; 
        popularComponenteDestaque(produtoDestaque);

        // Popula o restante do Grid
        listaProdutos.forEach(produto => {
            const card = criarCardProdutoApple(produto);
            gridDinamica.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao sincronizar produtos:", error);
        gridDinamica.innerHTML = '<p>Erro na conexão. Tente atualizar a página.</p>';
    }
}

/**
 * Popula o componente de showcase central (Lógica de Venda)
 */
function popularComponenteDestaque(produto) {
    const showcase = document.querySelector('.featured-showcase');
    if (!showcase) return;

    const img = showcase.querySelector('.floating-img');
    const title = showcase.querySelector('.featured-title');
    const priceMain = showcase.querySelector('.price-main');
    const priceOld = showcase.querySelector('.price-strikethrough');
    const cta = showcase.querySelector('.cta-button-apple');

    // Atualiza dados
    img.src = produto.imagem || 'img_produtos/placeholder.png';
    title.textContent = produto.nome;
    priceMain.textContent = `R$ ${produto.preco}`;
    priceOld.textContent = produto.precoOriginal ? `R$ ${produto.precoOriginal}` : '';
    cta.href = produto.linkMercadoLivre || '#';
}

/**
 * Cria o card seguindo a limpeza visual da Apple
 */
function criarCardProdutoApple(produto) {
    const div = document.createElement('div');
    div.className = 'product-card fade-in';
    
    div.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
        <h3>${produto.nome}</h3>
        <p class="price">R$ ${produto.preco}</p>
        <a href="produto.html?id=${produto.id}" class="cta-button-apple" style="padding: 12px; font-size: 12px;">
            VER DETALHES
        </a>
    `;

    return div;
}

// Handler para troca de miniaturas (Página de Detalhes)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('thumbnail')) {
        const mainImg = document.getElementById('main-product-image');
        if (mainImg) {
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = e.target.src;
                mainImg.style.opacity = '1';
            }, 200);
        }
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
    }
});
