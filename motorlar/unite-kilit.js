/* ═══════════════════════════════════════════════════════════════
   ÜNİTE KİLİDİ – 9. ve 10. sınıflarda yalnızca 1. ünite aktif.
   Kilit SADECE yönetici (Murat Mutlu, master şifre ile giriş) için kalkar.
   KILITLI listesinden ID çıkarılırsa ilgili ünite herkese açılır.
═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var KILITLI = ['u2', 'u3'];
    var MESAJ = 'Konularımız ilerledikçe bu üniteyi öğretmenleriniz kullanımınıza açacaktır.';
    // girisYap() içinde master şifre (1310) ile giriş yapıldığında oluşturulan oturum adı
    var YONETICI_AD = 'Murat Mutlu (Öğretmen)';

    var modal;

    /* Giriş yapan kişi yönetici mi? (Murat Mutlu + master şifre)
       Normal "(Zümre)" öğretmenleri ve öğrenciler bu kontrolden geçemez. */
    function yoneticiMi() {
        try {
            if (typeof ogrenci !== 'undefined' && ogrenci && ogrenci.ad === YONETICI_AD) return true;
        } catch (e) {}
        try {
            var kayit = localStorage.getItem('globalZumreOturumu');
            if (kayit) {
                var o = JSON.parse(kayit);
                if (o && o.ad === YONETICI_AD) return true;
            }
        } catch (e) {}
        return false;
    }

    function modalKur() {
        if (modal) return;
        modal = document.createElement('div');
        modal.id = 'uniteKilitModal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML =
            '<div class="unite-kilit-kutu">' +
                '<div class="unite-kilit-ikon"><i class="fa-solid fa-lock"></i></div>' +
                '<h3 class="unite-kilit-baslik">Bu Ünite Henüz Açılmadı</h3>' +
                '<p class="unite-kilit-metin"></p>' +
                '<button type="button" class="unite-kilit-btn">Anladım</button>' +
            '</div>';
        modal.querySelector('.unite-kilit-metin').textContent = MESAJ;
        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.classList.contains('unite-kilit-btn')) kapat();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') kapat();
        });
    }

    function uyariGoster() {
        modalKur();
        modal.classList.add('aktif');
    }

    function kapat() {
        if (modal) modal.classList.remove('aktif');
    }

    // Kilitli ünite kartlarının görünümünü oturuma göre güncelle
    function kartlariGuncelle() {
        var admin = yoneticiMi();
        KILITLI.forEach(function (id) {
            var btn = document.querySelector('.folder-btn[onclick*="\'' + id + '\'"]');
            if (btn) btn.classList.toggle('unite-kilitli', !admin);
        });
    }

    function kur() {
        // Tüm giriş noktalarını kapsamak için odayaGir'i sarmala
        var orijinal = window.odayaGir;
        if (typeof orijinal === 'function' && !orijinal.__uniteKilitli) {
            window.odayaGir = function (uniteId) {
                if (KILITLI.indexOf(uniteId) !== -1 && !yoneticiMi()) { uyariGoster(); return; }
                return orijinal.apply(this, arguments);
            };
            window.odayaGir.__uniteKilitli = true;
        }

        kartlariGuncelle();

        // Giriş/çıkış sonrası (sayfa yenilenmeden) kart görünümünü tazele
        if (window.MutationObserver) {
            var mo = new MutationObserver(kartlariGuncelle);
            ['girisEkrani', 'menuEkrani'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] });
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur);
    else kur();
})();
