const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIj5rQkpizqiOqJYlUdYmefOyPMbhmquaqlHpN76dmlZ8S7pV_O-eEgRjQjkZMD14NnQ/exec"; 
    const SIFRE_API_URL = "https://script.google.com/macros/s/AKfycbzH3YQxw_6r0i7uItFStlp2nkUzmxaPhUw_v1u8hs6swV6lqY9XXRZ3Q5x64C5vpPEROQ/exec"; 
    const ODEV_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcjHGzdFq96J7JD9YKJJE20DEUqQLgfdzilAci7kpUVS-lHMFM25a39zdvxeaOPhtgjw/exec"; 
    
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.onkeydown = function(e) { if(e.keyCode === 123 || (e.ctrlKey && e.keyCode === 85)) return false; };

    let ogrenci = {};
    let aktifTest = null;
    let suankiSorular = [];
    let timerInterval;
    let baslangicZamani;
    let flagged = {}; 
    let ihlalSayisi = 0;
    let autoSaveData = {};
    let aktifOda = null;
    let aktifMateryaller = [];
	
    const AKTIF_DUYURU_VERSIYONU = "duyuru_v1";

    let fcCurrentIndex = 0;
    let fcAktifKartlar = [];
    let videoPlayer = null;

    /* --- YENİ HAMBURGER MENÜ VE REHBER JAVASCRIPT MOTORU --- */
    function menuToggle(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.toggle('active');
    }

    function rehberGoster() { 
        document.getElementById('rehberModal').style.display = 'block'; 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
    
    function rehberKapat() { document.getElementById('rehberModal').style.display = 'none'; }
    /* -------------------------------------------------------- */

    function enableDragScroll(slider) {
        let isDown = false; let startX; let scrollLeft;
        slider.addEventListener('mousedown', (e) => { isDown = true; slider.classList.add('active'); startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
        slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('active'); });
        slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('active'); });
        slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - slider.offsetLeft; const walk = (x - startX) * 2; slider.scrollLeft = scrollLeft - walk; });
    }

    function scrollKonu(direction) {
        const container = document.getElementById('konuFiltreleri');
        if(container) { container.scrollLeft += direction * 200; }
    }

    function sekmeDegistir(hedef) {
        document.getElementById('btnTabTestler').classList.remove('active');
        document.getElementById('btnTabMateryaller').classList.remove('active');
        document.getElementById('tabTestler').classList.remove('active');
        document.getElementById('tabMateryaller').classList.remove('active');
        
        if(hedef === 'testler') {
            document.getElementById('btnTabTestler').classList.add('active');
            document.getElementById('tabTestler').classList.add('active');
        } else {
            document.getElementById('btnTabMateryaller').classList.add('active');
            document.getElementById('tabMateryaller').classList.add('active');
            if (typeof kategorilereDon === 'function') kategorilereDon();
        }
    }

    function baslatFlashcard(odaId) {
        if(typeof BILGI_KARTLARI === 'undefined' || !BILGI_KARTLARI[odaId] || BILGI_KARTLARI[odaId].length === 0) {
            alert("Öğretmeniniz bu üniteye henüz kavram kartı eklememiş.");
            return;
        }
        fcAktifKartlar = BILGI_KARTLARI[odaId];
        fcCurrentIndex = 0;
        document.getElementById('flashcardModal').style.display = 'block';
        gosterFlashcard();
    }

    function gosterFlashcard() {
        const kart = document.getElementById('flashcardElement');
        kart.classList.remove('is-flipped');
        
        setTimeout(() => {
            document.getElementById('fcTerm').innerText = fcAktifKartlar[fcCurrentIndex].terim;
            document.getElementById('fcDef').innerText = fcAktifKartlar[fcCurrentIndex].anlam;
            document.getElementById('fcCounter').innerText = (fcCurrentIndex + 1) + " / " + fcAktifKartlar.length;
        }, 150);
    }

    function fcCevir() { document.getElementById('flashcardElement').classList.toggle('is-flipped'); }
    function fcIleri() { if(fcCurrentIndex < fcAktifKartlar.length - 1) { fcCurrentIndex++; gosterFlashcard(); } }
    function fcGeri() { if(fcCurrentIndex > 0) { fcCurrentIndex--; gosterFlashcard(); } }
    function fcKapat() { document.getElementById('flashcardModal').style.display = 'none'; }

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') { 
            const modals = document.querySelectorAll('.modal'); 
            modals.forEach(modal => { if (modal.style.display === 'block') { modal.style.display = 'none'; } }); 
            const fcModal = document.getElementById('flashcardModal');
            if (fcModal && fcModal.style.display === 'block') { fcModal.style.display = 'none'; }
            videoKapat(); 
        }
        if(document.getElementById('flashcardModal').style.display === 'block') {
            if(event.key === 'ArrowRight') fcIleri();
            if(event.key === 'ArrowLeft') fcGeri();
            if(event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); fcCevir(); }
        }
    });

    function youtubeIdCikar(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function oynatVideo(url, baslik, element) {
        if(url === "#") {
            alert("Öğretmeniniz bu video içeriğini henüz yüklemedi."); return;
        }
        
        const videoId = youtubeIdCikar(url);
        if (!videoId) {
            alert("Geçerli bir YouTube linki bulunamadı. Lütfen öğretmeninize bildirin.");
            return;
        }

        const inlineContainer = document.getElementById('inlineVideoContainer');
        
        if (inlineContainer.previousElementSibling === element && !inlineContainer.classList.contains('hidden')) {
            videoKapat();
            return;
        }

        document.getElementById('inlineVideoBaslik').innerText = baslik;
        element.parentNode.insertBefore(inlineContainer, element.nextSibling);
        inlineContainer.classList.remove('hidden');

        if (!videoPlayer) {
            const iframe = document.getElementById('youtubeIframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?origin=https://plyr.io&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
            
            videoPlayer = new Plyr('#player', {
                youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
            });
        } else {
            videoPlayer.source = {
                type: 'video',
                sources: [
                    { src: videoId, provider: 'youtube' }
                ]
            };
        }
        
        setTimeout(() => { inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    }

    function videoKapat() {
        const inlineContainer = document.getElementById('inlineVideoContainer');
        if (inlineContainer) {
            inlineContainer.classList.add('hidden');
            if (videoPlayer) { videoPlayer.stop(); }
            document.body.appendChild(inlineContainer); 
        }
    }

    function oynatPdf(url, baslik, element) {
        if(url === "#") { alert("Öğretmeniniz bu dokümanı henüz yüklemedi."); return; }

        const inlineContainer = document.getElementById('inlinePdfContainer');
        if (inlineContainer.previousElementSibling === element && !inlineContainer.classList.contains('hidden')) {
            pdfKapat(); return;
        }

        document.getElementById('inlinePdfBaslik').innerText = baslik;
        element.parentNode.insertBefore(inlineContainer, element.nextSibling);
        inlineContainer.classList.remove('hidden');

        let isleyiciUrl = url;
        if (!url.includes('drive.google.com')) {
            isleyiciUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true';
        }

        document.getElementById('pdfIframe').src = isleyiciUrl;
        setTimeout(() => { inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    }

    function pdfKapat() {
        const inlineContainer = document.getElementById('inlinePdfContainer');
        if (inlineContainer) {
            inlineContainer.classList.add('hidden');
            document.getElementById('pdfIframe').src = ""; 
            document.body.appendChild(inlineContainer); 
        }
    }
	function materyalleriYukle(uniteId) {
        aktifMateryaller = [];
        
        if (uniteId === 'u1') {
            aktifMateryaller = [
                { baslik: "Tarih Bilimine Giriş", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Zaman ve Takvim", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Tarihe Yardımcı Bilimler", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Göbeklitepe Gizemi", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Tarih Yazıcılığı", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Bir Savaş Makinesinin Analizi - Roma Ordusu (Kuruluştan İtibaren Tüm Aşamalarıyla) (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Bir%20Sava%C5%9F%20Makinesinin%20Analizi%20-%20Roma%20Ordusu%20(Kurulu%C5%9Ftan%20%C4%B0tibaren%20T%C3%BCm%20A%C5%9Famalar%C4%B1yla).mp3" },
                { baslik: "Büyük İskender Nasıl Başarılı Oldu 12 Yılda Dünya Tarihini Nasıl Değiştirdi (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-B%C3%BCy%C3%BCk%20%C4%B0skender%20Nas%C4%B1l%20Ba%C5%9Far%C4%B1l%C4%B1%20Oldu%2012%20Y%C4%B1lda%20D%C3%BCnya%20Tarihini%20Nas%C4%B1l%20De%C4%9Fi%C5%9Ftirdi.m4a" },
				{ baslik: "Xenophon-Anabasis-On Binlerin Yürüyüşü (TRT Radyo Tiyatrosu)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Radyo%20Tiyatrolar%C4%B1/Xenophon-Anabasis-On%20Binlerin%20Y%C3%BCr%C3%BCy%C3%BC%C5%9F%C3%BC.mp3" },
				{ baslik: "Hannibal Barca Alpleri Nasıl Geçti - Tarihin En Tehlikeli Askeri Harekatı (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Hannibal%20Barca%20Alpleri%20Nas%C4%B1l%20Ge%C3%A7ti%20-%20Tarihin%20En%20Tehlikeli%20Askeri%20Harekat%C4%B1.mp3" },
				{ baslik: "Truvalı Helen - İhtirasın, İhanetin ve Savaşın Öyküsü (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Truval%C4%B1%20Helen%20-%20%C4%B0htiras%C4%B1n%2C%20%C4%B0hanetin%20ve%20Sava%C5%9F%C4%B1n%20%C3%96yk%C3%BCs%C3%BC.mp3" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
                { baslik: "Geçmişten Geleceğe", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "İnsanlığın Hafızası Tarih", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/1-%20%C4%B0nsanl%C4%B1%C4%9F%C4%B1n%20Haf%C4%B1zas%C4%B1%20Tarih.pdf" },
				{ baslik: "Neden Tarih", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/2-%20Neden%20Tarih.pdf" },
				{ baslik: "Zamanın Taksimi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/3-%20Zaman%C4%B1n%20Taksimi.pdf" },
				{ baslik: "Notİsmi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "NotLinki" },
				{ baslik: "Notİsmi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "NotLinki" },
				{ baslik: "Notİsmi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "NotLinki" },
				{ baslik: "Tarih Öğrenmenin Faydaları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/1.%20%C3%9Cnite/1-Tarih%20%C3%96%C4%9Frenmenin%20Faydalar%C4%B1.pdf" },
				{ baslik: "Tarih Araştırma ve Yazımında Dijital Dönüşüm", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/1.%20%C3%9Cnite/2-Dijitalle%C5%9Fme.pdf" },
                { baslik: "Kavram Haritası", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "Tarih Çalışma Kağıdı", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "Zaman Çizelgesi", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        } else if (uniteId === 'u2') {
            aktifMateryaller = [
                { baslik: "Mezopotamya Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Z4cZjZZBsjg" },
                { baslik: "Anadolu Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Xom434ZL6_c" },
                { baslik: "Doğu Akdeniz, Ege, Yunan ve Makedonya Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/ri7U-d9jk-A" },
				{ baslik: "İran ve Mısır Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Qe3jmh0CR1M" },
				{ baslik: "Çin ve Hint Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/8ABBovKfDes" },
				{ baslik: "İskitler ve Hunlar", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/jY5sMXqR2o8" },
				{ baslik: "Roma Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Ke1Y8whiatA" },
				{ baslik: "Eskiçağ Uygarlıkları (Genel Özet)", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/o8AEWSe5hio" },
                { baslik: "Sümerlerin İzinde", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Antik Mısırın Ünlü Firavunu II. Ramses ve Kadeş Savaşı", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/kronik-2.ramses%20ve%20kade%C5%9F%20savasi.mp3" },
                { baslik: "Cengiz Han'ın Komutanları - Bozkırın Demir Adamları (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Cengiz%20Han'%C4%B1n%20Komutanlar%C4%B1%20-%20Bozk%C4%B1r%C4%B1n%20Demir%20Adamlar%C4%B1.mp3" },
				{ baslik: "Moğolların Askeri Yapısı - Taktik, Organizasyon ve Strateji (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Mo%C4%9Follar%C4%B1n%20Askeri%20Yap%C4%B1s%C4%B1%20-%20Taktik%20%26%20Organizasyon%20%26%20Strateji.mp3" },
				{ baslik: "Moğolların Savaş Taktikleri - Düşmanlarını Nasıl Yendiler (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Mo%C4%9Follar%C4%B1n%20Sava%C5%9F%20Taktikleri%20-%20D%C3%BC%C5%9Fmanlar%C4%B1n%C4%B1%20Nas%C4%B1l%20Yendiler.mp3" },
				{ baslik: "Mete Han - Bozkırın Efendisi (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Mete%20Han%20-%20Bozk%C4%B1r%C4%B1n%20Efendisi.mp3" },
				{ baslik: "Şamanizm Nedir İlkeleri ve Kökenleri (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-%C5%9Eamanizm%20Nedir%20%C4%B0lkeleri%20ve%20K%C3%B6kenleri.mp3" },
				{ baslik: "Papalığın Kuruluşu - Bir Balıkçı Avrupa'nın Kaderini Nasıl Değiştirdi (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Papal%C4%B1%C4%9F%C4%B1n%20Kurulu%C5%9Fu%20-%20Bir%20Bal%C4%B1k%C3%A7%C4%B1%20Avrupa'n%C4%B1n%20Kaderini%20Nas%C4%B1l%20De%C4%9Fi%C5%9Ftirdi.mp3" },
				{ baslik: "Ortaçağda Bir İlimler Akademisi - Beytü'l Hikme (İslam'ın Altın Çağı) (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Orta%C3%A7a%C4%9Fda%20Bir%20%C4%B0limler%20Akademisi%20-%20Beyt%C3%BC'l%20Hikme%20(%C4%B0slam'%C4%B1n%20Alt%C4%B1n%20%C3%87a%C4%9F%C4%B1).mp3" },
                { baslik: "İnsanlığın İlk İzleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/4-%20%C4%B0nsanl%C4%B1%C4%9F%C4%B1n%20%C4%B0lk%20%C4%B0zleri.pdf" },
                { baslik: "Yazının Gelişimi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/5-%20Yaz%C4%B1n%C4%B1n%20Geli%C5%9Fimi.pdf" },
				{ baslik: "İlk Çağ'da Yeryüzündeki Belli Başlı Medeniyet Havzaları", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/6-%20%C4%B0lk%20%C3%87a%C4%9F'da%20Yery%C3%BCz%C3%BCndeki%20Belli%20Ba%C5%9Fl%C4%B1%20Medeniyet%20Havzalar%C4%B1.pdf" },
				{ baslik: "İnsan ve Göç", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/8-%20%C4%B0nsan%20ve%20G%C3%B6%C3%A7.pdf" },
				{ baslik: " İlk Çağ'ın Tüccar Toplulukları", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/9-%20%C4%B0lk%20%C3%87a%C4%9F'%C4%B1n%20T%C3%BCccar%20Topluluklar%C4%B1.pdf" },
				{ baslik: "Kabileden Devlete", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/10-%20Kabileden%20Devlete.pdf" },
				{ baslik: "Kanunlar Doğuyor", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/11-%20Kanunlar%20Do%C4%9Fuyor.pdf" },
				{ baslik: "Artı Üründen Sosyal Sınıflara", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/14-%20Art%C4%B1%20%C3%9Cr%C3%BCnden%20Sosyal%20S%C4%B1n%C4%B1flara.pdf" },
				{ baslik: "Mezopotamya Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/1-Mezopotamya%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "Anadolu Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/2-Anadolu%20ve%20Mezopotamya.pdf" },
				{ baslik: "Anadolu ve Mezopotamya Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/3-Mezopotamya%20ve%20Anadolu.pdf" },
				{ baslik: "Doğu Akdeniz, Ege, Yunan ve Makedonya Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/4-Do%C4%9Fu%20Akdeniz%2C%20Ege%2C%20Yunan%20ve%20Makedonya%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "Mısır ve İran Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/5-M%C4%B1s%C4%B1r%20ve%20%C4%B0ran%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "Çin ve Hint Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/6-%C3%87in%20ve%20Hint%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "İskitler ve Sakalar", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/7-%C4%B0skitler%20ve%20Sakalar.pdf" },
				{ baslik: "Roma Uygarlığı", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/8-Roma%20Uygarl%C4%B1%C4%9F%C4%B1.pdf" },
				{ baslik: "Eskiçağ Uygarlıkları Genel Özet", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/8-Eski%C3%A7a%C4%9F%20Uygarl%C4%B1klar%C4%B1%20Genel%20%C3%96zet.pdf" },
                { baslik: "İlk Çağ Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" },
                { baslik: "Göç Yolları Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        } else if (uniteId === 'u3') {
            aktifMateryaller = [
                { baslik: "Orta Çağ'da Dünya", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Kavimler Göçü Etkileri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Feodalizm ve Şövalyeler", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Karanlık Çağ Belgeseli", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
                { baslik: "Roma'nın Çöküşü", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Orta Çağ Avrupa'sı", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Ticaret Yolları", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
				{ baslik: "Kavimler Göçü", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/18-%20Kavimler%20G%C3%B6%C3%A7%C3%BC.pdf" },
				{ baslik: "Orta Çağ'da Siyasi Yapılar", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/12-%20Orta%20%C3%87a%C4%9F'da%20Siyasi%20Yap%C4%B1lar.pdf" },
				{ baslik: "İmparatorluklarda Sosyal, Ekonomik ve Askeri Durum", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/13-%20%C4%B0mparatorluklarda%20Sosyal%2C%20Ekonomik%20ve%20Askeri%20Durum.pdf" },
				{ baslik: "Orta Çağ'da Ticaret", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/15-%20Orta%20%C3%87a%C4%9F'da%20Ticaret.pdf" },
				{ baslik: "Orta Çağ'da Ordu", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/29-%20Orta%20%C3%87a%C4%9F'da%20Ordu.pdf" },
				{ baslik: "Avrasya'da İlk Türk İzleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/31-%20Avrasya'da%20%C4%B0lk%20T%C3%BCrk%20%C4%B0zleri.pdf" },
				{ baslik: "Türklerde Coğrafya ile Oluşan Yaşam Tarzı", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/17-%20T%C3%BCrklerde%20Co%C4%9Frafya%20ile%20Olu%C5%9Fan%20Ya%C5%9Fam%20Tarz%C4%B1.pdf" },
				{ baslik: "İlk ve Orta Çağlarda Türk Dünyası", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/32-%20%C4%B0lk%20ve%20Orta%20%C3%87a%C4%9Flarda%20T%C3%BCrk%20D%C3%BCnyas%C4%B1.pdf" },
				{ baslik: "Boylardan Devlete", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/16-%20Boylardan%20Devlete.pdf" },
				{ baslik: "İlk Türk Devletlerinin Çevre Devletlerle İlişkileri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/19-%20%C4%B0lk%20T%C3%BCrk%20Devletlerinin%20%C3%87evre%20Devletlerle%20%C4%B0li%C5%9Fkileri.pdf" },
				{ baslik: " İlk Türk Devletleri ve Komşuları", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/20-%20%C4%B0lk%20T%C3%BCrk%20Devletleri%20ve%20Kom%C5%9Fular%C4%B1.pdf" },
				{ baslik: "İslamiyet'in Doğduğu Dönemde Dünya", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/21-%20%C4%B0slamiyet'in%20Do%C4%9Fdu%C4%9Fu%20D%C3%B6nemde%20D%C3%BCnya.pdf" },
				{ baslik: " İslamiyet Yayılıyor", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/22-%20%C4%B0slamiyet%20Yay%C4%B1l%C4%B1yor.pdf" },
				{ baslik: "Dört Halife Dönemi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/23-%20D%C3%B6rt%20Halife%20D%C3%B6nemi.pdf" },
				{ baslik: "Emeviler Devleti (661-750)", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/24-%20Emeviler%20Devleti%20(661-750).pdf" },
				{ baslik: "Abbasi Devleti ve Mısır'da Kurulan Türk-İslam Devletleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/25-%20Abbasi%20Devleti%20ve%20M%C4%B1s%C4%B1r'da%20Kurulan%20T%C3%BCrk-%C4%B0slam%20Devletleri.pdf" },
				{ baslik: "Bilim Medeniyeti", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/26-%20Bilim%20Medeniyeti.pdf" },
				{ baslik: "Türklerin İslamiyeti Kabulü", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/27-%20T%C3%BCrklerin%20%C4%B0slamiyeti%20Kabul%C3%BC.pdf" },
				{ baslik: " İslamiyet'in Türk Devlet ve Toplum Yapısına Etkisi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/28-%20%C4%B0slamiyet'in%20T%C3%BCrk%20Devlet%20ve%20Toplum%20Yap%C4%B1s%C4%B1na%20Etkisi.pdf" },
				{ baslik: "Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
                { baslik: "Kavimler Göçü Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" },
                { baslik: "İpek ve Baharat Yolu", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        }
    }
	function materyalleriYukle(uniteId) {
        aktifMateryaller = [];
        
        if (uniteId === 'u1') {
            aktifMateryaller = [
                { baslik: "Tarih Bilimine Giriş", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Zaman ve Takvim", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Tarihe Yardımcı Bilimler", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Göbeklitepe Gizemi", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Tarih Yazıcılığı", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Bir Savaş Makinesinin Analizi - Roma Ordusu (Kuruluştan İtibaren Tüm Aşamalarıyla) (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Bir%20Sava%C5%9F%20Makinesinin%20Analizi%20-%20Roma%20Ordusu%20(Kurulu%C5%9Ftan%20%C4%B0tibaren%20T%C3%BCm%20A%C5%9Famalar%C4%B1yla).mp3" },
                { baslik: "Büyük İskender Nasıl Başarılı Oldu 12 Yılda Dünya Tarihini Nasıl Değiştirdi (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-B%C3%BCy%C3%BCk%20%C4%B0skender%20Nas%C4%B1l%20Ba%C5%9Far%C4%B1l%C4%B1%20Oldu%2012%20Y%C4%B1lda%20D%C3%BCnya%20Tarihini%20Nas%C4%B1l%20De%C4%9Fi%C5%9Ftirdi.m4a" },
				{ baslik: "Xenophon-Anabasis-On Binlerin Yürüyüşü (TRT Radyo Tiyatrosu)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Radyo%20Tiyatrolar%C4%B1/Xenophon-Anabasis-On%20Binlerin%20Y%C3%BCr%C3%BCy%C3%BC%C5%9F%C3%BC.mp3" },
				{ baslik: "Hannibal Barca Alpleri Nasıl Geçti - Tarihin En Tehlikeli Askeri Harekatı (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Hannibal%20Barca%20Alpleri%20Nas%C4%B1l%20Ge%C3%A7ti%20-%20Tarihin%20En%20Tehlikeli%20Askeri%20Harekat%C4%B1.mp3" },
				{ baslik: "Truvalı Helen - İhtirasın, İhanetin ve Savaşın Öyküsü (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Truval%C4%B1%20Helen%20-%20%C4%B0htiras%C4%B1n%2C%20%C4%B0hanetin%20ve%20Sava%C5%9F%C4%B1n%20%C3%96yk%C3%BCs%C3%BC.mp3" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
                { baslik: "Geçmişten Geleceğe", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "İnsanlığın Hafızası Tarih", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/1-%20%C4%B0nsanl%C4%B1%C4%9F%C4%B1n%20Haf%C4%B1zas%C4%B1%20Tarih.pdf" },
				{ baslik: "Neden Tarih", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/2-%20Neden%20Tarih.pdf" },
				{ baslik: "Zamanın Taksimi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/3-%20Zaman%C4%B1n%20Taksimi.pdf" },
				{ baslik: "Notİsmi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "NotLinki" },
				{ baslik: "Notİsmi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "NotLinki" },
				{ baslik: "Notİsmi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "NotLinki" },
				{ baslik: "Tarih Öğrenmenin Faydaları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/1.%20%C3%9Cnite/1-Tarih%20%C3%96%C4%9Frenmenin%20Faydalar%C4%B1.pdf" },
				{ baslik: "Tarih Araştırma ve Yazımında Dijital Dönüşüm", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/1.%20%C3%9Cnite/2-Dijitalle%C5%9Fme.pdf" },
                { baslik: "Kavram Haritası", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "Tarih Çalışma Kağıdı", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "Zaman Çizelgesi", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        } else if (uniteId === 'u2') {
            aktifMateryaller = [
                { baslik: "Mezopotamya Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Z4cZjZZBsjg" },
                { baslik: "Anadolu Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Xom434ZL6_c" },
                { baslik: "Doğu Akdeniz, Ege, Yunan ve Makedonya Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/ri7U-d9jk-A" },
				{ baslik: "İran ve Mısır Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Qe3jmh0CR1M" },
				{ baslik: "Çin ve Hint Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/8ABBovKfDes" },
				{ baslik: "İskitler ve Hunlar", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/jY5sMXqR2o8" },
				{ baslik: "Roma Uygarlıkları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Ke1Y8whiatA" },
				{ baslik: "Eskiçağ Uygarlıkları (Genel Özet)", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/o8AEWSe5hio" },
                { baslik: "Sümerlerin İzinde", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Antik Mısırın Ünlü Firavunu II. Ramses ve Kadeş Savaşı", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/kronik-2.ramses%20ve%20kade%C5%9F%20savasi.mp3" },
                { baslik: "Cengiz Han'ın Komutanları - Bozkırın Demir Adamları (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Cengiz%20Han'%C4%B1n%20Komutanlar%C4%B1%20-%20Bozk%C4%B1r%C4%B1n%20Demir%20Adamlar%C4%B1.mp3" },
				{ baslik: "Moğolların Askeri Yapısı - Taktik, Organizasyon ve Strateji (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Mo%C4%9Follar%C4%B1n%20Askeri%20Yap%C4%B1s%C4%B1%20-%20Taktik%20%26%20Organizasyon%20%26%20Strateji.mp3" },
				{ baslik: "Moğolların Savaş Taktikleri - Düşmanlarını Nasıl Yendiler (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Mo%C4%9Follar%C4%B1n%20Sava%C5%9F%20Taktikleri%20-%20D%C3%BC%C5%9Fmanlar%C4%B1n%C4%B1%20Nas%C4%B1l%20Yendiler.mp3" },
				{ baslik: "Mete Han - Bozkırın Efendisi (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Mete%20Han%20-%20Bozk%C4%B1r%C4%B1n%20Efendisi.mp3" },
				{ baslik: "Şamanizm Nedir İlkeleri ve Kökenleri (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-%C5%9Eamanizm%20Nedir%20%C4%B0lkeleri%20ve%20K%C3%B6kenleri.mp3" },
				{ baslik: "Papalığın Kuruluşu - Bir Balıkçı Avrupa'nın Kaderini Nasıl Değiştirdi (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Papal%C4%B1%C4%9F%C4%B1n%20Kurulu%C5%9Fu%20-%20Bir%20Bal%C4%B1k%C3%A7%C4%B1%20Avrupa'n%C4%B1n%20Kaderini%20Nas%C4%B1l%20De%C4%9Fi%C5%9Ftirdi.mp3" },
				{ baslik: "Ortaçağda Bir İlimler Akademisi - Beytü'l Hikme (İslam'ın Altın Çağı) (Kronik Tarih)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Kronik%20Tarih/Kronik-Orta%C3%A7a%C4%9Fda%20Bir%20%C4%B0limler%20Akademisi%20-%20Beyt%C3%BC'l%20Hikme%20(%C4%B0slam'%C4%B1n%20Alt%C4%B1n%20%C3%87a%C4%9F%C4%B1).mp3" },
                { baslik: "İnsanlığın İlk İzleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/4-%20%C4%B0nsanl%C4%B1%C4%9F%C4%B1n%20%C4%B0lk%20%C4%B0zleri.pdf" },
                { baslik: "Yazının Gelişimi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/5-%20Yaz%C4%B1n%C4%B1n%20Geli%C5%9Fimi.pdf" },
				{ baslik: "İlk Çağ'da Yeryüzündeki Belli Başlı Medeniyet Havzaları", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/6-%20%C4%B0lk%20%C3%87a%C4%9F'da%20Yery%C3%BCz%C3%BCndeki%20Belli%20Ba%C5%9Fl%C4%B1%20Medeniyet%20Havzalar%C4%B1.pdf" },
				{ baslik: "İnsan ve Göç", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/8-%20%C4%B0nsan%20ve%20G%C3%B6%C3%A7.pdf" },
				{ baslik: " İlk Çağ'ın Tüccar Toplulukları", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/9-%20%C4%B0lk%20%C3%87a%C4%9F'%C4%B1n%20T%C3%BCccar%20Topluluklar%C4%B1.pdf" },
				{ baslik: "Kabileden Devlete", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/10-%20Kabileden%20Devlete.pdf" },
				{ baslik: "Kanunlar Doğuyor", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/11-%20Kanunlar%20Do%C4%9Fuyor.pdf" },
				{ baslik: "Artı Üründen Sosyal Sınıflara", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/14-%20Art%C4%B1%20%C3%9Cr%C3%BCnden%20Sosyal%20S%C4%B1n%C4%B1flara.pdf" },
				{ baslik: "Mezopotamya Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/1-Mezopotamya%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "Anadolu Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/2-Anadolu%20ve%20Mezopotamya.pdf" },
				{ baslik: "İyonya ve Lidya (Ekrem Akurgal)", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/%C4%B0yonya%20ve%20Lidya%20(Akurgal).pdf" },
				{ baslik: "Urartu ve Geç Hititler (Ekrem Akurgal)", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/Urartu%20ve%20Ge%C3%A7%20Hititler%20(Akurgal).pdf" },
				{ baslik: "Tunçtan Demire Anadolu (Ekrem Akurgal)", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/Tun%C3%A7tan_Demire_Anadolu.pdf" },
				{ baslik: "Anadolu ve Mezopotamya Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/3-Mezopotamya%20ve%20Anadolu.pdf" },
				{ baslik: "Doğu Akdeniz, Ege, Yunan ve Makedonya Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/4-Do%C4%9Fu%20Akdeniz%2C%20Ege%2C%20Yunan%20ve%20Makedonya%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "Mısır ve İran Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/5-M%C4%B1s%C4%B1r%20ve%20%C4%B0ran%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "Çin ve Hint Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/6-%C3%87in%20ve%20Hint%20Uygarl%C4%B1klar%C4%B1.pdf" },
				{ baslik: "İskitler ve Sakalar", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/7-%C4%B0skitler%20ve%20Sakalar.pdf" },
				{ baslik: "Roma Uygarlığı", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/8-Roma%20Uygarl%C4%B1%C4%9F%C4%B1.pdf" },
				{ baslik: "Eskiçağ Uygarlıkları Genel Özet", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/9.SinifSunular/2.Unite/8-Eski%C3%A7a%C4%9F%20Uygarl%C4%B1klar%C4%B1%20Genel%20%C3%96zet.pdf" },
                { baslik: "İlk Çağ Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" },
                { baslik: "Göç Yolları Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        } else if (uniteId === 'u3') {
            aktifMateryaller = [
                { baslik: "Orta Çağ'da Dünya", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Kavimler Göçü Etkileri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Feodalizm ve Şövalyeler", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Karanlık Çağ Belgeseli", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
				{ baslik: "Podcastİsmi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "PodcastLinki" },
                { baslik: "Roma'nın Çöküşü", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Orta Çağ Avrupa'sı", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Ticaret Yolları", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
				{ baslik: "Kavimler Göçü", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/18-%20Kavimler%20G%C3%B6%C3%A7%C3%BC.pdf" },
				{ baslik: "Orta Çağ'da Siyasi Yapılar", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/12-%20Orta%20%C3%87a%C4%9F'da%20Siyasi%20Yap%C4%B1lar.pdf" },
				{ baslik: "İmparatorluklarda Sosyal, Ekonomik ve Askeri Durum", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/13-%20%C4%B0mparatorluklarda%20Sosyal%2C%20Ekonomik%20ve%20Askeri%20Durum.pdf" },
				{ baslik: "Orta Çağ'da Ticaret", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/15-%20Orta%20%C3%87a%C4%9F'da%20Ticaret.pdf" },
				{ baslik: "Orta Çağ'da Ordu", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/29-%20Orta%20%C3%87a%C4%9F'da%20Ordu.pdf" },
				{ baslik: "Avrasya'da İlk Türk İzleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/31-%20Avrasya'da%20%C4%B0lk%20T%C3%BCrk%20%C4%B0zleri.pdf" },
				{ baslik: "Türklerde Coğrafya ile Oluşan Yaşam Tarzı", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/17-%20T%C3%BCrklerde%20Co%C4%9Frafya%20ile%20Olu%C5%9Fan%20Ya%C5%9Fam%20Tarz%C4%B1.pdf" },
				{ baslik: "İlk ve Orta Çağlarda Türk Dünyası", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/32-%20%C4%B0lk%20ve%20Orta%20%C3%87a%C4%9Flarda%20T%C3%BCrk%20D%C3%BCnyas%C4%B1.pdf" },
				{ baslik: "Boylardan Devlete", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/16-%20Boylardan%20Devlete.pdf" },
				{ baslik: "İlk Türk Devletlerinin Çevre Devletlerle İlişkileri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/19-%20%C4%B0lk%20T%C3%BCrk%20Devletlerinin%20%C3%87evre%20Devletlerle%20%C4%B0li%C5%9Fkileri.pdf" },
				{ baslik: " İlk Türk Devletleri ve Komşuları", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/20-%20%C4%B0lk%20T%C3%BCrk%20Devletleri%20ve%20Kom%C5%9Fular%C4%B1.pdf" },
				{ baslik: "İslamiyet'in Doğduğu Dönemde Dünya", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/21-%20%C4%B0slamiyet'in%20Do%C4%9Fdu%C4%9Fu%20D%C3%B6nemde%20D%C3%BCnya.pdf" },
				{ baslik: " İslamiyet Yayılıyor", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/22-%20%C4%B0slamiyet%20Yay%C4%B1l%C4%B1yor.pdf" },
				{ baslik: "Dört Halife Dönemi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/23-%20D%C3%B6rt%20Halife%20D%C3%B6nemi.pdf" },
				{ baslik: "Emeviler Devleti (661-750)", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/24-%20Emeviler%20Devleti%20(661-750).pdf" },
				{ baslik: "Abbasi Devleti ve Mısır'da Kurulan Türk-İslam Devletleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/25-%20Abbasi%20Devleti%20ve%20M%C4%B1s%C4%B1r'da%20Kurulan%20T%C3%BCrk-%C4%B0slam%20Devletleri.pdf" },
				{ baslik: "Bilim Medeniyeti", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/26-%20Bilim%20Medeniyeti.pdf" },
				{ baslik: "Türklerin İslamiyeti Kabulü", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/27-%20T%C3%BCrklerin%20%C4%B0slamiyeti%20Kabul%C3%BC.pdf" },
				{ baslik: " İslamiyet'in Türk Devlet ve Toplum Yapısına Etkisi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/9.%20S%C4%B1n%C4%B1f%20OGM/28-%20%C4%B0slamiyet'in%20T%C3%BCrk%20Devlet%20ve%20Toplum%20Yap%C4%B1s%C4%B1na%20Etkisi.pdf" },
				{ baslik: "Uygarlıkları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
                { baslik: "Kavimler Göçü Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" },
                { baslik: "İpek ve Baharat Yolu", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        }
    }

    function kategoriSec(hedefTur) {
        if(hedefTur === 'Flashcard') {
            baslatFlashcard(aktifOda);
            return;
        }

        document.getElementById('materyalKategorileri').classList.add('hidden');
        document.getElementById('materyalListesiAlani').classList.remove('hidden');
        
        const matAlani = document.getElementById('odaMateryalleri');
        matAlani.innerHTML = '';
        
        let filtrelenmis = aktifMateryaller.filter(m => {
            if (hedefTur === 'Video') return m.tur === 'Video Ders' || m.tur === 'Belgesel';
            return m.tur === hedefTur;
        });

        if(filtrelenmis.length === 0) {
            matAlani.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:20px; opacity:0.6; font-weight: bold;">Bu kategoride henüz materyal bulunmamaktadır.</div>';
            return;
        }

        filtrelenmis.forEach(m => {
            if (m.tur === 'Podcast') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="oynatPodcast('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}')">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>
                `;
            } else if (m.tur === 'Video Ders' || m.tur === 'Belgesel') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="oynatVideo('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>
                `;
            } else if (m.tur === 'PDF Not' || m.tur === 'Sunu') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="oynatPdf('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>
                `;
            } else {
                matAlani.innerHTML += `
                    <a href="${m.link}" target="_blank" class="mat-card">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </a>
                `;
            }
        });
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function oynatPodcast(link, baslik) {
        if(link === "#") { alert("Öğretmeniniz bu podcast içeriğini henüz yüklemedi."); return; }
        
        const playerContainer = document.getElementById('audioPlayerContainer');
        const playerAudio = document.getElementById('mainAudio');
        const playerTitle = document.getElementById('playerTitle');
        const floatingBtn = document.getElementById('iletisimBtnFloating');
        const playBtn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        
        playerTitle.innerText = baslik;
        playerAudio.src = link;
        playerContainer.classList.add('active');
        
        playerAudio.play().then(() => {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            iconBox.classList.add('playing');
        }).catch(e => {
            playBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
            iconBox.classList.remove('playing');
        });
        
        if (floatingBtn) floatingBtn.style.bottom = window.innerWidth <= 768 ? '155px' : '135px';
    }

    function kapatPlayer() {
        const playerContainer = document.getElementById('audioPlayerContainer');
        const playerAudio = document.getElementById('mainAudio');
        const floatingBtn = document.getElementById('iletisimBtnFloating');
        const iconBox = document.getElementById('podcastIconBox');
        const playBtn = document.getElementById('playPauseBtn');
        
        playerAudio.pause();
        playerAudio.src = "";
        playerContainer.classList.remove('active');
        iconBox.classList.remove('playing');
        playBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
        
        if (floatingBtn) floatingBtn.style.bottom = '25px';
    }

    function togglePlay() {
        const audio = document.getElementById('mainAudio');
        const btn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        
        if (audio.paused) {
            audio.play();
            btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            iconBox.classList.add('playing');
        } else {
            audio.pause();
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
            iconBox.classList.remove('playing');
        }
    }

    function skipAudio(seconds) {
        const audio = document.getElementById('mainAudio');
        audio.currentTime += seconds;
    }

    function updateProgress() {
        const audio = document.getElementById('mainAudio');
        const fill = document.getElementById('progressBarFill');
        const currentDisplay = document.getElementById('currentTimeDisplay');
        
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            fill.style.width = percent + '%';
            currentDisplay.innerText = formatTime(audio.currentTime);
        }
    }

    function setDuration() {
        const audio = document.getElementById('mainAudio');
        const durationDisplay = document.getElementById('durationDisplay');
        if(audio.duration) durationDisplay.innerText = formatTime(audio.duration);
    }

    function seekAudio(event) {
        const audio = document.getElementById('mainAudio');
        const bar = document.getElementById('progressBarBg');
        const clickX = event.clientX - bar.getBoundingClientRect().left;
        if(audio.duration) audio.currentTime = (clickX / bar.getBoundingClientRect().width) * audio.duration;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60); const sec = Math.floor(seconds % 60);
        return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function audioEnded() {
        document.getElementById('playPauseBtn').innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
        document.getElementById('podcastIconBox').classList.remove('playing');
        document.getElementById('progressBarFill').style.width = '0%';
        document.getElementById('currentTimeDisplay').innerText = '00:00';
    }

    function kategorilereDon() {
        document.getElementById('materyalKategorileri').classList.remove('hidden');
        document.getElementById('materyalListesiAlani').classList.add('hidden');
        const aramaInput = document.getElementById('materyalArama');
        if(aramaInput) { aramaInput.value = ""; document.getElementById('matAramaTemizle').style.display = 'none'; }
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function materyalAra() {
        const input = document.getElementById('materyalArama');
        const clearBtn = document.getElementById('matAramaTemizle');
        const filter = input.value.toLocaleLowerCase('tr-TR').trim();
        const matAlani = document.getElementById('odaMateryalleri');
        
        if (filter.length > 0) { 
            clearBtn.style.display = 'flex'; 
            document.getElementById('materyalKategorileri').classList.add('hidden');
            document.getElementById('materyalListesiAlani').classList.remove('hidden');
            
            let filtrelenmis = aktifMateryaller.filter(m => m.baslik.toLocaleLowerCase('tr-TR').includes(filter));
            matAlani.innerHTML = '';
            
            if(filtrelenmis.length === 0) {
                matAlani.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:20px; opacity:0.6; font-weight: bold;">Aradığınız kritere uygun materyal bulunamadı.</div>';
                return;
            }

            filtrelenmis.forEach(m => {
                if (m.tur === 'Podcast') {
                    matAlani.innerHTML += `
                        <div class="mat-card" style="cursor:pointer;" onclick="oynatPodcast('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}')">
                            <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                            <div class="mat-info">
                                <span class="mat-title">${m.baslik}</span>
                                <span class="mat-type">${m.tur}</span>
                            </div>
                        </div>
                    `;
                } else if (m.tur === 'Video Ders' || m.tur === 'Belgesel') {
                    matAlani.innerHTML += `
                        <div class="mat-card" style="cursor:pointer;" onclick="oynatVideo('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                            <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                            <div class="mat-info">
                                <span class="mat-title">${m.baslik}</span>
                                <span class="mat-type">${m.tur}</span>
                            </div>
                        </div>
                    `;
                } else if (m.tur === 'PDF Not' || m.tur === 'Sunu') {
                    matAlani.innerHTML += `
                        <div class="mat-card" style="cursor:pointer;" onclick="oynatPdf('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                            <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                            <div class="mat-info">
                                <span class="mat-title">${m.baslik}</span>
                                <span class="mat-type">${m.tur}</span>
                            </div>
                        </div>
                    `;
                } else {
                    matAlani.innerHTML += `
                        <a href="${m.link}" target="_blank" class="mat-card">
                            <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                            <div class="mat-info">
                                <span class="mat-title">${m.baslik}</span>
                                <span class="mat-type">${m.tur}</span>
                            </div>
                        </a>
                    `;
                }
            });
        } else { 
            clearBtn.style.display = 'none'; 
            kategorilereDon();
        }
    }

    function matAramaTemizleBtn() {
        const input = document.getElementById('materyalArama');
        input.value = "";
        materyalAra();
        input.focus();
    }

    function odayaGir(uniteId) {
        aktifOda = uniteId;
        document.getElementById('anaKlasorler').style.display = 'none';

        const oda = document.getElementById('sinavOdasi');
        const data = window.MENU_VERI ? window.MENU_VERI[uniteId] : null;
        
        if (!data) {
            alert("Sistem Hatası: Soru kataloğu yüklenemedi. Lütfen bağlantınızı kontrol ediniz.");
            salonaDon(); return;
        }

        document.getElementById('odaBasligi').innerText = data.baslik;

        sekmeDegistir('testler');
        materyalleriYukle(uniteId);

        const konular = new Set();
        data.testler.forEach(t => { if(!t.isKlasik && t.konu && t.konu !== "Geçmişin İnşa Sürecinde Tarih") konular.add(t.konu); });
        const hasKlasik = data.testler.some(t => t.isKlasik);

        const chipAlani = document.getElementById('konuFiltreleri');
        chipAlani.innerHTML = "<button class='konu-chip active' onclick=\"konuFiltrele('Tümü', this)\">Tümü</button>";
        
        konular.forEach(k => {
            const safeK = k.replace(/'/g, "\\'");
            chipAlani.innerHTML += "<button class='konu-chip' onclick=\"konuFiltrele('" + safeK + "', this)\">" + k + "</button>";
        });
        if (hasKlasik) {
            chipAlani.innerHTML += "<button class='konu-chip klasik' onclick=\"konuFiltrele('Klasik Sınavlar', this)\"><i class=\"fa-solid fa-pen-nib\"></i> Klasik Sınavlar</button>";
        }

        oda.classList.remove('hidden');
        enableDragScroll(chipAlani);
        konuFiltrele('Tümü', chipAlani.firstElementChild);
        
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function konuFiltrele(konuAdi, btnElement) {
        document.querySelectorAll('#konuFiltreleri .konu-chip').forEach(btn => btn.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');

        const aramaInput = document.getElementById('testArama');
        if(aramaInput) { aramaInput.value = ""; document.getElementById('aramaTemizle').style.display = 'none'; }

        const data = window.MENU_VERI[aktifOda];
        const testAlani = document.getElementById('odaTestleri');
        testAlani.innerHTML = '';

        const filtrelenmisTestler = data.testler.filter(t => {
            if (t.konu === "Geçmişin İnşa Sürecinde Tarih") return false;
            if (konuAdi === 'Tümü') return true;
            if (konuAdi === 'Klasik Sınavlar' && t.isKlasik) return true;
            return t.konu === konuAdi && !t.isKlasik;
        });

        if (filtrelenmisTestler.length === 0) {
            testAlani.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6; font-weight:bold;">Bu kritere uygun test bulunamadı.</div>';
        } else {
            let cozulenler = JSON.parse(localStorage.getItem('cozulenTestler')) || [];
            
            filtrelenmisTestler.forEach(t => {
                const row = document.createElement('div');
                row.className = "test-item-row " + (t.isKlasik ? "klasik" : "");
                const icon = t.isKlasik ? '<i class="fa-solid fa-pen-to-square"></i>' : '<i class="fa-solid fa-file-signature"></i>';
                
                let solvedBadge = cozulenler.includes(t.id) ? '<span style="color:#27ae60; font-size:12px; font-weight:bold; margin-left:10px; padding:3px 8px; background:rgba(39,174,96,0.1); border-radius:8px;"><i class="fa-solid fa-check"></i> Çözüldü</span>' : '';

                let rHtml = "<div class='test-item-left'><div class='test-item-icon'>" + icon + "</div><div class='test-item-info'>";
                rHtml += "<span class='test-item-title'>" + t.baslik + solvedBadge + "</span><span class='test-item-meta'>" + t.aciklama + "</span></div></div>";
                rHtml += "<button class='test-item-start-btn' onclick=\"testSec('" + t.id + "')\">Başla ►</button>";
                row.innerHTML = rHtml;
                testAlani.appendChild(row);
            });
        }
    }

    function salonaDon() {
        document.getElementById('sinavOdasi').classList.add('hidden');
        aktifOda = null;
        document.getElementById('anaKlasorler').style.display = 'grid';
    }

    window.onload = function() {
        const kayitliTema = localStorage.getItem('tema');
        const btnTema = document.getElementById('btnTema');
        
        if(kayitliTema !== null) { 
            document.body.className = kayitliTema;
            if(btnTema) {
                if(kayitliTema === 'dark-mode') btnTema.innerHTML = '<i class="fa-solid fa-scroll"></i>';
                else if(kayitliTema === 'sepia-mode') btnTema.innerHTML = '<i class="fa-solid fa-sun"></i>';
                else btnTema.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        } else {
            document.body.className = '';
            if(btnTema) btnTema.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('tema', '');
        }
        
        if(localStorage.getItem('fontSize')) {
            document.documentElement.style.setProperty('--font-size-base', localStorage.getItem('fontSize') + 'px');
        }
        
// --- YENİ SSO (EVRENSEL GİRİŞ) KONTROLÜ ---
        const globalZumre = localStorage.getItem('globalZumreOturumu');
        const sayfaNo = window.location.pathname.match(/\d+/) ? window.location.pathname.match(/\d+/)[0] : "9";
        const kayitliOgrenci = localStorage.getItem('aktifOgrenci' + sayfaNo);
        
        if(globalZumre) {
            // Öğretmen daha önce herhangi bir sınıftan girmişse, direkt kapıları aç.
            ogrenci = JSON.parse(globalZumre);
            document.getElementById("girisEkrani").classList.add("hidden");
            document.getElementById("menuEkrani").classList.remove("hidden");
            document.getElementById("kullaniciAdiSpan").innerText = ogrenci.ad;
            const btnSozluk = document.getElementById("btnSozluk");
            if(btnSozluk) btnSozluk.classList.remove("hidden");
            const btnDuyuru = document.getElementById("btnDuyuru");
            if (btnDuyuru) { btnDuyuru.classList.remove("hidden"); if(typeof duyuruRozetKontrol === 'function') duyuruRozetKontrol(); }
        } else if(kayitliOgrenci) {
            // Sadece bu sınıfa girmiş bir öğrenci varsa içeri al.
            ogrenci = JSON.parse(kayitliOgrenci);
            document.getElementById("girisEkrani").classList.add("hidden");
            document.getElementById("menuEkrani").classList.remove("hidden");
            document.getElementById("kullaniciAdiSpan").innerText = ogrenci.ad;
            const btnSozluk = document.getElementById("btnSozluk");
            if(btnSozluk) btnSozluk.classList.remove("hidden");
            const btnDuyuru = document.getElementById("btnDuyuru");
            if (btnDuyuru) { btnDuyuru.classList.remove("hidden"); if(typeof duyuruRozetKontrol === 'function') duyuruRozetKontrol(); }
        }

        const savedSession = localStorage.getItem('sinavSession');
        if (savedSession) {
            if(confirm("Yarım kalmış bir sınavınız var. Devam etmek ister misiniz?")) {
                restoreSession(JSON.parse(savedSession));
            } else {
                localStorage.removeItem('sinavSession');
            }
        }
        
        window.onbeforeunload = function() {
            if (!document.getElementById("testEkrani").classList.contains("hidden")) {
                return "Sınavınız bitmedi. Çıkarsanız verileriniz kaybolabilir.";
            }
        };
    };

    function temaCycle() {
        const body = document.body;
        const btnTema = document.getElementById('btnTema');
        const isDark = body.classList.contains('dark-mode');
        const isSepia = body.classList.contains('sepia-mode');

        if (!isDark && !isSepia) {
            body.classList.add('dark-mode');
            localStorage.setItem('tema', 'dark-mode');
            btnTema.innerHTML = '<i class="fa-solid fa-scroll"></i>';
        } else if (isDark) {
            body.classList.remove('dark-mode');
            body.classList.add('sepia-mode');
            localStorage.setItem('tema', 'sepia-mode');
            btnTema.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else if (isSepia) {
            body.classList.remove('sepia-mode');
            localStorage.setItem('tema', '');
            btnTema.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    function fontDegistir(delta) {
        const htmlRoot = document.documentElement;
        let currentStyle = getComputedStyle(htmlRoot).getPropertyValue('--font-size-base').trim();
        let currentSize = parseInt(currentStyle) || 16; 
        let newSize = currentSize + delta;
        if(newSize >= 14 && newSize <= 24) {
            htmlRoot.style.setProperty('--font-size-base', newSize + 'px');
            localStorage.setItem('fontSize', newSize);
        }
    }

function girisBasariliIslemleri(ogr) {
        // --- YENİ SSO (EVRENSEL GİRİŞ) MOTORU ---
        // Eğer giriş yapan bir öğretmense, onu evrensel "Zümre" hafızasına kaydet.
        if (ogr.ad.includes('(Zümre)') || ogr.ad.includes('(Öğretmen)')) {
            localStorage.setItem('globalZumreOturumu', JSON.stringify(ogr));
        } else {
            // Eğer öğrenciyse, sadece girdiği sınıfın yerel hafızasına kaydet.
            // Sınıf numarasını URL'den (sinif9.html vb.) otomatik olarak çekiyoruz.
            const sayfaNo = window.location.pathname.match(/\d+/) ? window.location.pathname.match(/\d+/)[0] : "9";
            localStorage.setItem('aktifOgrenci' + sayfaNo, JSON.stringify(ogr));
        }

        document.getElementById("girisEkrani").classList.add("hidden");
        document.getElementById("menuEkrani").classList.remove("hidden");
        document.getElementById("kullaniciAdiSpan").innerText = ogr.ad;
        
        const btnSozluk = document.getElementById("btnSozluk");
        if(btnSozluk) btnSozluk.classList.remove("hidden");
        
        const btnDuyuru = document.getElementById("btnDuyuru");
        if (btnDuyuru) { 
            btnDuyuru.classList.remove("hidden"); 
            if(typeof duyuruRozetKontrol === 'function') duyuruRozetKontrol(); 
        }
    }

    function girisTuruDegistir(tur) {
        document.getElementById('btnOgrenciTab').classList.remove('active');
        document.getElementById('btnOgretmenTab').classList.remove('active');
        document.getElementById('ogrenciGirisFormu').classList.add('hidden');
        document.getElementById('ogretmenGirisFormu').classList.add('hidden');
        
        if(tur === 'ogrenci') {
            document.getElementById('btnOgrenciTab').classList.add('active');
            document.getElementById('ogrenciGirisFormu').classList.remove('hidden');
        } else {
            document.getElementById('btnOgretmenTab').classList.add('active');
            document.getElementById('ogretmenGirisFormu').classList.remove('hidden');
        }
    }

    function girisYap() {
        const ad = document.getElementById("adSoyad").value.trim();
        const sinif = document.getElementById("sinif").value;
        const numara = document.getElementById("numara").value.trim();
        const girilenSifre = document.getElementById("sifre").value.trim();
        
        if (ad.toLocaleLowerCase('tr-TR') === "murat mutlu") {
            if (girilenSifre === "1310") {
                ogrenci = { ad: "Murat Mutlu (Öğretmen)", sinif: sinif || "Master", no: numara || "1310" };
                girisBasariliIslemleri(ogrenci);
            } else { alert("Master şifresi hatalı!"); }
            return;
        }

        if (!ad || !sinif || !numara || !girilenSifre) { alert("Lütfen tüm alanları eksiksiz doldurunuz!"); return; }

        const loginBtn = document.querySelector("#ogrenciGirisFormu .btn-login");
        const eskiMetin = loginBtn.innerText;
        loginBtn.innerText = "Bağlanıyor...";
        loginBtn.disabled = true;

        fetch(SIFRE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ islem: "giris", sinif: sinif, ogrenciNo: numara, sifre: girilenSifre })
        })
        .then(response => response.json())
        .then(data => {
            if (data.durum === "basarili") {
                const temizGirilenAd = ad.replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
                const temizTabloAd = data.adSoyad.replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
                
                if (temizGirilenAd !== temizTabloAd) {
                    alert("Girdiğiniz Ad Soyad sistemdekiyle uyuşmuyor. Lütfen kontrol ediniz.");
                } else {
                    ogrenci = { ad: data.adSoyad, sinif: data.sinif, no: numara };
                    girisBasariliIslemleri(ogrenci);
                }
            } else {
                alert(data.mesaj); 
            }
        })
        .catch(error => {
            alert("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
        })
        .finally(() => {
            loginBtn.innerText = eskiMetin;
            loginBtn.disabled = false;
        });
    }

    function ogretmenGirisYap() {
        const ad = document.getElementById("ogretmenAd").value.trim();
        const vipKodu = document.getElementById("vipKodu").value.trim();
        const sifre = document.getElementById("ogretmenSifre").value.trim();

        if (!ad || !sifre) { alert("Lütfen adınızı ve şifrenizi giriniz! (VIP kodu sadece ilk kayıtta zorunludur)"); return; }

        const loginBtn = document.getElementById("btnOgretmenLogin");
        const eskiMetin = loginBtn.innerHTML;
        loginBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Sisteme Giriliyor...";
        loginBtn.disabled = true;

        fetch(SIFRE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ islem: "ogretmen_kayit", adSoyad: ad, vipKodu: vipKodu, sifre: sifre })
        })
        .then(response => response.json())
        .then(data => {
            if (data.durum === "basarili") {
                ogrenci = { ad: data.adSoyad + " (Zümre)", sinif: data.sinif, no: data.no };
                girisBasariliIslemleri(ogrenci);
            } else {
                alert(data.mesaj); 
            }
        })
        .catch(error => {
            alert("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
        })
        .finally(() => {
            loginBtn.innerHTML = eskiMetin;
            loginBtn.disabled = false;
        });
    }

    function sozlukGoster() { document.getElementById('sozlukModal').style.display = 'block'; kavramAra(); document.getElementById('sozlukArama').focus(); }
    function sozlukKapat() { document.getElementById('sozlukModal').style.display = 'none'; document.getElementById('sozlukArama').value = ""; }
    
    function kavramAra() {
        const query = document.getElementById('sozlukArama').value.toLowerCase();
        const listeDiv = document.getElementById('kavramListesi');
        listeDiv.innerHTML = "";
        
        if (typeof KAVRAMLAR !== 'undefined') {
            KAVRAMLAR.forEach(k => {
                if(k.terim.toLowerCase().includes(query) || k.anlam.toLowerCase().includes(query)) {
                    listeDiv.innerHTML += "<div class='kavram-item'><span class='kavram-baslik'>" + k.terim + "</span><span style='opacity: 0.8;'>" + k.anlam + "</span></div>";
                }
            });
        }
        if(listeDiv.innerHTML === "") { listeDiv.innerHTML = "<div style='padding:15px; text-align:center; color:#e74c3c;'>Kavram bulunamadı.</div>"; }
    }

    function iletisimGoster() { document.getElementById('iletisimModal').style.display = 'block'; }
    function iletisimKapat() { document.getElementById('iletisimModal').style.display = 'none'; document.getElementById('ogrenciMesaji').value = ""; }
    
    function mesajGonder() {
        const mesaj = document.getElementById('ogrenciMesaji').value;
        if(mesaj.trim() === "") { alert("Lütfen bir mesaj yazınız."); return; }
        if(!ogrenci || !ogrenci.ad) { alert("Ana ekrandan giriş yapmalısınız."); return; }

        const btn = document.querySelectorAll('#iletisimModal .action-btn')[1];
        const eskiMetin = btn ? btn.innerText : "Gönder";
        if(btn) { btn.innerText = "Gönderiliyor..."; btn.disabled = true; }

        const data = { isim: ogrenci.ad, sinif: ogrenci.sinif, numara: ogrenci.no || "Belirtilmedi", puan: "İLETİŞİM/MESAJ", rapor: mesaj };
        fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })
        .then(() => { alert("Mesajınız iletilmiştir."); iletisimKapat(); if(btn) { btn.innerText = eskiMetin; btn.disabled = false; } })
        .catch(e => { alert("Mesaj gönderilemedi."); if(btn) { btn.innerText = eskiMetin; btn.disabled = false; } });
    }

    function duyuruGoster() { 
        document.getElementById('duyuruModal').style.display = 'block'; 
        localStorage.setItem("okunanDuyuru", AKTIF_DUYURU_VERSIYONU); 
        document.getElementById('duyuruRozeti').classList.add('hidden'); 
        const genelRozet = document.getElementById('duyuruRozetiGenel');
        if(genelRozet) genelRozet.classList.add('hidden'); 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }

    function duyuruRozetKontrol() {
        const okunan = localStorage.getItem("okunanDuyuru");
        if (okunan !== AKTIF_DUYURU_VERSIYONU) {
            document.getElementById('duyuruRozeti').classList.remove('hidden'); 
            const genelRozet = document.getElementById('duyuruRozetiGenel');
            if(genelRozet) genelRozet.classList.remove('hidden'); 
        }
    }
    
    function duyuruKapat() { document.getElementById('duyuruModal').style.display = 'none'; }
    function odeveGit() { duyuruKapat(); testSec('test_u2_genel_1'); }

    function testSec(testKodu) {
        aktifTest = testKodu;
        const isKlasik = testKodu.includes('klasik');
        const alan = document.getElementById("sorularAlani");
        alan.innerHTML = "";

        let hamSorular = (window.allTests && window.allTests[testKodu]) ? window.allTests[testKodu] : [];
        
        if (!hamSorular || hamSorular.length === 0) {
            alan.innerHTML = "<div style='padding:30px; text-align:center; border:2px dashed #e74c3c; border-radius:10px; background:#fadbd8;'><h3 style='color:#c0392b;'><i class=\"fa-solid fa-triangle-exclamation\"></i> Sorular Yüklenemedi!</h3><p style='color:#333; font-weight:bold;'>Sistem '" + testKodu + "' isimli test verisini bulamadı.</p><p style='font-size:14px; color:#555;'>Lütfen JS dosyanızın içindeki tanımlamanın (Örn: window.allTests['" + testKodu + "']) menü koduyla harfi harfine aynı olduğunu kontrol edin.</p></div>";
            document.getElementById("menuEkrani").classList.add("hidden");
            document.getElementById("testEkrani").classList.remove("hidden");
            document.getElementById("testBaslik").innerText = "Hata Sayfası";
            document.getElementById("sayac").innerText = "--:--";
            return; 
        }

        document.getElementById("menuEkrani").classList.add("hidden");
        document.getElementById("testEkrani").classList.remove("hidden");
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(e=>{});

        ihlalSayisi = 0;
        document.addEventListener("visibilitychange", ihlalTakip);

        let testAdi = isKlasik ? "Klasik Sınav (Açık Uçlu)" : "Çoktan Seçmeli Test";
        if (window.MENU_VERI && aktifOda) {
            const testData = window.MENU_VERI[aktifOda].testler.find(t => t.id === testKodu);
            if (testData) testAdi = testData.baslik;
        }
        document.getElementById("testBaslik").innerText = testAdi;

        sayacBaslat(isKlasik ? 40 * 60 : 30 * 60);

        flagged = {};
        autoSaveData = { cevaplar: {}, flagged: {}, ihlal: 0, testKodu: testKodu, ogrenci: ogrenci, startTime: Date.now() };

        if (isKlasik) {
            renderKlasik(alan, hamSorular);
        } else {
            suankiSorular = shuffle(JSON.parse(JSON.stringify(hamSorular))).map(s => {
                s.shuffledOptions = shuffle([...s.secenekler]); return s;
            });
            renderTest(alan);
        }
        updateProgress();
        saveToLocal();
    }

    function cleanText(text) { return text.replace(/^[A-E]\)\s*/, ''); }

    function renderTest(alan) {
        const map = document.getElementById("navMap");
        map.innerHTML = "";
        enableDragScroll(map); 
        
        suankiSorular.forEach((soru, index) => {
            const dot = document.createElement("div");
            dot.className = "nav-dot"; dot.innerText = index + 1; dot.id = "dot-" + index;
            dot.onclick = () => document.getElementById("soru-kart-" + index).scrollIntoView({behavior: "smooth"});
            map.appendChild(dot);

            const kart = document.createElement("div");
            kart.className = "question-card"; kart.id = "soru-kart-" + index;
            
            let qHtml = "<div class='question-header'>";
            let konuEtiketi = soru.robotKonu ? " <span style='font-size:13px; font-weight:600; color:var(--text-color); opacity:0.6; margin-left: 8px;'>[" + soru.robotKonu + "]</span>" : "";
            qHtml += "<span class='question-number'>Soru " + (index + 1) + konuEtiketi + "</span>";
            qHtml += "<button class='flag-btn' id='flag-" + index + "' onclick='bayrakKoy(" + index + ")'><i class=\"fa-solid fa-flag\"></i> Sonra Bak</button>";
            qHtml += "</div>";
            qHtml += "<div class='question-text'>" + soru.soru + "</div>";
            qHtml += "<div class='options'>";
            
            const labels = ["A", "B", "C", "D", "E"];
            soru.shuffledOptions.forEach((optText, i) => {
                const cleanOpt = cleanText(optText);
                const safeOpt = cleanOpt.replace(/'/g, "\\'");
                qHtml += "<label><input type='radio' name='soru" + index + "' value='" + safeOpt + "' onchange=\"cevapVerildi(" + index + ", '" + safeOpt + "')\"> <b>" + labels[i] + ")</b> " + cleanOpt + "</label>";
            });
            qHtml += "</div>";
            kart.innerHTML = qHtml;
            alan.appendChild(kart);
        });
    }

    function renderKlasik(alan, sourceSorular) {
        const map = document.getElementById("navMap");
        map.innerHTML = "";
        enableDragScroll(map); 

        sourceSorular.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "question-card";
            
            let cHtml = "<div class='question-text'>Soru " + (index+1) + ": " + item.soru + "</div>";
            cHtml += "<text" + "area id='klasikCevap" + index + "' oninput='cevapVerildi(" + index + ", this.value)' style='width:100%; height:140px;' placeholder='Cevabınızı buraya yazınız...'></text" + "area>";
            
            div.innerHTML = cHtml;
            alan.appendChild(div);
        });
    }

    function cevapVerildi(index, value) {
        autoSaveData.cevaplar[index] = value;
        if(!aktifTest.includes('klasik')) { document.getElementById("dot-" + index).classList.add("answered"); updateProgress(); }
        saveToLocal();
    }

    function bayrakKoy(index) {
        const btn = document.getElementById("flag-" + index);
        const dot = document.getElementById("dot-" + index);
        if (flagged[index]) {
            delete flagged[index]; delete autoSaveData.flagged[index];
            btn.classList.remove("active"); dot.classList.remove("flagged"); btn.innerHTML = '<i class="fa-solid fa-flag"></i> Sonra Bak';
        } else {
            flagged[index] = true; autoSaveData.flagged[index] = true;
            btn.classList.add("active"); dot.classList.add("flagged"); btn.innerHTML = '<i class="fa-solid fa-flag"></i> İşaretlendi';
        }
        saveToLocal();
    }

    function updateProgress() {
        if(!aktifTest || aktifTest.includes('klasik') || suankiSorular.length === 0) return;
        const answered = Object.keys(autoSaveData.cevaplar).length;
        document.getElementById("progress-bar").style.width = ((answered / suankiSorular.length) * 100) + "%";
    }

    function saveToLocal() {
        autoSaveData.ihlal = ihlalSayisi; localStorage.setItem('sinavSession', JSON.stringify(autoSaveData));
    }

    function restoreSession(data) {
        document.getElementById("girisEkrani").classList.add("hidden");
        document.getElementById("menuEkrani").classList.remove("hidden");
        ogrenci = data.ogrenci; document.getElementById("kullaniciAdiSpan").innerText = ogrenci.ad;
        watermarkOlustur(ogrenci.ad + " " + ogrenci.no);
        document.getElementById("btnSozluk").classList.remove("hidden");
        if(document.getElementById("btnDuyuru")) document.getElementById("btnDuyuru").classList.remove("hidden");
    }

    function ihlalTakip() { if (!document.hidden) return; ihlalSayisi++; document.title = "⚠️ UYARI (" + ihlalSayisi + ") - Sekme Değiştirildi!"; saveToLocal(); }

    function sayacBaslat(saniye) {
        clearInterval(timerInterval); baslangicZamani = new Date(); let kalan = saniye;
        const display = document.getElementById("sayac");
        timerInterval = setInterval(() => {
            let dk = Math.floor(kalan / 60); let sn = kalan % 60;
            display.innerText = dk + ":" + (sn < 10 ? '0' : '') + sn;
            if (--kalan < 0) { clearInterval(timerInterval); alert("Süre doldu!"); testiBitir(true); }
        }, 1000);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
        return array;
    }
	function watermarkOlustur(text) {
        
    }

    function ozetGoster() {
        const isKlasik = aktifTest.includes('klasik');
        let sourceSorular = typeof window.allTests !== 'undefined' && window.allTests[aktifTest] ? window.allTests[aktifTest] : [];
        const toplam = isKlasik ? sourceSorular.length : suankiSorular.length;
        if(toplam === 0) { alert("Test boştur."); return; }
        
        const cevaplanan = Object.keys(autoSaveData.cevaplar).length;
        const bos = toplam - cevaplanan;
        const isaretli = Object.keys(flagged).length;

        let oHtml = "<div class='modal-stat'><i class=\"fa-solid fa-check\"></i> Cevaplanan: <b>" + cevaplanan + "</b></div>";
        oHtml += "<div class='modal-stat' style='color:" + (bos>0?'#e74c3c':'#27ae60') + "'><i class=\"fa-solid fa-triangle-exclamation\"></i> Boş Bırakılan: <b>" + bos + "</b></div>";
        oHtml += "<div class='modal-stat' style='color:#f39c12'><i class=\"fa-solid fa-flag\"></i> İşaretlenen: <b>" + isaretli + "</b></div>";
        oHtml += "<p style='margin-top: 20px; font-weight: 500;'>Sınavı bitirmek istediğinize emin misiniz?</p>";
        
        document.getElementById("modalIcerik").innerHTML = oHtml;
        document.getElementById("ozetModal").style.display = "block";
    }

    function modalKapat() { document.getElementById("ozetModal").style.display = "none"; }

    function testiBitir(otomatik = false) {
        modalKapat(); clearInterval(timerInterval);
        document.removeEventListener("visibilitychange", ihlalTakip);
        localStorage.removeItem('sinavSession'); 

        if (aktifTest && !aktifTest.includes('robot_sinavi')) {
            let cozulenler = JSON.parse(localStorage.getItem('cozulenTestler')) || [];
            if (!cozulenler.includes(aktifTest)) {
                cozulenler.push(aktifTest);
                localStorage.setItem('cozulenTestler', JSON.stringify(cozulenler));
            }
        }

        const bitisZamani = new Date();
        const gecenSureSn = Math.floor((bitisZamani - baslangicZamani) / 1000);
        const gecenSureStr = Math.floor(gecenSureSn / 60) + " dk " + (gecenSureSn % 60) + " sn";
        let raporMetni = ""; let puan = 0; let detayHtml = "";

        if (aktifTest.includes('klasik')) {
            raporMetni = "[KLASİK] ";
            detayHtml = "<h3 style='color:var(--text-color); border-bottom:2px solid var(--card-border); padding-bottom:15px; margin-bottom: 20px;'>Cevap Anahtarı</h3>";
            let sourceSorular = typeof window.allTests !== 'undefined' && window.allTests[aktifTest] ? window.allTests[aktifTest] : [];
            
            sourceSorular.forEach((item, index) => {
                const cvp = autoSaveData.cevaplar[index] || "";
                raporMetni += "S" + (index+1) + ": " + cvp.replace(/\n/g," ") + " || ";
                detayHtml += "<div class='explanation-card'><div style='font-weight:700; margin-bottom:10px; font-size:16px;'>Soru " + (index+1) + ": " + item.soru + "</div><div style='margin-bottom:15px; padding: 10px; background: rgba(230, 126, 34, 0.1); border-radius: 8px;'><span style='color:#e67e22; font-weight:800; display:block; margin-bottom:5px;'>Sizin Cevabınız:</span>" + (cvp || "<i>Boş bırakıldı</i>") + "</div><div style='background:rgba(39, 174, 96, 0.1); padding:15px; border-radius:8px;'><span style='color:#27ae60; font-weight:800; display:block; margin-bottom:5px;'>Beklenen Cevap:</span>" + item.cevap + "</div></div>";
            });

            puan = "DEĞERLENDİRİLECEK";
            document.getElementById("klasikMesaj").style.display = "block";
        } else {
            let dogruSayisi = 0; raporMetni = "[" + aktifTest.toUpperCase() + "] ";
            
            suankiSorular.forEach((soru, index) => {
                const secilen = autoSaveData.cevaplar[index] || "BOŞ";
                const dogruMetin = cleanText(soru.cevap);
                const isCorrect = (secilen === dogruMetin);
                
                if (isCorrect) {
                    dogruSayisi++;
                    detayHtml += "<div class='explanation-card correct'><div style='font-weight:800; font-size:16px; margin-bottom:8px; color:#27ae60;'>Soru " + (index+1) + " <i class=\"fa-solid fa-check\"></i></div><div style='margin-bottom:8px; font-weight: 500;'>" + soru.soru + "</div><div style='margin-bottom:8px;'>Sizin Cevabınız: <b>" + secilen + "</b></div><div style='opacity:0.9; font-size:14px;'><i>" + (soru.aciklama || "") + "</i></div></div>";
                } else {
                    detayHtml += "<div class='explanation-card wrong'><div style='font-weight:800; font-size:16px; margin-bottom:8px; color:#e74c3c;'>Soru " + (index+1) + " <i class=\"fa-solid fa-xmark\"></i></div><div style='margin-bottom:8px; font-weight: 500;'>" + soru.soru + "</div><div style='margin-bottom:4px; text-decoration: line-through; opacity: 0.8;'>Sizin Cevabınız: " + secilen + "</div><div style='margin-bottom:8px;'>Doğru Cevap: <b style='color:#e74c3c;'>" + dogruMetin + "</b></div><div style='opacity:0.9; font-size:14px;'><i>" + (soru.aciklama || "") + "</i></div></div>";
                    raporMetni += "S" + (index+1) + ":Y (" + secilen + ") | ";
                }
            });

            puan = Math.round((dogruSayisi / suankiSorular.length) * 100);
            raporMetni += " Doğru: " + dogruSayisi + "/" + suankiSorular.length;
            
            const msgBox = document.getElementById("ozelMotivasyonKutusu");
            if(puan < 50) { msgBox.innerHTML = "Daha fazla çalışmalısın. <i class=\"fa-solid fa-stop\"></i>"; msgBox.style.color = "#e74c3c"; msgBox.style.background = "rgba(231, 76, 60, 0.1)"; }
            else if(puan < 85) { msgBox.innerHTML = "İyi gidiyorsun, biraz daha gayret! <i class=\"fa-solid fa-thumbs-up\"></i>"; msgBox.style.color = "#f39c12"; msgBox.style.background = "rgba(243, 156, 18, 0.1)"; }
            else { msgBox.innerHTML = "Tebrikler! Harika bir sonuç. <i class=\"fa-solid fa-star\"></i>"; msgBox.style.color = "#27ae60"; msgBox.style.background = "rgba(39, 174, 96, 0.1)"; }
            
            document.getElementById("puanKutusu").style.display = "block";
            document.getElementById("puanGostergesi").innerText = puan + " Puan";
        }

        document.getElementById("testEkrani").classList.add("hidden");
        document.getElementById("sonucEkrani").classList.remove("hidden");
        document.getElementById("bitirmeSuresi").innerText = "Süre: " + gecenSureStr;
        document.getElementById("detayliCozumler").innerHTML = detayHtml;

        if(ihlalSayisi > 0) {
            document.getElementById("ihlalSayisi").innerHTML = "<i class=\"fa-solid fa-triangle-exclamation\"></i> " + ihlalSayisi + " kez sekme değiştirdiniz!";
            raporMetni += " [İHLAL: " + ihlalSayisi + "]";
        } else {
            document.getElementById("ihlalSayisi").innerHTML = "<i class=\"fa-solid fa-check\"></i> Sınav odağı korundu.";
            document.getElementById("ihlalSayisi").style.color = "#27ae60";
        }

        const data = { isim: ogrenci.ad, sinif: ogrenci.sinif, numara: ogrenci.no, puan: puan, rapor: "(Süre: " + gecenSureStr + ") " + raporMetni };
        fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).catch(e => console.log(e));
    }

    function anasayfayaDon() {
        document.getElementById("sonucEkrani").classList.add("hidden");
        document.getElementById("menuEkrani").classList.remove("hidden");
        if(typeof salonaDon === 'function') salonaDon();
        aktifTest = null; ihlalSayisi = 0;
        document.getElementById("puanKutusu").style.display = "none";
        document.getElementById("klasikMesaj").style.display = "none";
        window.scrollTo(0,0);
    }

    function testtenCik() {
        if(confirm("Testten çıkmak istediğinize emin misiniz? Kaydetmediğiniz ilerlemeler kaybolacaktır.")) {
            clearInterval(timerInterval); document.removeEventListener("visibilitychange", ihlalTakip);
            localStorage.removeItem('sinavSession'); document.getElementById("testEkrani").classList.add("hidden");
            document.getElementById("menuEkrani").classList.remove("hidden");
            aktifTest = null; ihlalSayisi = 0; window.scrollTo(0,0);
        }
    }

    function testAra() {
        const input = document.getElementById('testArama');
        const clearBtn = document.getElementById('aramaTemizle');
        const filter = input.value.toLocaleLowerCase('tr-TR');
        const testItems = document.querySelectorAll('.test-item-row');
        
        if (filter.length > 0) { clearBtn.style.display = 'flex'; } 
        else { clearBtn.style.display = 'none'; }

        testItems.forEach(item => {
            const title = item.querySelector('.test-item-title').innerText.toLocaleLowerCase('tr-TR');
            const desc = item.querySelector('.test-item-meta').innerText.toLocaleLowerCase('tr-TR');
            if (title.includes(filter) || desc.includes(filter)) {
                item.style.display = ''; 
            } else {
                item.style.display = 'none';
            }
        });
    }

    function aramaTemizleBtn() {
        const input = document.getElementById('testArama');
        input.value = "";
        testAra();
        input.focus();
    }

    function robotGoster() {
        if (typeof window.MENU_VERI === 'undefined') {
            alert("Sistem Hatası: Soru kataloğu yüklenemedi."); return;
        }
        const uniteSelect = document.getElementById('robotUnite');
        uniteSelect.innerHTML = '<option value="tumu">Tüm Ünitelerden Karma</option>';
        for (const [key, value] of Object.entries(window.MENU_VERI)) {
            uniteSelect.innerHTML += `<option value="${key}">${value.baslik}</option>`;
        }
        robotKonuGuncelle();
        document.getElementById('robotModal').style.display = 'block';
    }

    function robotKonuGuncelle() {
        const uniteSelect = document.getElementById('robotUnite').value;
        const konuSelect = document.getElementById('robotKonu');
        konuSelect.innerHTML = '<option value="tumu">Tüm Konulardan Karma</option>';

        let konular = new Set();
        if (uniteSelect === 'tumu') {
            for (const key in window.MENU_VERI) {
                window.MENU_VERI[key].testler.forEach(t => {
                    if (!t.isKlasik && t.konu && t.konu !== "Geçmişin İnşa Sürecinde Tarih") konular.add(t.konu);
                });
            }
        } else {
            window.MENU_VERI[uniteSelect].testler.forEach(t => {
                if (!t.isKlasik && t.konu && t.konu !== "Geçmişin İnşa Sürecinde Tarih") konular.add(t.konu);
            });
        }

        konular.forEach(k => {
            const safeK = k.replace(/'/g, "\\'");
            konuSelect.innerHTML += `<option value="${safeK}">${k}</option>`;
        });
    }

    function robotKapat() { document.getElementById('robotModal').style.display = 'none'; }

    function robotSinavBaslat() {
        const unite = document.getElementById('robotUnite').value;
        const konu = document.getElementById('robotKonu').value;
        const sayi = parseInt(document.getElementById('robotSoruSayisi').value);

        let testIdHavuzu = [];

        for (const [key, data] of Object.entries(window.MENU_VERI)) {
            if (unite !== 'tumu' && key !== unite) continue;

            data.testler.forEach(t => {
                if (t.isKlasik) return; 
                if (t.konu === "Geçmişin İnşa Sürecinde Tarih") return; 
                if (konu !== 'tumu' && t.konu !== konu) return;
                testIdHavuzu.push({id: t.id, konu: t.konu});
            });
        }

        let soruHavuzu = [];
        testIdHavuzu.forEach(tItem => {
            if (window.allTests && window.allTests[tItem.id]) {
                let testSorulari = JSON.parse(JSON.stringify(window.allTests[tItem.id]));
                testSorulari.forEach(s => s.robotKonu = tItem.konu);
                soruHavuzu = soruHavuzu.concat(testSorulari);
            }
        });

        if (soruHavuzu.length === 0) {
            alert("Seçtiğiniz kriterlere uygun soru bulunamadı. Lütfen başka bir ünite/konu seçiniz.");
            return;
        }

        soruHavuzu = shuffle(soruHavuzu);
        let secilenSorular = soruHavuzu.slice(0, sayi);

        if(typeof window.allTests === 'undefined') window.allTests = {};
        window.allTests["robot_sinavi"] = secilenSorular;

        robotKapat();
        aktifOda = null; 
        testSec("robot_sinavi");
        
        document.getElementById("testBaslik").innerHTML = '<i class="fa-solid fa-robot"></i> Özel Karma Sınav (' + secilenSorular.length + ' Soru)';
    }

    function yedekleGoster() { 
        document.getElementById('yedekModal').style.display = 'block'; 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
    
    function yedekleKapat() { document.getElementById('yedekModal').style.display = 'none'; }

    function verileriIndir() {
        const data = {
            aktifOgrenci: localStorage.getItem('aktifOgrenci'),
            cozulenTestler: localStorage.getItem('cozulenTestler'),
            tema: localStorage.getItem('tema'),
            fontSize: localStorage.getItem('fontSize')
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = "Tarih_Portali_Yedek.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function veriYukle(event) {
        const file = event.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if(data.aktifOgrenci) localStorage.setItem('aktifOgrenci', data.aktifOgrenci);
                if(data.cozulenTestler) localStorage.setItem('cozulenTestler', data.cozulenTestler);
                if(data.tema) localStorage.setItem('tema', data.tema);
                if(data.fontSize) localStorage.setItem('fontSize', data.fontSize);
                alert("Veriler başarıyla yüklendi! Sayfa yenileniyor.");
                location.reload();
            } catch (err) {
                alert("Hata: Geçersiz yedek dosyası!");
            }
        };
        reader.readAsText(file);
    }

    const sifreModal = document.getElementById("sifreModal");
    const sifreBtn = document.getElementById("sifreDegistirBtn");
    const sifreKaydetBtn = document.getElementById("sifreKaydetBtn");
    const sifreMesajDiv = document.getElementById("sifreMesaj");

    if(sifreBtn) {
        sifreBtn.onclick = function() { 
            sifreModal.style.display = "block"; 
            sifreMesajDiv.innerHTML = ""; 
            const dropdown = document.getElementById('hamburgerDropdown');
            if(dropdown) dropdown.classList.remove('active');
        };
    }

    function sifreKapat() {
        sifreModal.style.display = "none";
        document.getElementById("eskiSifre").value = "";
        document.getElementById("yeniSifre").value = "";
    }

    if(sifreKaydetBtn) {
        sifreKaydetBtn.onclick = function() {
            const no = ogrenci.no;
            const eski = document.getElementById("eskiSifre").value.trim();
            const yeni = document.getElementById("yeniSifre").value.trim();

            if(!eski || !yeni) {
                sifreMesajDiv.innerHTML = "Lütfen eski ve yeni şifrenizi girin.";
                sifreMesajDiv.style.color = "#e74c3c";
                return;
            }

            sifreKaydetBtn.innerText = "Güncelleniyor...";
            sifreKaydetBtn.disabled = true;

            fetch(SIFRE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ islem: "sifre_degistir", ogrenciNo: no, eskiSifre: eski, yeniSifre: yeni })
            })
            .then(response => response.json())
            .then(data => {
                if(data.durum === "basarili") {
                    sifreMesajDiv.innerHTML = data.mesaj;
                    sifreMesajDiv.style.color = "#27ae60";
                    document.getElementById("eskiSifre").value = "";
                    document.getElementById("yeniSifre").value = "";
                } else {
                    sifreMesajDiv.innerHTML = data.mesaj;
                    sifreMesajDiv.style.color = "#e74c3c";
                }
            })
            .catch(error => {
                sifreMesajDiv.innerHTML = "Bağlantı hatası. Lütfen tekrar deneyin.";
                sifreMesajDiv.style.color = "#e74c3c";
            })
            .finally(() => {
                sifreKaydetBtn.innerText = "Şifreyi Güncelle";
                sifreKaydetBtn.disabled = false;
            });
        };
    }
    
    let odevKuyrugu = [];
    let suAnkiYuklemeIndeksi = 0;
    let yuklemeId = "";
    
    function odevGoster() {
        if(!ogrenci || !ogrenci.ad) { alert("Lütfen önce ana ekrandan giriş yapın."); return; }
        document.getElementById('odevModal').style.display = 'block';
        odevKuyrugu = [];
        document.getElementById('secilenDosyalarListesi').innerHTML = "";
        document.getElementById('odevGonderBtn').disabled = true;
        document.getElementById('yuklemeBariBg').style.display = 'none';
        document.getElementById('genelYuklemeDurumu').style.display = 'none';
        document.getElementById('dosyaSecici').value = "";
    }

    function odevKapat() { document.getElementById('odevModal').style.display = 'none'; }

    function dosyalariHazirla(event) {
        const files = event.target.files;
        if(files.length === 0) return;
        if(files.length > 10) { alert("Tek seferde en fazla 10 dosya seçebilirsiniz."); return; }
        
        odevKuyrugu = Array.from(files);
        const listeDiv = document.getElementById('secilenDosyalarListesi');
        listeDiv.innerHTML = "";
        
        odevKuyrugu.forEach((file, index) => {
            listeDiv.innerHTML += `<div class="file-item" id="fileItem-${index}">
                <span><i class="${file.type.includes('pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}"></i> ${file.name.substring(0,20)}...</span>
                <span class="status waiting" id="fileStatus-${index}">Bekliyor</span>
            </div>`;
        });
        
        document.getElementById('odevGonderBtn').disabled = false;
    }

    async function odevleriGonder() {
        if(odevKuyrugu.length === 0) return;
        
        document.getElementById('odevGonderBtn').disabled = true;
        document.getElementById('odevIptalBtn').disabled = true;
        document.getElementById('yuklemeBariBg').style.display = 'block';
        document.getElementById('genelYuklemeDurumu').style.display = 'block';
        
        yuklemeId = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        suAnkiYuklemeIndeksi = 0;
        
        kuyruguIsle();
    }

    async function kuyruguIsle() {
        if (suAnkiYuklemeIndeksi >= odevKuyrugu.length) {
            document.getElementById('genelYuklemeDurumu').innerText = "Tüm dosyalar başarıyla yüklendi!";
            document.getElementById('odevIptalBtn').innerText = "Kapat";
            document.getElementById('odevIptalBtn').disabled = false;
            alert("Ödevleriniz başarıyla öğretmeninize iletildi!");
            return;
        }
        
        let i = suAnkiYuklemeIndeksi;
        let file = odevKuyrugu[i];
        
        document.getElementById(`fileStatus-${i}`).innerText = "Yükleniyor...";
        document.getElementById(`fileStatus-${i}`).className = "status uploading";
        document.getElementById('genelYuklemeDurumu').innerText = `${i + 1} / ${odevKuyrugu.length} Yükleniyor...`;
        document.getElementById('yuklemeBariFill').style.width = ((i) / odevKuyrugu.length * 100) + "%";

        try {
            let base64Data = "";
            if (file.type.startsWith('image/')) {
                base64Data = await resimSikistirVeBase64Yap(file); 
            } else {
                base64Data = await fileToBase64(file);
            }
            
            const payload = {
                islem: "odev_yukle",
                ad: ogrenci.ad,
                no: ogrenci.no,
                sinif: ogrenci.sinif,
                dosyaAdi: file.name,
                mimeType: file.type,
                base64Data: base64Data.split("base64,")[1],
                yuklemeId: yuklemeId
            };

            await fetch(ODEV_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            document.getElementById(`fileStatus-${i}`).innerText = "Başarılı";
            document.getElementById(`fileStatus-${i}`).className = "status success";
            
        } catch (error) {
            console.error(error);
            document.getElementById(`fileStatus-${i}`).innerText = "Hata!";
            document.getElementById(`fileStatus-${i}`).className = "status error";
        }

        suAnkiYuklemeIndeksi++;
        document.getElementById('yuklemeBariFill').style.width = ((suAnkiYuklemeIndeksi) / odevKuyrugu.length * 100) + "%";
        
        setTimeout(kuyruguIsle, 1000); 
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function resimSikistirVeBase64Yap(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                    else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL(file.type, 0.7)); 
                };
            };
        });
    }

    window.addEventListener('click', function(event) { 
        if (event.target.classList.contains('modal')) { 
            event.target.style.display = 'none'; 
        } 
        
        /* --- YENİ EKLENEN: MENÜ DIŞINA TIKLANINCA MENÜYÜ KAPATMA MOTORU --- */
        const dropdown = document.getElementById('hamburgerDropdown');
        if (dropdown && dropdown.classList.contains('active') && !event.target.closest('.dropdown-menu-container')) {
            dropdown.classList.remove('active');
        }
    });
