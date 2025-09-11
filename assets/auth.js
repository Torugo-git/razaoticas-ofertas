document.addEventListener('DOMContentLoaded', () => {

    // --- VERIFICAÇÃO DO ESTADO DE AUTENTICAÇÃO ---
    // Este é o principal observador. Ele reage a mudanças no estado de login/logout.
    auth.onAuthStateChanged(user => {
        const currentPage = window.location.pathname.split('/').pop();

        if (user) {
            // Se o usuário ESTÁ logado...
            if (currentPage === 'login.html') {
                // ...e está na página de login, redireciona para o painel.
                window.location.href = 'painel.html';
            } else if (currentPage === 'painel.html') {
                // ...e está no painel, exibe o email dele no cabeçalho.
                const userEmailElement = document.getElementById('user-email');
                if (userEmailElement) {
                    userEmailElement.textContent = user.email;
                }
            }
        } else {
            // Se o usuário NÃO ESTÁ logado...
            if (currentPage !== 'login.html') {
                // ...e não está na página de login, redireciona para lá.
                window.location.href = 'login.html';
            }
        }
    });

    // --- LÓGICA DO FORMULÁRIO DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // O onAuthStateChanged vai lidar com o redirecionamento.
                    console.log('Login bem-sucedido!', userCredential.user);
                })
                .catch(error => {
                    // Exibe uma mensagem de erro genérica e amigável.
                    errorMessage.textContent = 'Email ou senha inválidos. Tente novamente.';
                    console.error('Erro de login:', error.message);
                });
        });
    }

    // --- LÓGICA DO BOTÃO DE LOGOUT ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                // O onAuthStateChanged vai lidar com o redirecionamento para login.html.
                console.log('Logout bem-sucedido.');
            }).catch(error => {
                console.error('Erro ao fazer logout:', error);
            });
        });
    }

});