## Manual de Instruções: Site de Afiliados com Integração Firebase

Bem-vindo ao manual do seu site de afiliados atualizado com integração Firebase! Este guia explicará as principais mudanças, como configurar o ambiente, gerenciar produtos e realizar o deploy.

### 1. Visão Geral das Mudanças

O sistema de gerenciamento de produtos do seu site foi migrado de um arquivo `produtos.json` estático para uma integração dinâmica com o **Firebase Realtime Database**. Isso oferece as seguintes vantagens:

*   **Gerenciamento Dinâmico:** Adicione e atualize produtos através de um gerenciador online sem precisar editar arquivos JSON manualmente.
*   **Escalabilidade:** O Firebase é capaz de lidar com um grande volume de dados e acessos.
*   **Atualizações em Tempo Real (Potencial):** As alterações nos produtos podem ser refletidas no site quase instantaneamente (dependendo da implementação final e cache).

Os arquivos do site foram atualizados para ler dados diretamente do Firebase, e o `gerenciador.html` agora salva os produtos diretamente na sua base de dados Firebase.

### 2. Estrutura dos Arquivos Modificados

Os arquivos do seu site estão organizados da seguinte forma (dentro do diretório `site_atualizado`):

*   `index.html`: Página inicial que exibe a lista de produtos.
*   `produto.html`: Página que exibe os detalhes de um produto específico.
*   `gerenciador.html`: Página para adicionar novos produtos ao Firebase.
*   `css/style.css`: Estilos principais do site.
*   `css/gerenciador.css`: Estilos específicos para a página do gerenciador.
*   `js/script.js`: Contém a lógica para buscar e exibir produtos do Firebase nas páginas `index.html` e `produto.html`.
*   `js/gerenciador.js`: Contém a lógica para o formulário de adição de produtos na página `gerenciador.html`, salvando os dados no Firebase.
*   `js/firebase-config.js`: **Arquivo crucial** onde você deverá inserir as credenciais do seu projeto Firebase.
*   `produtos.json.bkp`: Um backup do seu arquivo `produtos.json` original. Você pode usá-lo para migrar os dados existentes para o Firebase.

### 3. Configuração Inicial (Firebase)

Antes de o site funcionar corretamente, você precisa configurar o Firebase.

**3.1. Crie um Projeto no Firebase:**

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Crie um novo projeto (ou use um existente).
3.  Dentro do seu projeto, adicione um aplicativo Web (clique no ícone `</>`).
4.  Dê um nome ao seu aplicativo Web e registre-o. O Firebase fornecerá um objeto de configuração (SDK snippet).

**3.2. Configure `js/firebase-config.js`:**

1.  Abra o arquivo `site_atualizado/js/firebase-config.js`.
2.  Você verá um exemplo de `firebaseConfig` comentado. Substitua os valores de `apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, e `appId` pelos valores fornecidos pelo Firebase no passo anterior.
3.  Descomente as linhas `firebase.initializeApp(firebaseConfig);` e `const database = firebase.database();`.

   ```javascript
   // Exemplo após preenchimento:
   const firebaseConfig = {
     apiKey: "SUA_API_KEY_REAL",
     authDomain: "SEU_PROJETO.firebaseapp.com",
     databaseURL: "https://SEU_PROJETO.firebaseio.com",
     projectId: "SEU_PROJETO_ID",
     storageBucket: "SEU_PROJETO.appspot.com",
     messagingSenderId: "SEU_SENDER_ID",
     appId: "SEU_APP_ID"
   };

   // Inicializa o Firebase
   firebase.initializeApp(firebaseConfig);
   const database = firebase.database(); // Para Realtime Database
   // const storage = firebase.storage(); // Para Storage (descomente se for usar upload de imagens no futuro)
   ```

**3.3. Inclua as SDKs do Firebase nos HTMLs:**

Certifique-se de que os seguintes scripts estão presentes no `<head>` ou antes do fechamento da tag `</body>` nos arquivos `index.html`, `produto.html`, e `gerenciador.html`, **antes** dos scripts `firebase-config.js`, `script.js` e `gerenciador.js`:

```html
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
<!-- Se for usar Firebase Storage no futuro para upload de imagens -->
<!-- <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js"></script> -->

<!-- Seus scripts de configuração e lógica -->
<script src="js/firebase-config.js"></script>
<!-- Em index.html e produto.html: -->
<script src="js/script.js"></script>
<!-- Em gerenciador.html: -->
<!-- <script src="js/gerenciador.js"></script> -->
```
*Nota: O script específico (`script.js` ou `gerenciador.js`) deve ser incluído apenas na página correspondente.*

**3.4. Configure o Firebase Realtime Database:**

1.  No console do Firebase, vá para a seção "Realtime Database".
2.  Crie um novo banco de dados (se ainda não o fez). Escolha o modo de segurança **"iniciar em modo de teste"** por enquanto para facilitar a configuração inicial. **Lembre-se de configurar regras de segurança mais restritivas antes de ir para produção!**

**3.5. Migre os Dados Existentes (Opcional):**

Se você tem produtos no arquivo `site_atualizado/produtos.json.bkp` que deseja migrar:

1.  No Firebase Realtime Database, clique nos três pontos (menu) e escolha "Importar JSON".
2.  Selecione o arquivo `produtos.json.bkp`.
3.  Os dados serão importados. A estrutura esperada no Firebase é uma coleção chamada `produtos`, onde cada produto é um objeto com um ID único como chave. Exemplo:
    ```json
    {
      "produtos": {
        "ID_DO_PRODUTO_1": {
          "id": "ID_DO_PRODUTO_1",
          "nome": "Nome do Produto 1",
          "preco": 199.90, // Note que o preço agora deve ser um número
          "linkAfiliado": "url_do_afiliado",
          "imagemPrincipal": "url_imagem_principal",
          "imagensMiniaturas": ["url1", "url2"],
          "descricaoCurta": "Descrição...",
          "caracteristicas": {
            "Grupo Caracteristica 1": {
              "Chave1": "Valor1",
              "Chave2": "Valor2"
            },
            "Grupo Caracteristica 2": {
              "ChaveA": "ValorA"
            }
          }
        }
      }
    }
    ```
    **Importante:** A estrutura de `caracteristicas` mudou. No `produtos.json` original, era um array de objetos. Agora, no Firebase, é um objeto onde cada chave é o nome do grupo, e o valor é outro objeto com pares chave/valor das características.
    O campo `preco` também foi ajustado para ser um número (ex: `199.90`) em vez de uma string formatada (ex: `"R$ 199,90"`) para facilitar manipulações futuras. O `script.js` tentará formatá-lo para exibição.

**3.6. Configure Regras de Segurança:**

No Firebase Realtime Database, vá para a aba "Regras". Para começar, você pode usar regras que permitem leitura pública e escrita apenas para usuários autenticados (se você implementar autenticação no futuro). Por enquanto, para o gerenciador funcionar sem autenticação, você pode deixar as regras mais abertas, mas **isso não é seguro para produção.**

Exemplo de regras para leitura pública e escrita restrita (requer autenticação para escrita):
```json
{
  "rules": {
    "produtos": {
      ".read": "true",
      ".write": "auth != null" // Apenas usuários autenticados podem escrever
    }
  }
}
```
Para permitir que o `gerenciador.html` funcione sem autenticação (durante o desenvolvimento, **NÃO RECOMENDADO PARA PRODUÇÃO**):
```json
{
  "rules": {
    "produtos": {
      ".read": "true",
      ".write": "true"
    }
  }
}
```
**Consulte a documentação do Firebase para configurar regras de segurança adequadas às suas necessidades antes de colocar o site em produção.**

### 4. Como Usar o Gerenciador de Produtos (`gerenciador.html`)

1.  Abra o arquivo `site_atualizado/gerenciador.html` no seu navegador (após configurar o Firebase).
2.  Você verá um formulário para adicionar novos produtos.

**Para adicionar um novo produto:**

*   **ID do Produto:** Insira um ID único para o produto (ex: `smartwatch-xyz-001`). Este ID será usado como a chave no Firebase e na URL da página de detalhes do produto.
*   **Nome do Produto:** O nome completo do produto.
*   **Preço:** Insira o preço como um número (ex: `299.90`). Não inclua "R$" ou outros símbolos.
*   **Link de Afiliado:** A URL do link de afiliado para o produto.
*   **URL da Imagem Principal:** A URL completa da imagem principal do produto.
*   **URLs das Imagens Miniaturas:** URLs das imagens miniaturas, separadas por vírgula (ex: `url1.jpg, url2.png`).
*   **Descrição Curta:** Uma breve descrição do produto.
*   **Características do Produto:**
    *   Clique em "Adicionar Grupo de Características" para criar um novo grupo (ex: "Tela", "Bateria").
    *   Para cada grupo, insira o nome do grupo.
    *   Clique em "Adicionar Item Característica" dentro de um grupo para adicionar pares de chave/valor (ex: Chave: "Tamanho", Valor: "1.78 polegadas").
    *   Você pode adicionar múltiplos grupos e múltiplos itens por grupo.
*   Clique em "Salvar Produto no Firebase".

O produto será salvo diretamente no seu Firebase Realtime Database. Se o salvamento for bem-sucedido, uma mensagem de confirmação aparecerá e o formulário será limpo.

**Observações sobre o Gerenciador Atual:**

*   **Adição de Produtos:** O gerenciador atual está focado na adição de novos produtos.
*   **Listagem, Edição e Exclusão:** Funcionalidades para listar, editar ou excluir produtos existentes diretamente pela interface do `gerenciador.html` não estão implementadas nesta versão. Para editar ou excluir produtos, você precisará fazê-lo diretamente no console do Firebase Realtime Database por enquanto.

### 5. Como Inserir Novos Produtos (Detalhes dos Campos)

Ao usar o `gerenciador.html`:

*   **ID do Produto:** Campo obrigatório. Deve ser único. Evite espaços e caracteres especiais, use hífens se necessário (ex: `meu-produto-incrivel-01`).
*   **Nome do Produto:** Campo obrigatório.
*   **Preço:** Campo obrigatório. Use ponto como separador decimal (ex: `123.45`).
*   **Link de Afiliado:** URL completa.
*   **URL da Imagem Principal:** URL completa da imagem.
*   **URLs das Imagens Miniaturas:** Separe múltiplas URLs com vírgulas. Ex: `https://site.com/img1.jpg,https://site.com/img2.png`
*   **Descrição Curta:** Texto descritivo.
*   **Características:**
    *   **Nome do Grupo:** Seja descritivo (ex: "Especificações Técnicas", "Dimensões", "Tela").
    *   **Item Característica (Chave/Valor):**
        *   Chave: O nome do atributo (ex: "Marca", "Cor", "Resolução").
        *   Valor: O valor do atributo (ex: "MinhaMarca", "Azul", "1920x1080").

### 6. Deploy no Netlify (via GitHub)

1.  **Crie um Repositório no GitHub:** Envie a pasta `site_atualizado` (com todo o seu conteúdo) para um novo repositório no GitHub.

2.  **Conecte o Netlify ao GitHub:**
    *   Crie uma conta ou faça login no [Netlify](https://www.netlify.com/).
    *   Clique em "New site from Git".
    *   Escolha "GitHub" e autorize o Netlify a acessar seus repositórios.
    *   Selecione o repositório que você criou.

3.  **Configurações de Build (Geralmente Padrão para Sites Estáticos):**
    *   **Branch to deploy:** `main` ou a branch principal do seu repositório.
    *   **Build command:** Deixe em branco (ou `npm run build` se você tivesse um processo de build, o que não é o caso aqui).
    *   **Publish directory:** Deixe em branco ou `/` (se a raiz do seu repositório é a pasta `site_atualizado`). Se você subiu a pasta `site_atualizado` para dentro de um repositório, e não como a raiz, ajuste aqui. Por exemplo, se a estrutura no GitHub é `meu-repo/site_atualizado/index.html`, então o Publish directory deve ser `site_atualizado`.

4.  **Configure Variáveis de Ambiente (MUITO IMPORTANTE):**
    *   Para evitar expor suas chaves do Firebase no código do GitHub, você deve configurá-las como variáveis de ambiente no Netlify.
    *   No Netlify, vá para "Site settings" > "Build & deploy" > "Environment".
    *   Adicione as seguintes variáveis de ambiente, uma por uma, com os valores correspondentes do seu `firebaseConfig`:
        *   `FIREBASE_API_KEY`
        *   `FIREBASE_AUTH_DOMAIN`
        *   `FIREBASE_DATABASE_URL`
        *   `FIREBASE_PROJECT_ID`
        *   `FIREBASE_STORAGE_BUCKET`
        *   `FIREBASE_MESSAGING_SENDER_ID`
        *   `FIREBASE_APP_ID`
    *   **Modifique o arquivo `js/firebase-config.js` para ler essas variáveis de ambiente:**
        No Netlify, as variáveis de ambiente não são diretamente acessíveis no JavaScript do lado do cliente da mesma forma que em um ambiente Node.js. A maneira mais comum de usar variáveis de ambiente com sites estáticos no Netlify é injetá-las durante o processo de build ou usar Funções Netlify.
        **Para este projeto simples, a recomendação é que você continue colocando suas chaves diretamente no `firebase-config.js` e mantenha seu repositório GitHub como privado.**
        Se a segurança das chaves for uma preocupação extrema e o repositório precisar ser público, você precisaria de uma etapa de build para injetar essas variáveis ou usar Funções Netlify para intermediar as chamadas ao Firebase, o que está fora do escopo desta atualização.
        **Portanto, para este projeto, mantenha as chaves no `firebase-config.js` e certifique-se de que seu repositório no GitHub é privado.**

5.  **Deploy:** Clique em "Deploy site". O Netlify fará o build (se houver comando) e publicará seu site.

### 7. Observações e Próximas Melhorias

*   **Segurança do Firebase:** Reforce as regras de segurança do seu Firebase Realtime Database antes de divulgar o site amplamente.
*   **Gerenciador de Produtos Completo:** Considere implementar funcionalidades de listagem, edição e exclusão de produtos na interface do `gerenciador.html` para uma gestão mais completa.
*   **Upload de Imagens:** Para facilitar o cadastro, você pode integrar o Firebase Storage para permitir o upload direto de imagens pelo gerenciador, em vez de apenas inserir URLs.
*   **Validação de Formulários:** Melhorar a validação dos campos no `gerenciador.html`.

Esperamos que este manual ajude você a gerenciar seu novo site de afiliados! Em caso de dúvidas, consulte a documentação do Firebase e do Netlify.
