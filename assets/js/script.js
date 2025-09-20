document.addEventListener('DOMContentLoaded', () => {
    
    // Lógica para o smooth scroll para âncoras
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') { return; }
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- LÓGICA PARA A GALERIA DE LOJAS ---
    const mainStoreImage = document.getElementById('main-store-image');
    const storeThumbnails = document.querySelectorAll('.store-thumbnail img');
    const activeThumbnailWrapperClass = 'active-thumbnail-wrapper';
    if (mainStoreImage && storeThumbnails.length > 0) {
        storeThumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainStoreImage.style.opacity = '0.5';
                setTimeout(() => {
                    mainStoreImage.src = this.src;
                    mainStoreImage.style.opacity = '1';
                }, 150);
                storeThumbnails.forEach(t => {
                    t.classList.remove('active-thumbnail');
                    t.parentElement.classList.remove(activeThumbnailWrapperClass);
                });
                this.classList.add('active-thumbnail');
                this.parentElement.classList.add(activeThumbnailWrapperClass);
            });
        });
    }

    // --- LÓGICA DO CARROSSEL DE MINIATURAS ---
    const prevButton = document.querySelector('.thumbnail-arrow.prev');
    const nextButton = document.querySelector('.thumbnail-arrow.next');
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    const thumbnailTrack = document.querySelector('.thumbnail-track');
    if (prevButton && nextButton && thumbnailsContainer && thumbnailTrack) {
        let currentPosition = 0;
        const handleCarouselMove = () => {
            const containerWidth = thumbnailsContainer.clientWidth;
            let maxScroll = thumbnailTrack.scrollWidth - containerWidth;
            if (maxScroll < 0) maxScroll = 0;
            if (currentPosition < 0) currentPosition = 0;
            if (currentPosition > maxScroll) currentPosition = maxScroll;
            thumbnailTrack.style.transform = `translateX(-${currentPosition}px)`;
        };
        nextButton.addEventListener('click', () => {
            const containerWidth = thumbnailsContainer.clientWidth;
            const maxScroll = thumbnailTrack.scrollWidth - containerWidth;
            if (currentPosition < maxScroll) {
                currentPosition += containerWidth;
                handleCarouselMove();
            }
        });
        prevButton.addEventListener('click', () => {
            const containerWidth = thumbnailsContainer.clientWidth;
            if (currentPosition > 0) {
                currentPosition -= containerWidth;
                handleCarouselMove();
            }
        });
        window.addEventListener('resize', () => {
            currentPosition = 0;
            handleCarouselMove();
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
        setInterval(updateVoucherCount, 45000);
    }

    // Lógica para o acordeão do FAQ com jQuery
    $('.raza-faq-question').on('click', function() {
        const item = $(this).closest('.raza-faq-item');
        const answer = item.find('.raza-faq-answer');
        $('.raza-faq-item').not(item).removeClass('active').find('.raza-faq-answer').css('max-height', '0px');
        item.toggleClass('active');
        if (item.hasClass('active')) {
            answer.css('max-height', answer.prop('scrollHeight') + 'px');
        } else {
            answer.css('max-height', '0px');
        }
    });

    // Função para o botão "Retornar ao topo"
    $('#back-to-top').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 600);
    });


    // --- INÍCIO: LÓGICA DE ENVIO DO FORMULÁRIO PARA A CLOUD FUNCTION COM RECAPTCHA ---
    const leadForm = document.querySelector('.capture-form');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const form = this;
            const submitButton = form.querySelector('.form-submit-button');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'ENVIANDO...';

            grecaptcha.ready(function() {
                // NOVA CHAVE DE SITE INSERIDA AQUI
                grecaptcha.execute('6LcFeM8rAAAAAG_yvOemcZ1ivd14z9svaddS0Bk1', {action: 'submit'}).then(async function(token) {

                    const urlParams = new URLSearchParams(window.location.search);
                    const path = window.location.pathname;
                    const pageFileName = path.substring(path.lastIndexOf('/') + 1);
                    const campaignFromUrl = pageFileName.replace('.html', '');
                    const defaultCampaign = campaignFromUrl || 'site-principal';

                    const leadOrigem = {
                        campaign: urlParams.get('utm_campaign') || defaultCampaign,
                        source: urlParams.get('utm_source') || 'direto',
                        medium: urlParams.get('utm_medium') || 'nenhum',
                        content: urlParams.get('utm_content') || 'nao-aplicavel'
                    };

                    const leadData = {
                        unidade: form.querySelector('#unit').value,
                        nome: form.querySelector('#name').value,
                        telefone: form.querySelector('#phone').value,
                        email: form.querySelector('#email').value,
                        origem: leadOrigem,
                        recaptchaToken: token
                    };

                    try {
                        const response = await fetch('https://us-central1-raza-oticas-landing-pages.cloudfunctions.net/submitLead', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(leadData)
                        });

                        if (!response.ok) {
                            const errorResult = await response.json();
                            throw new Error(errorResult.message || 'Falha ao enviar dados.');
                        }

                        window.location.href = 'obrigado.html';

                    } catch (error) {
                        console.error("Erro ao enviar o formulário para a Cloud Function:", error);
                        alert(error.message || 'Houve um erro ao enviar seu cadastro. Por favor, tente novamente.');
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                });
            });
        });
    }
    // --- FIM: LÓGICA DE ENVIO DO FORMULÁRIO ---

});