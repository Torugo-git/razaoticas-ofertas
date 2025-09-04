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
    // Lógica para o carrossel de depoimentos
    const slides = document.querySelectorAll('.testimonial-slide');
    if (slides.length > 0) {
        const nextBtn = document.querySelector('.carousel-control.next');
        const prevBtn = document.querySelector('.carousel-control.prev');
        let currentSlide = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.remove('active-slide');
                if (i === index) {
                    slide.classList.add('active-slide');
                }
            });
        };

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });

        // Inicia o carrossel
        showSlide(currentSlide);
    }

    // Lógica para a galeria de lojas interativa
    const mainStoreImage = document.getElementById('main-store-image');
    const thumbnails = document.querySelectorAll('.thumbnail');

    if (mainStoreImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Atualiza o src da imagem principal
                mainStoreImage.src = this.src;

                // Atualiza a classe ativa na miniatura
                thumbnails.forEach(t => t.classList.remove('active-thumbnail'));
                this.classList.add('active-thumbnail');
            });
        });
    }

    // Lógica para o banner de contagem
    const voucherElement = document.getElementById('voucher-count');
    if (voucherElement) {
        let voucherCount = parseInt(voucherElement.textContent, 10);
        const minVouchers = 5;

        const updateVoucherCount = () => {
            if (voucherCount > minVouchers) {
                voucherCount--;
                voucherElement.textContent = voucherCount;
            }
        };

        // Diminui a cada 45 segundos
        setInterval(updateVoucherCount, 45000);
    }

    // Lógica para o carrossel de marcas
    const brandsCarousel = $(".brands-carousel-container");
    if (brandsCarousel.length) {
        brandsCarousel.swipe({
            swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
                const track = $(this).find('.brands-carousel-track');
                if (direction === 'left' || direction === 'right') {
                    track.css('animation-play-state', 'paused');
                    setTimeout(function() {
                        track.css('animation-play-state', 'running');
                    }, 3000); // Pausa por 3 segundos
                }
            },
            threshold: 75 // Sensibilidade do swipe
        });
    }
});
