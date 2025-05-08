// Cole aqui a configuração do Firebase SDK que você obtém no console do Firebase
// Exemplo:
 const firebaseConfig = {
   apiKey: "AIzaSyB5aKxwg469d-fyZinnLtnS5LW-QYcwMhI",
   authDomain: "linkei-mercado.firebaseapp.com",
   databaseURL: "https://linkei-mercado-default-rtdb.firebaseio.com",
   projectId: "linkei-mercado",
   storageBucket: "linkei-mercado.firebasestorage.app",
   messagingSenderId: "477976665996",
   appId: "1:477976665996:web:32c4830c927f7c190600a9"
 };

 // Inicializa o Firebase
 firebase.initializeApp(firebaseConfig);
 const database = firebase.database(); // Para Realtime Database
 const storage = firebase.storage(); // Para Storage (se for usar upload de imagens)

// Adicione suas chaves e descomente as linhas acima.
// Certifique-se de que a SDK do Firebase está incluída no seu HTML.
// Exemplo para Realtime Database e Storage (ajuste conforme sua necessidade):
// <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js"></script>

console.log("Arquivo firebase-config.js carregado. Por favor, adicione suas chaves de configuração do Firebase.");

// Exporte as instâncias para serem usadas em outros scripts (opcional, mas recomendado)
// export { database, storage }; // Se estiver usando módulos ES6

