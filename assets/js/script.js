document.addEventListener('DOMContentLoaded', () => {
    
    // Lógica para o smooth scroll para âncoras
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

    // --- NOVA LÓGICA PARA A GALERIA DE LOJAS ---
    const mainStoreImage = document.getElementById('main-store-image');
    const storeThumbnails = document.querySelectorAll('.store-thumbnail img');
    const activeThumbnailWrapperClass = 'active-thumbnail-wrapper';

    if (mainStoreImage && storeThumbnails.length > 0) {
        storeThumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Efeito de fade na imagem principal para suavizar a troca
                mainStoreImage.style.opacity = '0.5';

                setTimeout(() => {
                    mainStoreImage.src = this.src;
                    mainStoreImage.style.opacity = '1';
                }, 150);

                // Remove a classe de destaque de todas as miniaturas
                storeThumbnails.forEach(t => {
                    t.classList.remove('active-thumbnail');
                    t.parentElement.classList.remove(activeThumbnailWrapperClass);
                });
                
                // Adiciona a classe de destaque na miniatura clicada
                this.classList.add('active-thumbnail');
                this.parentElement.classList.add(activeThumbnailWrapperClass);
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

    // Lógica para o acordeão do FAQ com jQuery
    $('.raza-faq-question').on('click', function() {
        const item = $(this).closest('.raza-faq-item');
        const answer = item.find('.raza-faq-answer');

        // Fecha outros itens abertos e remove a classe 'active'
        $('.raza-faq-item').not(item).removeClass('active').find('.raza-faq-answer').css('max-height', '0px');
        
        // Alterna (toggle) a classe e a altura do item clicado
        item.toggleClass('active');
        if (item.hasClass('active')) {
            answer.css('max-height', answer.prop('scrollHeight') + 'px');
        } else {
            answer.css('max-height', '0px');
        }
    });

});

