document.addEventListener('DOMContentLoaded', () => {
    // Lógica para o acordeão do FAQ
    const faqDetails = document.querySelectorAll('.faq-item details');

    faqDetails.forEach(details => {
        details.addEventListener('toggle', event => {
            // Se o item atual foi aberto, fecha todos os outros.
            if (details.open) {
                faqDetails.forEach(otherDetails => {
                    if (otherDetails !== details) {
                        otherDetails.removeAttribute('open');
                    }
                });
            }
        });
    });

    // Opcional: Lógica para o smooth scroll para âncoras
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
