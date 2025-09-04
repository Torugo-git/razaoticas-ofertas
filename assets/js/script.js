$(document).ready(function() {
    
    // Opcional: Lógica para o smooth scroll para âncoras
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const targetId = $(this).attr('href');
        const targetElement = $(targetId);
        if (targetElement.length) {
            $('html, body').animate({
                scrollTop: targetElement.offset().top
            }, 'smooth');
        }
    });

    // Lógica para a galeria de lojas interativa
    const mainStoreImage = $('#main-store-image');
    const thumbnails = $('.thumbnail');

    if (mainStoreImage.length && thumbnails.length) {
        thumbnails.on('click', function() {
            const newSrc = $(this).attr('src');
            mainStoreImage.attr('src', newSrc);
            
            thumbnails.removeClass('active-thumbnail');
            $(this).addClass('active-thumbnail');
        });
    }

    // Lógica para o banner de contagem
    const voucherElement = $('#voucher-count');
    if (voucherElement.length) {
        let voucherCount = parseInt(voucherElement.text(), 10);
        const minVouchers = 5;

        const updateVoucherCount = () => {
            if (voucherCount > minVouchers) {
                voucherCount--;
                voucherElement.text(voucherCount);
            }
        };
        setInterval(updateVoucherCount, 45000); // Diminui a cada 45 segundos
    }

    // LÓGICA DO ACORDEÃO FAQ (Funcionará agora que o script incompatível foi removido)
    $('.raza-faq-question').on('click', function() {
        const currentItem = $(this).parent('.raza-faq-item');
        const currentAnswer = currentItem.find('.raza-faq-answer');
        
        // Verifica se o item clicado já está ativo
        const wasActive = currentItem.hasClass('active');

        // Fecha todos os outros itens e remove a classe 'active'
        // Anima o fechamento
        $('.raza-faq-item').removeClass('active');
        $('.raza-faq-answer').animate({'max-height': '0px'}, 300);
        
        // Se o item clicado não estava ativo, abre-o
        if (!wasActive) {
            currentItem.addClass('active');
            // Anima a abertura definindo o max-height para a altura real do conteúdo
            currentAnswer.animate({'max-height': currentAnswer.prop('scrollHeight') + 'px'}, 300);
        }
    });

});

