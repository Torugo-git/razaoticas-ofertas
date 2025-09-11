// ATENÇÃO: Este ficheiro centraliza a configuração do Firebase para o projeto do PAINEL.

// Configuração do seu projeto Firebase (obtida da sua landing page)
const firebaseConfig = {
    apiKey: "AIzaSyAEzMahSewwMBFXKrPjYIJqW7eHDlfiB8U",
    authDomain: "raza-oticas-landing-pages.firebaseapp.com",
    projectId: "raza-oticas-landing-pages",
    storageBucket: "raza-oticas-landing-pages.appspot.com",
    messagingSenderId: "248156217813",
    appId: "1:248156217813:web:409956bfa071bdcc1c9d5c",
    measurementId: "G-VJD5D9KNQX"
};

// Inicializa o Firebase
// Usamos o 'firebase.app()' para evitar reinicializar a app se o script for carregado mais de uma vez.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Disponibiliza as instâncias dos serviços do Firebase para serem usadas em outros scripts
const auth = firebase.auth();
const db = firebase.firestore();