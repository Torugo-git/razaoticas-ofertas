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


    // --- INÍCIO: LÓGICA DE ENVIO DO FORMULÁRIO PARA O FIREBASE ---
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyAEzMahSewwMBFXKrPjYIJqW7eHDlfiB8U",
            authDomain: "raza-oticas-landing-pages.firebaseapp.com",
            projectId: "raza-oticas-landing-pages",
            storageBucket: "raza-oticas-landing-pages.appspot.com",
            messagingSenderId: "248156217813",
            appId: "1:248156217813:web:409956bfa071bdcc1c9d5c",
            measurementId: "G-VJD5D9KNQX"
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        const leadForm = document.querySelector('.capture-form');
        
        if (leadForm) {
            leadForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitButton = leadForm.querySelector('.form-submit-button');
                submitButton.disabled = true;
                submitButton.textContent = 'ENVIANDO...';

                // --- INÍCIO DA LÓGICA CORRIGIDA ---
                const urlParams = new URLSearchParams(window.location.search);
                
                // Pega o nome do arquivo da URL (ex: "promo-70off.html")
                const path = window.location.pathname;
                const pageFileName = path.substring(path.lastIndexOf('/') + 1);
                
                // Remove a extensão ".html" e define como campanha padrão
                const campaignFromUrl = pageFileName.replace('.html', '');
                
                // Usa o nome da página como padrão, ou um valor genérico se estiver na raiz
                const defaultCampaign = campaignFromUrl || 'site-principal';

                const leadOrigem = {
                    campaign: urlParams.get('utm_campaign') || defaultCampaign, // USA O VALOR DINÂMICO
                    source: urlParams.get('utm_source') || 'direto', // Origem (facebook, google)
                    medium: urlParams.get('utm_medium') || 'nenhum', // Mídia (cpc, social)
                    content: urlParams.get('utm_content') || 'nao-aplicavel' // Anúncio específico (video, imagem_azul)
                };
                // --- FIM DA LÓGICA CORRIGIDA ---

                const leadData = {
                    unidade: leadForm.querySelector('#unit').value,
                    nome: leadForm.querySelector('#name').value,
                    telefone: leadForm.querySelector('#phone').value,
                    email: leadForm.querySelector('#email').value,
                    origem: leadOrigem,
                    dataCadastro: new Date()
                };

                try {
                    await db.collection('leads').add(leadData);
                    window.location.href = 'obrigado.html';
                } catch (error) {
                    console.error("Erro ao salvar os dados no Firestore:", error);
                    alert('Houve um erro ao enviar seu cadastro. Por favor, tente novamente.');
                    submitButton.disabled = false;
                    submitButton.textContent = 'GARANTIR MEU VOUCHER!';
                }
            });
        }
    } catch (error) {
        console.error("Erro ao inicializar o Firebase ou configurar o formulário:", error);
    }
    // --- FIM: LÓGICA DE ENVIO DO FORMULÁRIO PARA O FIREBASE ---

});