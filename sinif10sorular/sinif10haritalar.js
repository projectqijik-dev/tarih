// 10. Sınıf Harita ve Simülasyon Fonksiyonlarını Tutan Ana Obje
window.HARITA_MOTORU = {};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 1. HARİTA: BÜYÜK SELÇUKLU ASKERİ STRATEJİSİ (1040 - 1071) - GÜNCELLENMİŞ VERSİYON
window.HARITA_MOTORU["harita_u1_selcuklu_1"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Değişiklik 1 ve 2: Slider üste alındı ve genişliği kısaltıldı (%60).
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1038" max="1075" value="1038" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Harekat Yılı: <span id="yearDisplay" style="color: #E8A020;">1038</span></b>
            </label>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası
    window.currentMapInstance = L.map('mapCanvas').setView([36.5, 52.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Veri Yapısı (Lejant navigasyonu için odak koordinatları eklendi)
    const selcukluVerisi = [
        { 
            id: "dandanakan",
            isim: "Kuruluş ve Horasan Hattı (Dandanakan)", 
            kisaAd: "1040 - Dandanakan Z.",
            renk: "#8B1A1A", 
            startYear: 1038, 
            endYear: 1040, 
            odak: [37.4, 61.2], // Merv yakınları
            bilgi: "<b>Dandanakan (1040):</b> Gazneliler yenildi, Selçuklu resmen kuruldu. Siyasi otorite Türkmenlere geçti (Kut).", 
            rota: [[36.2, 59.6], [37.4, 61.2]] 
        },
        { 
            id: "pasinler",
            isim: "Batı İlerleyişi ve İlk Temas (Pasinler)", 
            kisaAd: "1048 - Pasinler Z.",
            renk: "#C9A84C", 
            startYear: 1041, 
            endYear: 1048, 
            odak: [39.9, 41.6], // Erzurum
            bilgi: "<b>Pasinler (1048):</b> Bizans ile ilk büyük meydan savaşı. Anadolu'nun keşfi ve yurt edinme süreci başladı.", 
            rota: [[37.4, 61.2], [35.7, 51.4], [38.1, 46.3], [39.9, 41.6]] 
        },
        { 
            id: "bagdat",
            isim: "İslam Dünyasının Liderliği (Bağdat)", 
            kisaAd: "1055 - Bağdat Sef.",
            renk: "#2980b9", 
            startYear: 1049, 
            endYear: 1055, 
            odak: [33.3, 44.3], // Bağdat
            bilgi: "<b>Bağdat Seferi (1055):</b> Tuğrul Bey Halifeyi kurtardı. 'Doğunun ve Batının Sultanı' unvanıyla siyasi liderlik Selçuklulara geçti.", 
            rota: [[35.7, 51.4], [34.3, 47.1], [33.3, 44.3]] 
        },
        { 
            id: "malazgirt",
            isim: "Anadolu Kapılarının Açılışı (Malazgirt)", 
            kisaAd: "1071 - Malazgirt Z.",
            renk: "#27ae60", 
            startYear: 1064, 
            endYear: 1071, 
            odak: [39.1, 42.5], // Malazgirt
            bilgi: "<b>Malazgirt (1071):</b> Anadolu'nun kapıları açıldı. Romen Diyojen mağlup edildi, 'Yurt Açan' dönemi başladı.", 
            rota: [[33.3, 44.3], [36.2, 37.1], [38.4, 43.3], [39.1, 42.5]] 
        }
    ];

    // Çizgi ve Navigasyon Markerlarını Depolama Objeleri
    let harekatCizgileri = {};
    let navigasyonMarkerlari = {}; 

    // Temel Stil Ayarları
    const highContrastColor = "#2c3e50 !important";
    const popupStyle = `color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;`;

    // 1. Adım: Çizgileri ve Navigasyon Markerlarını Oluştur (Ama henüz haritaya ekleme)
    selcukluVerisi.forEach(harekat => {
        // Rota çizgisi
        harekatCizgileri[harekat.id] = L.polyline([], {color: harekat.renk, weight: 5, opacity: 0.8})
            .bindPopup(`<div style="${popupStyle}"><h4 style="margin:0 0 5px 0; color:${harekat.renk};">${harekat.isim}</h4><p style="margin:0; font-size:13px; line-height:1.4;">${harekat.bilgi}</p></div>`);

        // Navigasyon için görünmez marker (Lejanttan tetiklemek için)
        navigasyonMarkerlari[harekat.id] = L.circleMarker(harekat.odak, {
            radius: 1, color: 'transparent', fillColor: 'transparent', opacity: 0, fillOpacity: 0
        }).bindPopup(`<div style="${popupStyle}"><h4 style="margin:0 0 5px 0; color:${harekat.renk};">${harekat.kisaAd}</h4><p style="margin:0; font-size:13px; line-height:1.4;">${harekat.bilgi}</p></div>`);
    });

    // Ana Güncelleme Fonksiyonu
    function haritayiYilaGoreGuncelle(guncelYil, isNavigating = false) {
        selcukluVerisi.forEach(harekat => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= harekat.endYear) {
                gosterilecekRota = harekat.rota;
                markerAktif = true; // Harekat tamamlandıysa navigasyon markerı aktif olabilir
            } else if (guncelYil >= harekat.startYear) {
                let oran = (guncelYil - harekat.startYear) / (harekat.endYear - harekat.startYear);
                let hedefIndex = Math.floor(harekat.rota.length * oran);
                if (hedefIndex === 0 && oran > 0) hedefIndex = 1; 
                gosterilecekRota = harekat.rota.slice(0, hedefIndex + 1);
            }

            // Çizgiyi haritaya ekle/çıkar ve rotayı güncelle
            if (gosterilecekRota.length > 0) {
                harekatCizgileri[harekat.id].addTo(window.currentMapInstance);
                harekatCizgileri[harekat.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(harekatCizgileri[harekat.id]);
            }

            // Navigasyon markerını haritaya ekle/çıkar
            if (markerAktif) {
                navigasyonMarkerlari[harekat.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(navigasyonMarkerlari[harekat.id]);
            }
        });
    }

    // Slider Event Listener
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // Değişiklik 3: İMZA KATMANI (Sol Alt Köşeye - bottomleft)
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = '<i class="fa-solid fa-pen-nib"></i> Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // Başlangıç durumu
    haritayiYilaGoreGuncelle(1038); 

    // Değişiklik 4: ETKİLEŞİMLİ LEJANT (Tıklanınca oraya git)
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">Stratejik Aşamalar</h4>';
        
        selcukluVerisi.forEach(s => {
            // Tıklanabilir satır oluşturma
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:12px; cursor:pointer; padding: 2px 4px; border-radius:4px; transition: background 0.2s;";
            
            // Mobil için tıklama alanını görsel olarak belli et (Hover efekti)
            item.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
            item.onmouseout = function() { this.style.background = 'transparent'; };

            item.innerHTML = `<i style="background: ${s.renk}; width: 15px; height: 3px; display: inline-block; margin-right: 8px;"></i> <span>${s.kisaAd}</span>`;

            // Kilit Özellik: Tıklama Olayı
            item.onclick = function() {
                // 1. Haritayı o bölgeye uçur (FlyTo)
                window.currentMapInstance.flyTo(s.odak, 7, { duration: 1.5 });

                // 2. Slider'ı ve yılı güncelle (Olayın bittiği yıla al)
                document.getElementById('yearSlider').value = s.endYear;
                document.getElementById('yearDisplay').innerText = s.endYear;
                
                // 3. Haritadaki çizgileri o yıla göre güncelle
                haritayiYilaGoreGuncelle(s.endYear, true);

                // 4. Navigasyon markerının popup'ını aç (Hafif gecikmeli, flyTo bitimine yakın)
                setTimeout(() => {
                    if (navigasyonMarkerlari[s.id]) {
                        navigasyonMarkerlari[s.id].openPopup();
                    }
                }, 1000); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 2. HARİTA: İBN BATTUTA VE SELÇUKLU SOSYOEKONOMİK AĞI
window.HARITA_MOTORU["harita_u1_battuta_2"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte ve Ortalanmış
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1330" max="1333" value="1330" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Seyahat Yılı: <span id="yearDisplay" style="color: #E8A020;">1330</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">İbn Battuta'nın Anadolu gözlemlerini ve ticaret ağını takip edin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Anadolu Coğrafyası
    window.currentMapInstance = L.map('mapCanvas').setView([38.5, 35.0], 6);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Sosyoekonomik Veri Yapısı (MEB Müfredatı Odaklı)
    const seyahatVerisi = [
        { 
            id: "alanya",
            isim: "Alanya (Lâiye) - Anadolu'ya Giriş", 
            kisaAd: "Alanya: Deniz Ticareti",
            renk: "#8B1A1A", 
            startYear: 1330, 
            endYear: 1331, 
            odak: [36.54, 32.00],
            bilgi: "<b>Ticaret ve Liman:</b> Selçuklu'nun en önemli ihraç limanı. Battuta burada kentin ticari canlılığından ve <i>Fütüvvet</i> ehli gençlerin misafirperverliğinden bahseder.", 
            rota: [[31.00, 32.00], [36.54, 32.00]] 
        },
        { 
            id: "konya",
            isim: "Konya - Ahilik ve Manevi Merkez", 
            kisaAd: "Konya: Ahilik Teşkilatı",
            renk: "#C9A84C", 
            startYear: 1331, 
            endYear: 1332, 
            odak: [37.87, 32.49],
            bilgi: "<b>Ahilik Sistemi:</b> Battuta Konya'da Ahi zaviyelerinde konaklamıştır. <i>Ahilik</i>; esnaf dayanışması, kalite kontrolü ve askeri/sosyal yardımlaşmanın temelidir.", 
            rota: [[36.54, 32.00], [37.87, 32.49]] 
        },
        { 
            id: "aksaray",
            isim: "Aksaray - Kervansaray Mimarisi", 
            kisaAd: "Aksaray: Sultanhanı",
            renk: "#2980b9", 
            startYear: 1332, 
            endYear: 1332, 
            odak: [38.24, 33.54],
            bilgi: "<b>Vakıf ve Menzil:</b> Dünyanın en büyük kervansaraylarından olan Sultanhanı buradadır. <i>Vakıf Sistemi</i> sayesinde tüccarlar 3 gün ücretsiz konaklama hakkına sahiptir.", 
            rota: [[37.87, 32.49], [38.24, 33.54]] 
        },
        { 
            id: "sivas",
            isim: "Sivas - Uluslararası Ticaret Düğümü", 
            kisaAd: "Sivas: Darüşşifa ve İlim",
            renk: "#27ae60", 
            startYear: 1332, 
            endYear: 1333, 
            odak: [39.75, 37.01],
            bilgi: "<b>Ekonomik Merkez:</b> İran'dan gelen İpek Yolu'nun Anadolu'daki ana durağıdır. Kentteki Gök Medrese ve şifahaneler Selçuklu'nun sosyal devlet yapısını kanıtlar.", 
            rota: [[38.24, 33.54], [39.00, 35.50], [39.75, 37.01]] 
        }
    ];

    let rotaCizgileri = {};
    let durakMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla
    seyahatVerisi.forEach(durak => {
        rotaCizgileri[durak.id] = L.polyline([], {color: durak.renk, weight: 5, opacity: 0.8})
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${durak.renk};">${durak.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${durak.bilgi}</p>
                        </div>`);

        durakMarkerlari[durak.id] = L.circleMarker(durak.odak, {
            radius: 6, color: '#fff', fillColor: durak.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${durak.renk};">${durak.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${durak.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        seyahatVerisi.forEach(durak => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= durak.endYear) {
                gosterilecekRota = durak.rota;
                markerAktif = true;
            } else if (guncelYil >= durak.startYear) {
                let oran = (guncelYil - durak.startYear) / (durak.endYear - durak.startYear);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(durak.rota.length * oran);
                gosterilecekRota = durak.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                rotaCizgileri[durak.id].addTo(window.currentMapInstance);
                rotaCizgileri[durak.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(rotaCizgileri[durak.id]);
            }

            if (markerAktif) {
                durakMarkerlari[durak.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(durakMarkerlari[durak.id]);
            }
        });
    }

    // Slider Kontrolü
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = '<i class="fa-solid fa-pen-nib"></i> Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">Güzergâh Durakları</h4>';
        
        seyahatVerisi.forEach(s => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 2px 4px; border-radius:4px;";
            item.innerHTML = `<i style="background: ${s.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <span>${s.kisaAd}</span>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(s.odak, 8, { duration: 1.5 });
                document.getElementById('yearSlider').value = s.endYear;
                document.getElementById('yearDisplay').innerText = s.endYear;
                haritayiYilaGoreGuncelle(s.endYear);
                setTimeout(() => { durakMarkerlari[s.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    haritayiYilaGoreGuncelle(1330); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 3. HARİTA: TÜRK-İSLAM MEDENİYETİNİN BİLİM VE KÜLTÜR MERKEZLERİ
window.HARITA_MOTORU["harita_u1_bilim_3"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte ve Ortalanmış
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1040" max="1100" value="1040" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Gelişim Yılı: <span id="yearDisplay" style="color: #E8A020;">1040</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">Büyük Selçuklu döneminde bilimin doğudan batıya yayılışını takip edin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Horasan ve Mezopotamya (Bilim Kuşağı)
    window.currentMapInstance = L.map('mapCanvas').setView([35.0, 50.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Bilim Merkezleri Veri Yapısı (Nizamiye Medreseleri ve Rasathaneler)
    const bilimVerisi = [
        { 
            id: "nisabur",
            isim: "Nişabur - İlk Nizamiye Medresesi", 
            kisaAd: "Nişabur: İlk Nizamiye",
            renk: "#8B1A1A", 
            startYear: 1040, 
            endYear: 1045, 
            odak: [36.21, 58.79],
            bilgi: "<b>İlk Adım:</b> Alparslan'ın veziri Nizâmülmülk tarafından ilk Nizamiye Medresesi burada açıldı. Gazali gibi büyük alimlerin yetiştiği bir merkezdir.", 
            rota: [[37.4, 61.2], [36.21, 58.79]] 
        },
        { 
            id: "bagdat",
            isim: "Bağdat - Medreselerin Zirvesi", 
            kisaAd: "Bağdat: Nizamiye Üniversitesi",
            renk: "#C9A84C", 
            startYear: 1065, 
            endYear: 1067, 
            odak: [33.31, 44.36],
            bilgi: "<b>Üniversite Eğitimi:</b> Dönemin en büyük yükseköğretim kurumu. Batıdaki üniversitelerin temelini oluşturur. Bilim, din ve siyasetin kalbi olmuştur.", 
            rota: [[36.21, 58.79], [34.3, 47.1], [33.31, 44.36]] 
        },
        { 
            id: "isfahan",
            isim: "İsfahan - Gökbilim ve Rasathane", 
            kisaAd: "İsfahan: Celali Takvimi",
            renk: "#2980b9", 
            startYear: 1074, 
            endYear: 1079, 
            odak: [32.65, 51.66],
            bilgi: "<b>Astronomi:</b> Ömer Hayyam başkanlığındaki heyet burada Celâli Takvimi'ni hazırladı. Dünyanın en gelişmiş rasathanelerinden biri kuruldu.", 
            rota: [[33.31, 44.36], [32.65, 51.66]] 
        },
        { 
            id: "merv",
            isim: "Merv - Şehirlerin Şahı", 
            kisaAd: "Merv: Kütüphaneler Şehri",
            renk: "#27ae60", 
            startYear: 1080, 
            endYear: 1090, 
            odak: [37.66, 62.19],
            bilgi: "<b>Kültür Mirası:</b> Onlarca büyük halk kütüphanesine sahip olan Merv, bilim insanlarının en büyük toplanma noktasıydı. 'Merv-i Şah-ı Cihan' olarak anılır.", 
            rota: [[32.65, 51.66], [35.0, 58.0], [37.66, 62.19]] 
        }
    ];

    let bilimCizgileri = {};
    let merkezMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla
    bilimVerisi.forEach(merkez => {
        bilimCizgileri[merkez.id] = L.polyline([], {color: merkez.renk, weight: 5, opacity: 0.8})
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${merkez.renk};">${merkez.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${merkez.bilgi}</p>
                        </div>`);

        merkezMarkerlari[merkez.id] = L.circleMarker(merkez.odak, {
            radius: 7, color: '#fff', fillColor: merkez.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${merkez.renk};">${merkez.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${merkez.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        bilimVerisi.forEach(merkez => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= merkez.endYear) {
                gosterilecekRota = merkez.rota;
                markerAktif = true;
            } else if (guncelYil >= merkez.startYear) {
                let oran = (guncelYil - merkez.startYear) / (merkez.endYear - merkez.startYear);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(merkez.rota.length * oran);
                gosterilecekRota = merkez.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                bilimCizgileri[merkez.id].addTo(window.currentMapInstance);
                bilimCizgileri[merkez.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(bilimCizgileri[merkez.id]);
            }

            if (markerAktif) {
                merkezMarkerlari[merkez.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(merkezMarkerlari[merkez.id]);
            }
        });
    }

    // Slider Event Listener
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe (İsteğe göre güncellendi)
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">İlim Merkezleri</h4>';
        
        bilimVerisi.forEach(b => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 2px 4px; border-radius:4px;";
            item.innerHTML = `<i style="background: ${b.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <span>${b.kisaAd}</span>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(b.odak, 8, { duration: 1.5 });
                document.getElementById('yearSlider').value = b.endYear;
                document.getElementById('yearDisplay').innerText = b.endYear;
                haritayiYilaGoreGuncelle(b.endYear);
                setTimeout(() => { merkezMarkerlari[b.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    haritayiYilaGoreGuncelle(1040); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 4. HARİTA: OĞUZ BOYLARININ GÖÇ YOLLARI VE ANADOLU'YU TÜRKLEŞTİRME
window.HARITA_MOTORU["harita_u1_oguz_4"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte ve Ortalanmış
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1020" max="1090" value="1020" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Göç Yılı: <span id="yearDisplay" style="color: #E8A020;">1020</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">Oğuz boylarının Horasan'dan Batı Anadolu'ya uzanan iskan sürecini takip edin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Orta Asya, İran ve Anadolu
    window.currentMapInstance = L.map('mapCanvas').setView([38.0, 48.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Göç Aşamaları Veri Yapısı (MEB Müfredatı Odaklı)
    const oguzVerisi = [
        { 
            id: "horasan",
            isim: "Maveraünnehir ve Horasan", 
            kisaAd: "Horasan: Göçün Başlaması",
            renk: "#8B1A1A", 
            startYear: 1020, 
            endYear: 1040, 
            odak: [38.5, 60.0], // Merv / Serahs bölgesi
            bilgi: "<b>Göçün Nedenleri:</b> Karahıtay/Moğol baskısı, otlak yetersizliği ve boylar arası mücadeleler nedeniyle Oğuzlar batıya, Selçuklu şemsiyesi altına göçtü.", 
            rota: [[41.0, 68.0], [39.0, 63.0], [37.5, 60.5]] 
        },
        { 
            id: "azerbaycan",
            isim: "Azerbaycan ve İran - Toplanma Hattı", 
            kisaAd: "Azerbaycan: Gaza Üssü",
            renk: "#C9A84C", 
            startYear: 1040, 
            endYear: 1070, 
            odak: [38.0, 46.3], // Tebriz bölgesi
            bilgi: "<b>İleri Karakol:</b> Anadolu'ya yönelik ilk keşif ve yıpratma akınlarının (Pasinler) organize edildiği, boyların toplandığı gaza merkezidir.", 
            rota: [[37.5, 60.5], [36.0, 53.0], [38.0, 46.3]] 
        },
        { 
            id: "dogu_anadolu",
            isim: "Doğu ve İç Anadolu'nun Türkleşmesi", 
            kisaAd: "İç Anadolu: İlk Beylikler",
            renk: "#2980b9", 
            startYear: 1071, 
            endYear: 1080, 
            odak: [39.7, 37.0], // Sivas / Erzurum bölgesi
            bilgi: "<b>Kılıç Hakkı:</b> Malazgirt sonrası Sultan Alparslan'ın emriyle Saltuklu, Mengücek, Danişmentli beylikleri kurularak Anadolu'nun İslamlaşması ve Türkleşmesi sağlandı.", 
            rota: [[38.0, 46.3], [39.9, 41.6], [39.7, 37.0]] 
        },
        { 
            id: "bati_anadolu",
            isim: "Batı Anadolu ve Uç Teşkilatı", 
            kisaAd: "Batı Anadolu: Uç Beylikleri",
            renk: "#27ae60", 
            startYear: 1080, 
            endYear: 1090, 
            odak: [38.4, 27.1], // İzmir / İznik bölgesi
            bilgi: "<b>Uç Teşkilatı:</b> Bizans sınırına yerleştirilen Türkmen boyları <i>Gaza</i> felsefesiyle sınırları korudu. Çaka Beyliği ile denizcilik başladı, İznik'te Türkiye Selçuklu Devleti kuruldu.", 
            rota: [[39.7, 37.0], [39.9, 32.8], [40.4, 29.7], [38.4, 27.1]] 
        }
    ];

    let gocCizgileri = {};
    let asamaMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla (Ekrana henüz basmıyoruz)
    oguzVerisi.forEach(asama => {
        gocCizgileri[asama.id] = L.polyline([], {color: asama.renk, weight: 6, opacity: 0.8, dashArray: '10, 10'}) // Göç yolu olduğu için kesik çizgi
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${asama.renk};">${asama.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${asama.bilgi}</p>
                        </div>`);

        asamaMarkerlari[asama.id] = L.circleMarker(asama.odak, {
            radius: 7, color: '#fff', fillColor: asama.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${asama.renk};">${asama.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${asama.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        oguzVerisi.forEach(asama => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= asama.endYear) {
                gosterilecekRota = asama.rota;
                markerAktif = true;
            } else if (guncelYil >= asama.startYear) {
                let oran = (guncelYil - asama.startYear) / (asama.endYear - asama.startYear);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(asama.rota.length * oran);
                gosterilecekRota = asama.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                gocCizgileri[asama.id].addTo(window.currentMapInstance);
                gocCizgileri[asama.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(gocCizgileri[asama.id]);
            }

            if (markerAktif) {
                asamaMarkerlari[asama.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(asamaMarkerlari[asama.id]);
            }
        });
    }

    // Slider Kontrolü
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe (İsteğe göre güncellendi)
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">Türkleşme Aşamaları</h4>';
        
        oguzVerisi.forEach(o => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 2px 4px; border-radius:4px;";
            item.innerHTML = `<i style="background: ${o.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <span>${o.kisaAd}</span>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(o.odak, 6, { duration: 1.5 });
                document.getElementById('yearSlider').value = o.endYear;
                document.getElementById('yearDisplay').innerText = o.endYear;
                haritayiYilaGoreGuncelle(o.endYear);
                setTimeout(() => { asamaMarkerlari[o.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    haritayiYilaGoreGuncelle(1020); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 5. HARİTA: KUT ANLAYIŞI VE SELÇUKLU İDARİ TEŞKİLATI
window.HARITA_MOTORU["harita_u1_idari_5"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte ve Ortalanmış
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1040" max="1092" value="1040" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Yönetim Dönemi: <span id="yearDisplay" style="color: #E8A020;">1040</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">Selçuklu devlet teşkilatlanmasının ve merkezlerin değişimini takip edin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Horasan - İran - Mezopotamya (Yönetim Kuşağı)
    window.currentMapInstance = L.map('mapCanvas').setView([35.0, 52.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // İdari Merkezler ve Teşkilat Veri Yapısı (MEB Müfredatı Odaklı)
    const idariVeri = [
        { 
            id: "merv_rey",
            isim: "Nişabur ve Rey - İlk Merkezler", 
            kisaAd: "Rey: Batı Operasyon Merkezi",
            renk: "#8B1A1A", 
            startYear: 1040, 
            endYear: 1060, 
            odak: [35.59, 51.44], // Rey (Tahran yanı)
            bilgi: "<b>Teşkilatlanma:</b> Tuğrul Bey başkenti Nişabur'dan Rey'e taşıyarak merkezi otoriteyi batıya kaydırdı. <i>Kut Anlayışı</i> gereği ülke hanedanın ortak malı sayıldı ve eyaletlere hanedan üyeleri atandı.", 
            rota: [[37.66, 62.19], [36.21, 58.79], [35.59, 51.44]] 
        },
        { 
            id: "isfahan",
            isim: "İsfahan - İmparatorluk Merkezi", 
            kisaAd: "İsfahan: Zirve Dönemi",
            renk: "#C9A84C", 
            startYear: 1061, 
            endYear: 1072, 
            odak: [32.65, 51.66],
            bilgi: "<b>Merkezi Otorite:</b> Sultan Melikşah döneminde başkent İsfahan oldu. <i>Vezirlik Makamı</i> (Nizamülmülk) güçlendi. Divan-ı Saltanat bürokrasisi en olgun seviyesine ulaştı.", 
            rota: [[35.59, 51.44], [32.65, 51.66]] 
        },
        { 
            id: "ikta_yayilimi",
            isim: "İkta Sistemi ve Toprak Yönetimi", 
            kisaAd: "İkta: Askeri ve Zirai Düzen",
            renk: "#2980b9", 
            startYear: 1073, 
            endYear: 1085, 
            odak: [34.00, 45.00], // Mezopotamya / İran sınırı
            bilgi: "<b>İkta Sistemi:</b> Nizamülmülk'ün sistemleştirdiği bu yapı sayesinde; hazineden para çıkmadan ordu beslendi, üretimde süreklilik sağlandı ve taşrada güvenlik pekişti.", 
            rota: [[32.65, 51.66], [33.31, 44.36], [36.20, 37.15]] 
        },
        { 
            id: "atabeylikler",
            isim: "Taşra Teşkilatı ve Atabeylikler", 
            kisaAd: "Atabeylik: Şehzade Eğitimi",
            renk: "#27ae60", 
            startYear: 1086, 
            endYear: 1092, 
            odak: [36.34, 43.12], // Musul bölgesi
            bilgi: "<b>İdari Eğitim:</b> Sultanın çocukları (melikler) tecrübe kazanmaları için eyaletlere gönderildi. Yanlarına eğitmen olarak <i>Atabeyler</i> verildi. Bu durum merkezi otorite zayıflayınca bağımsız devletçiklerin kurulmasına yol açtı.", 
            rota: [[33.31, 44.36], [36.34, 43.12], [36.20, 44.00]] 
        }
    ];

    let idariCizgileri = {};
    let merkezMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla
    idariVeri.forEach(merkez => {
        idariCizgileri[merkez.id] = L.polyline([], {color: merkez.renk, weight: 6, opacity: 0.8})
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${merkez.renk};">${merkez.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${merkez.bilgi}</p>
                        </div>`);

        merkezMarkerlari[merkez.id] = L.circleMarker(merkez.odak, {
            radius: 7, color: '#fff', fillColor: merkez.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${merkez.renk};">${merkez.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${merkez.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        idariVeri.forEach(merkez => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= merkez.endYear) {
                gosterilecekRota = merkez.rota;
                markerAktif = true;
            } else if (guncelYil >= merkez.startYear) {
                let oran = (guncelYil - merkez.startYear) / (merkez.endYear - merkez.startYear);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(merkez.rota.length * oran);
                gosterilecekRota = merkez.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                idariCizgileri[merkez.id].addTo(window.currentMapInstance);
                idariCizgileri[merkez.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(idariCizgileri[merkez.id]);
            }

            if (markerAktif) {
                merkezMarkerlari[merkez.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(merkezMarkerlari[merkez.id]);
            }
        });
    }

    // Slider Event Listener
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">İdari Yapı</h4>';
        
        idariVeri.forEach(idari => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 2px 4px; border-radius:4px;";
            item.innerHTML = `<i style="background: ${idari.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <span>${idari.kisaAd}</span>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(idari.odak, 6, { duration: 1.5 });
                document.getElementById('yearSlider').value = idari.endYear;
                document.getElementById('yearDisplay').innerText = idari.endYear;
                haritayiYilaGoreGuncelle(idari.endYear);
                setTimeout(() => { merkezMarkerlari[idari.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    haritayiYilaGoreGuncelle(1040); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 6. HARİTA: HAÇLI SEFERLERİ VE ANADOLU'NUN SAVUNULMASI
window.HARITA_MOTORU["harita_u1_hacli_6"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte ve Ortalanmış
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1096" max="1192" value="1096" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Sefer Yılı: <span id="yearDisplay" style="color: #E8A020;">1096</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">Anadolu Selçuklu ve Eyyubilerin Haçlılara karşı mücadelesini takip edin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Avrupa'dan Levant'a (Doğu Akdeniz)
    window.currentMapInstance = L.map('mapCanvas').setView([38.0, 32.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Haçlı Seferleri Veri Yapısı (MEB Müfredatı Odaklı)
    const hacliVerisi = [
        { 
            id: "birinci_sefer",
            isim: "I. Haçlı Seferi ve İznik'in Düşüşü", 
            kisaAd: "I. Sefer (1096-1099)",
            renk: "#8B1A1A", 
            startYear: 1096, 
            endYear: 1099, 
            odak: [40.42, 29.71], // İznik
            bilgi: "<b>Başkent Değişti:</b> I. Kılıç Arslan İznik'i kaybedince başkenti Konya'ya taşıdı. Haçlılar Kudüs'ü işgal edip Latin Krallığı kurdular. Amacına ulaşan tek seferdir.", 
            rota: [[48.85, 2.35], [41.00, 28.97], [40.42, 29.71], [36.20, 36.16], [31.77, 35.21]] 
        },
        { 
            id: "ikinci_sefer",
            isim: "II. Haçlı Seferi ve Anadolu Savunması", 
            kisaAd: "II. Sefer (1147-1149)",
            renk: "#C9A84C", 
            startYear: 1147, 
            endYear: 1149, 
            odak: [39.77, 30.52], // Eskişehir (Dorileon)
            bilgi: "<b>Kralların Katılımı:</b> Musul Atabeyi Zengi'nin Urfa'yı almasıyla başladı. Sultan I. Mesud, Alman ve Fransız krallarını Eskişehir (Dorileon) ovasında ağır bir yenilgiye uğrattı.", 
            rota: [[48.85, 2.35], [41.00, 28.97], [39.77, 30.52], [36.89, 30.71], [33.51, 36.29]] 
        },
        { 
            id: "hittin",
            isim: "Hıttin Savaşı (1187)", 
            kisaAd: "Hıttin Savaşı (1187)",
            renk: "#27ae60", 
            startYear: 1187, 
            endYear: 1187, 
            odak: [32.80, 35.44], // Taberiye Gölü / Hıttin
            bilgi: "<b>Kudüs'ün Kurtuluşu:</b> Selahaddin Eyyubi, Haçlı ordusunu Hıttin'de yok ederek Kudüs'ü 88 yıl sonra geri aldı. Bu şanlı zafer, III. Haçlı Seferi'nin doğrudan tetikleyicisi oldu.", 
            rota: [[33.51, 36.29], [32.80, 35.44]] 
        },
        { 
            id: "ucuncu_sefer",
            isim: "III. Haçlı Seferi ve Barbarossa", 
            kisaAd: "III. Sefer (1189-1192)",
            renk: "#2980b9", 
            startYear: 1189, 
            endYear: 1192, 
            odak: [36.37, 33.93], // Silifke
            bilgi: "<b>Selahaddin'in Zaferi:</b> İngiliz (Aslan Yürekli Richard), Fransız ve Alman kralları katıldı. Alman Kralı Barbarossa Silifke Çayı'nda boğuldu. Kudüs, Eyyubilerde kaldı.", 
            rota: [[51.50, -0.12], [46.20, 6.14], [41.00, 28.97], [36.37, 33.93], [32.92, 35.08]] 
        }
    ];

    let seferCizgileri = {};
    let savasMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla
    hacliVerisi.forEach(sefer => {
        seferCizgileri[sefer.id] = L.polyline([], {color: sefer.renk, weight: 6, opacity: 0.8, dashArray: '8, 8'}) 
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${sefer.renk};">${sefer.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${sefer.bilgi}</p>
                        </div>`);

        savasMarkerlari[sefer.id] = L.circleMarker(sefer.odak, {
            radius: 7, color: '#fff', fillColor: sefer.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${sefer.renk};">${sefer.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${sefer.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        hacliVerisi.forEach(sefer => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= sefer.endYear) {
                gosterilecekRota = sefer.rota;
                markerAktif = true;
            } else if (guncelYil >= sefer.startYear) {
                let oran = (guncelYil - sefer.startYear) / (sefer.endYear - sefer.startYear);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(sefer.rota.length * oran);
                gosterilecekRota = sefer.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                seferCizgileri[sefer.id].addTo(window.currentMapInstance);
                seferCizgileri[sefer.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(seferCizgileri[sefer.id]);
            }

            if (markerAktif) {
                savasMarkerlari[sefer.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(savasMarkerlari[sefer.id]);
            }
        });
    }

    // Slider Event Listener
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">Kritik Aşamalar</h4>';
        
        hacliVerisi.forEach(h => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 2px 4px; border-radius:4px;";
            item.innerHTML = `<i style="background: ${h.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <span>${h.kisaAd}</span>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(h.odak, 6, { duration: 1.5 });
                document.getElementById('yearSlider').value = h.endYear;
                document.getElementById('yearDisplay').innerText = h.endYear;
                haritayiYilaGoreGuncelle(h.endYear);
                setTimeout(() => { savasMarkerlari[h.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    haritayiYilaGoreGuncelle(1096); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 7. HARİTA: İLK TÜRK-İSLAM BEYLİKLERİ VE MİMARİ ESERLER (1071 SONRASI)
window.HARITA_MOTORU["harita_u1_beylikler_7"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider yerine bilgilendirme ve yönlendirme paneli
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; padding: 5px;">
            <h3 style="margin:0 0 5px 0; color: #E8A020; font-size: 1.2em;">Anadolu'nun Bayındır Hale Getirilmesi</h3>
            <p style="font-size: 0.85em; opacity: 0.8; margin:0;">Beyliklerin etki alanlarını ve inşa ettikleri mimari eserleri görmek için aşağıdaki lejanttan seçim yapınız.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Anadolu Genel Görünüm
    window.currentMapInstance = L.map('mapCanvas').setView([39.0, 35.0], 6);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Beylikler ve Eserler Veri Yapısı
    const beylikVerisi = [
        {
            id: "danisment",
            isim: "Danişmentliler (Sivas, Tokat, Kayseri)",
            kisaAd: "Danişmentliler",
            renk: "#2980b9",
            odak: [39.5, 36.5],
            bilgi: "Anadolu'da kurulan beyliklerin en güçlüsüdür. Kendi adlarına para bastırmış ve eğitime büyük önem vermişlerdir.",
            eserler: [
                { ad: "Yağıbasan Medresesi", koord: [40.58, 36.94], detay: "<b>Niksar/Tokat:</b> Anadolu'da kurulan <i>İLK medresedir</i>. Kubbeli avlulu medrese tipinin öncüsüdür." }
            ],
            // Sivas-Tokat bölgesi kaba poligonu
            sinirlar: [[40.8, 35.0], [40.8, 37.5], [38.5, 38.0], [38.5, 35.0]]
        },
        {
            id: "saltuklu",
            isim: "Saltuklular (Erzurum ve Çevresi)",
            kisaAd: "Saltuklular",
            renk: "#8B1A1A",
            odak: [40.2, 41.5],
            bilgi: "Anadolu'da kurulan ilk Türk beyliğidir. Haçlılara ve Gürcülere karşı doğu sınırlarını korumuşlardır.",
            eserler: [
                { ad: "Üç Kümbetler", koord: [39.90, 41.27], detay: "<b>Erzurum:</b> Anadolu'daki anıt mezar (kümbet) mimarisinin ilk ve en güzel örneklerindendir." },
                { ad: "Mama Hatun Külliyesi", koord: [39.78, 40.38], detay: "<b>Tercan:</b> Kervansaray, hamam ve türbeden oluşan eşsiz bir külliyedir." }
            ],
            // Erzurum bölgesi kaba poligonu
            sinirlar: [[40.8, 41.0], [40.8, 43.5], [39.5, 43.0], [39.5, 40.5]]
        },
        {
            id: "mengucek",
            isim: "Mengücekliler (Erzincan, Divriği)",
            kisaAd: "Mengücekliler",
            renk: "#C9A84C",
            odak: [39.5, 38.8],
            bilgi: "Deprem bölgesi olmalarına rağmen eşsiz taş işçiliği eserleri bırakmış, bilim adamlarını himaye etmişlerdir.",
            eserler: [
                { ad: "Divriği Ulu Camii ve Darüşşifası", koord: [39.37, 38.11], detay: "<b>UNESCO Mirası:</b> 'Anadolu'nun Elhamrası' olarak bilinir. Taş işçiliğinin zirvesidir, gölgeleriyle (Namaz kılan silüet) ünlüdür." }
            ],
            // Erzincan-Divriği kaba poligonu
            sinirlar: [[40.0, 38.0], [40.0, 40.0], [39.0, 39.5], [39.0, 37.5]]
        },
        {
            id: "artuklu",
            isim: "Artuklular (Diyarbakır, Mardin, Batman)",
            kisaAd: "Artuklular",
            renk: "#27ae60",
            odak: [37.7, 40.5],
            bilgi: "Güneydoğu Anadolu'da hüküm sürmüş, bilim (El-Cezeri) ve mimaride (köprüler) altın çağ yaşatmışlardır.",
            eserler: [
                { ad: "Malabadi Köprüsü", koord: [38.15, 41.20], detay: "<b>Batman (Silvan Sınırı):</b> Dünyadaki en geniş kemerli taş köprüdür. Artuklu mühendisliğinin şaheseridir." },
                { ad: "Hasankeyf Külliyesi", koord: [37.71, 41.41], detay: "<b>Batman:</b> Dicle Nehri kıyısında, medeniyetlerin buluşma noktası olan muazzam Artuklu başkentlerinden biridir." },
                { ad: "Hatuniye Medresesi", koord: [37.31, 40.73], detay: "<b>Mardin:</b> Artuklu taş işçiliğinin eşsiz örneklerinden biridir, dilimli kubbesiyle dikkat çeker." }
            ],
            // Diyarbakır-Batman-Mardin kaba poligonu
            sinirlar: [[38.2, 39.0], [38.2, 42.0], [37.0, 42.0], [37.0, 39.0]]
        },
        {
            id: "caka",
            isim: "Çaka Beyliği (İzmir ve Çevresi)",
            kisaAd: "Çaka Beyliği",
            renk: "#8e44ad",
            odak: [38.4, 27.1],
            bilgi: "İlk Türk denizcisi Çaka Bey tarafından kurulmuş, Bizans'ı denizden kuşatmışlardır.",
            eserler: [
                { ad: "İlk Türk Tersanesi", koord: [38.42, 27.14], detay: "<b>İzmir:</b> 1081 yılında kurulan bu tersane ile Türk Deniz Kuvvetleri'nin temelleri atılmıştır." }
            ],
            // İzmir kaba poligonu
            sinirlar: [[39.0, 26.0], [39.0, 28.0], [37.8, 28.0], [37.8, 26.0]]
        }
    ];

    const highContrastColor = "#2c3e50 !important";
    let poligonlar = {};
    let eserMarkerlari = {};

    // Eserler için özel ikon
    const eserIcon = L.divIcon({
        className: 'custom-eser-icon',
        html: `<div style="background-color:#E8A020; width:18px; height:18px; border-radius:3px; border:2px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-monument" style="color:#2c3e50; font-size:10px;"></i></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    // Beylik poligonlarını ve eser markerlarını oluştur (Başlangıçta hepsi haritada)
    beylikVerisi.forEach(beylik => {
        // Poligonlar (Etki Alanları)
        poligonlar[beylik.id] = L.polygon(beylik.sinirlar, {
            color: beylik.renk,
            weight: 2,
            fillColor: beylik.renk,
            fillOpacity: 0.3
        }).addTo(window.currentMapInstance)
          .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${beylik.renk};">${beylik.isim}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${beylik.bilgi}</p>
                      </div>`);

        // Eser Markerları (Başlangıçta gizli tutmak için array içinde saklıyoruz)
        eserMarkerlari[beylik.id] = [];
        beylik.eserler.forEach(eser => {
            let marker = L.marker(eser.koord, {icon: eserIcon})
                .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                                <h4 style="margin:0 0 5px 0; color:#E8A020; border-bottom:1px solid #ccc; padding-bottom:3px;">${eser.ad}</h4>
                                <p style="margin:0; font-size:13px; line-height:1.4;">${eser.detay}</p>
                            </div>`);
            eserMarkerlari[beylik.id].push(marker);
        });
    });

    // Sadece seçili beyliğin eserlerini gösteren fonksiyon
    function eserleriGoster(secilenId) {
        // Tüm poligonların opaklığını düşür, seçileni parlat
        beylikVerisi.forEach(b => {
            if(b.id === secilenId) {
                poligonlar[b.id].setStyle({ fillOpacity: 0.6, weight: 4 });
            } else {
                poligonlar[b.id].setStyle({ fillOpacity: 0.1, weight: 1 });
            }
            
            // Tüm markerları haritadan temizle
            eserMarkerlari[b.id].forEach(m => window.currentMapInstance.removeLayer(m));
        });

        // Sadece seçilen beyliğin eserlerini haritaya ekle
        eserMarkerlari[secilenId].forEach(m => m.addTo(window.currentMapInstance));
    }

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">1. Beylikler ve Eserleri</h4>';
        
        beylikVerisi.forEach(b => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:12px; cursor:pointer; padding: 4px; border-radius:4px; transition: background 0.2s;";
            
            item.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
            item.onmouseout = function() { this.style.background = 'transparent'; };

            item.innerHTML = `<i style="background: ${b.renk}; width: 14px; height: 14px; border-radius:3px; display: inline-block; margin-right: 8px;"></i> <b>${b.kisaAd}</b>`;

            // Lejanta Tıklama Olayı (Eserleri göster ve oraya uç)
            item.onclick = function() {
                window.currentMapInstance.flyTo(b.odak, 7, { duration: 1.5 });
                eserleriGoster(b.id);
                
                // İlk eserin pop-up'ını otomatik aç
                setTimeout(() => { 
                    if(eserMarkerlari[b.id].length > 0) {
                        eserMarkerlari[b.id][0].openPopup();
                    }
                }, 1500); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 8. HARİTA: MİRYOKEFALON SAVAŞI VE YURT TUTAN STRATEJİSİ (1176)
window.HARITA_MOTORU["harita_u1_miryokefalon_8"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte. "Yıl" yerine "Aşama" mantığı.
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="phaseSlider" min="1" max="4" value="1" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="phaseSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Harekat Aşaması: <span id="phaseDisplay" style="color: #E8A020;">1. Bizans Taarruzu</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">II. Kılıç Arslan'ın savunma ve pusu stratejisini adım adım izleyin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Göller Yöresi ve Denizli/Isparta Hattı
    window.currentMapInstance = L.map('mapCanvas').setView([39.0, 30.5], 6);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Savaş Aşamaları Veri Yapısı (MEB Müfredatı Odaklı)
    const savasVerisi = [
        { 
            id: "taarruz",
            isim: "Manuel Komnenos'un Büyük Taarruzu", 
            kisaAd: "1. Bizans Taarruzu",
            etiket: "1. Bizans Taarruzu",
            renk: "#2980b9", 
            startPhase: 1, 
            endPhase: 2, 
            odak: [39.77, 30.52], // Eskişehir
            bilgi: "<b>Hedef Türkleri Atmak:</b> Bizans İmparatoru Manuel, Türkleri Anadolu'dan tamamen sökmek için devasa kuşatma makineleri ve zırhlı birliklerle İstanbul'dan yola çıktı.", 
            rota: [[41.0, 28.9], [39.77, 30.52], [38.5, 29.5]] 
        },
        { 
            id: "yipratma",
            isim: "II. Kılıç Arslan'ın Yıpratma Taktikleri", 
            kisaAd: "2. Yıpratma Savaşı",
            etiket: "2. Yıpratma Savaşı",
            renk: "#C9A84C", 
            startPhase: 2, 
            endPhase: 3, 
            odak: [38.3, 30.0], // Sandıklı / Çivril arası
            bilgi: "<b>Stratejik Geri Çekilme:</b> Türk hafif süvarileri Bizans'ı dar vadilere doğru çekti. Yol üzerindeki su kuyuları zehirlendi, ekinler yakılarak devasa ordu aç ve susuz bırakıldı.", 
            rota: [[38.5, 29.5], [38.3, 30.0], [38.16, 30.5]] 
        },
        { 
            id: "pusu",
            isim: "Bağırsak Boğazı (Tzibritze) Pususu", 
            kisaAd: "3. Vadide Pusu",
            etiket: "3. Boğazda Pusu",
            renk: "#8B1A1A", 
            startPhase: 3, 
            endPhase: 4, 
            odak: [38.16, 30.84], // Eğirdir / Gelendost bölgesi
            bilgi: "<b>17 Eylül 1176:</b> Ağır Bizans ordusu dar bir geçide sıkıştırıldı. Yamaçlara gizlenmiş Türk okçuları, Bizans'ın merkezini ve çok güvendiği kuşatma makinelerini tamamen imha etti.", 
            rota: [[38.16, 30.5], [38.16, 30.84]] 
        },
        { 
            id: "sonuc",
            isim: "Yurt Tutan: Kesin Zafer", 
            kisaAd: "4. Yurt Tutan Zaferi",
            etiket: "4. Yurt Tutan Zaferi",
            renk: "#27ae60", 
            startPhase: 4, 
            endPhase: 4, 
            odak: [37.8, 32.5], // Konya (Başkent)
            bilgi: "<b>Anadolu'nun Tapusu:</b> Bu zaferle Bizans taarruzdan savunmaya geçti. Anadolu'yu geri alma ümitleri bitti. Batı dünyası Anadolu'ya kesin olarak <i>'Türkiye'</i> demeye başladı.", 
            rota: [[38.16, 30.84], [37.8, 32.5]] 
        }
    ];

    let asamaCizgileri = {};
    let savasMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla
    savasVerisi.forEach(asama => {
        asamaCizgileri[asama.id] = L.polyline([], {color: asama.renk, weight: 6, opacity: 0.8, dashArray: (asama.id === 'taarruz' ? '1, 0' : '10, 10')}) 
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${asama.renk};">${asama.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${asama.bilgi}</p>
                        </div>`);

        savasMarkerlari[asama.id] = L.circleMarker(asama.odak, {
            radius: 8, color: '#fff', fillColor: asama.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${asama.renk};">${asama.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${asama.bilgi}</p>
                      </div>`);
    });

    function haritayiAsamayaGoreGuncelle(guncelAsama) {
        savasVerisi.forEach(asama => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelAsama >= asama.endPhase) {
                gosterilecekRota = asama.rota;
                markerAktif = true;
            } else if (guncelAsama >= asama.startPhase) {
                let oran = (guncelAsama - asama.startPhase) / (asama.endPhase - asama.startPhase);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(asama.rota.length * oran);
                gosterilecekRota = asama.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                asamaCizgileri[asama.id].addTo(window.currentMapInstance);
                asamaCizgileri[asama.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(asamaCizgileri[asama.id]);
            }

            if (markerAktif) {
                savasMarkerlari[asama.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(savasMarkerlari[asama.id]);
            }
        });
    }

    // Slider Event Listener (Sayısal değeri Metinsel Etikete Çeviriyoruz)
    document.getElementById('phaseSlider').addEventListener('input', function(e) {
        const secilenAsama = parseInt(e.target.value);
        const secilenVeri = savasVerisi.find(v => v.startPhase === secilenAsama || (secilenAsama === 4 && v.id === "sonuc"));
        
        document.getElementById('phaseDisplay').innerText = secilenVeri ? secilenVeri.etiket : secilenAsama + ". Aşama";
        haritayiAsamayaGoreGuncelle(secilenAsama);
    });

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">Savaşın Seyri</h4>';
        
        savasVerisi.forEach(s => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 4px; border-radius:4px; transition: background 0.2s;";
            
            item.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
            item.onmouseout = function() { this.style.background = 'transparent'; };

            item.innerHTML = `<i style="background: ${s.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <b>${s.kisaAd}</b>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(s.odak, 7, { duration: 1.5 });
                document.getElementById('phaseSlider').value = s.endPhase;
                document.getElementById('phaseDisplay').innerText = s.etiket;
                haritayiAsamayaGoreGuncelle(s.endPhase);
                setTimeout(() => { savasMarkerlari[s.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    // Başlangıç Durumu (1. Aşama)
    haritayiAsamayaGoreGuncelle(1); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 9. HARİTA: I. ALAEDDİN KEYKUBAT: ZİRVE DÖNEMİ VE DENİZ AŞIRI SEFERLER
window.HARITA_MOTORU["harita_u1_keykubat_9"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte.
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1220" max="1237" value="1220" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #E8A020; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Dönem Yılı: <span id="yearDisplay" style="color: #E8A020;">1220</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">Selçuklu'nun en geniş sınırlarını ve stratejik hamlelerini takip edin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Kırım'dan Akdeniz'e kadar geniş bir perspektif
    window.currentMapInstance = L.map('mapCanvas').setView([40.0, 35.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // Keykubat Dönemi Veri Yapısı (MEB Müfredatı Odaklı)
    const keykubatVerisi = [
        { 
            id: "alanya",
            isim: "Alanya'nın Fethi ve İlk Tersane", 
            kisaAd: "Alanya (1221): Akdeniz Gücü",
            renk: "#2980b9", 
            startYear: 1220, 
            endYear: 1221, 
            odak: [36.54, 32.00], // Alanya
            bilgi: "<b>Deniz Gücü ve Sigortacılık:</b> Akdeniz ticaretini kontrol için fethedildi ve ilk Selçuklu tersanesi kuruldu. Tüccarlara <i>Devlet Sigortası</i> (zarar tazmini) uygulanarak uluslararası ticaret teşvik edildi.", 
            rota: [[37.87, 32.49], [36.54, 32.00]] 
        },
        { 
            id: "sugdak",
            isim: "Suğdak (Kırım) Deniz Aşırı Seferi", 
            kisaAd: "Suğdak (1225): Deniz Aşırı Sefer",
            renk: "#27ae60", 
            startYear: 1222, 
            endYear: 1225, 
            odak: [44.85, 34.97], // Kırım / Suğdak
            bilgi: "<b>Karadeniz Hâkimiyeti:</b> İpek Yolu'nun kuzey hattını güvenceye almak için Sinop'tan donanma gönderildi. Bu, Selçuklu tarihindeki <i>ilk deniz aşırı seferdir</i>.", 
            rota: [[42.02, 35.15], [44.85, 34.97]] // Sinop'tan Suğdak'a (Deniz Rotası)
        },
        { 
            id: "yassicemen",
            isim: "Yassıçemen Savaşı", 
            kisaAd: "Yassıçemen (1230): Tampon Bölge",
            renk: "#8B1A1A", 
            startYear: 1226, 
            endYear: 1230, 
            odak: [39.75, 39.50], // Erzincan civarı
            bilgi: "<b>Stratejik Zafiyet:</b> Harzemşahlar mağlup edilip yıkılış sürecine girdi. Ancak bu zafer, Selçuklu ile Moğollar (İlhanlılar) arasındaki <i>tampon bölgeyi</i> ortadan kaldırdığı için uzun vadede felaket getirdi.", 
            rota: [[37.87, 32.49], [39.00, 35.50], [39.75, 39.50]] 
        }
    ];

    let seferCizgileri = {};
    let olayMarkerlari = {}; 
    const highContrastColor = "#2c3e50 !important";

    // Modülleri Hazırla
    keykubatVerisi.forEach(sefer => {
        // Deniz rotası için kesik çizgi, kara rotası için düz çizgi
        let cizgiStili = sefer.id === 'sugdak' ? '10, 10' : '';
        
        seferCizgileri[sefer.id] = L.polyline([], {color: sefer.renk, weight: 6, opacity: 0.8, dashArray: cizgiStili}) 
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                            <h4 style="margin:0 0 5px 0; color:${sefer.renk};">${sefer.isim}</h4>
                            <p style="margin:0; font-size:13px; line-height:1.4;">${sefer.bilgi}</p>
                        </div>`);

        olayMarkerlari[sefer.id] = L.circleMarker(sefer.odak, {
            radius: 8, color: '#fff', fillColor: sefer.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${sefer.renk};">${sefer.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${sefer.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        keykubatVerisi.forEach(sefer => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= sefer.endYear) {
                gosterilecekRota = sefer.rota;
                markerAktif = true;
            } else if (guncelYil >= sefer.startYear) {
                let oran = (guncelYil - sefer.startYear) / (sefer.endYear - sefer.startYear);
                if (oran === 0) oran = 0.1;
                let hedefIndex = Math.floor(sefer.rota.length * oran);
                gosterilecekRota = sefer.rota.slice(0, hedefIndex + 1);
            }

            if (gosterilecekRota.length > 0) {
                seferCizgileri[sefer.id].addTo(window.currentMapInstance);
                seferCizgileri[sefer.id].setLatLngs(gosterilecekRota);
            } else {
                window.currentMapInstance.removeLayer(seferCizgileri[sefer.id]);
            }

            if (markerAktif) {
                olayMarkerlari[sefer.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(olayMarkerlari[sefer.id]);
            }
        });
    }

    // Slider Kontrolü
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">Dönemin Kilit Olayları</h4>';
        
        keykubatVerisi.forEach(k => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 4px; border-radius:4px; transition: background 0.2s;";
            
            item.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
            item.onmouseout = function() { this.style.background = 'transparent'; };

            item.innerHTML = `<i style="background: ${k.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <b>${k.kisaAd}</b>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(k.odak, 6, { duration: 1.5 });
                document.getElementById('yearSlider').value = k.endYear;
                document.getElementById('yearDisplay').innerText = k.endYear;
                haritayiYilaGoreGuncelle(k.endYear);
                setTimeout(() => { olayMarkerlari[k.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    haritayiYilaGoreGuncelle(1220); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 10. HARİTA: KÖSEDAĞ SAVAŞI VE SİYASİ BİRLİĞİN PARÇALANMASI
window.HARITA_MOTORU["harita_u1_kosedag_10"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    // Slider Üstte, %60 Genişlikte. Yıllar (1242 - 1300)
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="range" id="yearSlider" min="1242" max="1300" value="1242" step="1" 
                   style="width: 60%; cursor: pointer; accent-color: #8B1A1A; margin: 0 auto;">
            <label for="yearSlider" style="font-size: 1.1em; margin-bottom: 5px;">
                <b>Tarih: <span id="yearDisplay" style="color: #E8A020;">1242</span></b>
            </label>
            <p style="font-size: 0.85em; opacity: 0.8;">Moğol istilasını ve siyasi birliğin bozulmasını gözlemleyin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Harita Odak Noktası: Anadolu
    window.currentMapInstance = L.map('mapCanvas').setView([39.0, 35.0], 6);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const highContrastColor = "#2c3e50 !important";

    // Kösedağ Aşamaları Veri Yapısı
    const kosedagVerisi = [
        { 
            id: "ilerleyis",
            isim: "Moğol İlerleyişi ve Erzurum", 
            kisaAd: "1242: Erzurum İşgali",
            renk: "#8B1A1A", 
            startYear: 1242, 
            endYear: 1242, 
            odak: [39.9, 41.2], 
            bilgi: "<b>İlk Darbe:</b> Baycu Noyan komutasındaki Moğol ordusu, savunma hattındaki Erzurum'u işgal edip büyük bir yıkım yarattı.", 
            rota: [[38.0, 46.0], [39.9, 41.2]] 
        },
        { 
            id: "kosedag",
            isim: "Kösedağ Savaşı ve Bozgun", 
            kisaAd: "1243: Kösedağ Savaşı",
            renk: "#C9A84C", 
            startYear: 1243, 
            endYear: 1250, 
            odak: [40.0, 37.8], 
            bilgi: "<b>Büyük Yıkım:</b> II. Gıyaseddin Keyhüsrev komutasındaki Selçuklu ordusu Sivas/Kösedağ ovasında dağıldı. Devlet, Moğol (İlhanlı) egemenliğine girdi.", 
            rota: [[39.9, 41.2], [40.0, 37.8]] 
        },
        { 
            id: "tahakkum",
            isim: "İlhanlı Baskısı", 
            kisaAd: "1251-1277: Moğol Tahakkümü",
            renk: "#2980b9", 
            startYear: 1251, 
            endYear: 1277, 
            odak: [38.7, 35.4], 
            bilgi: "<b>Bağımlılık Dönemi:</b> Moğollar Kayseri ve başkent Konya'yı yağmaladı. Sultanlar İlhanlı valilerinin kuklası durumuna düştü.", 
            rota: [[40.0, 37.8], [38.7, 35.4], [37.8, 32.5]] 
        },
        { 
            id: "parcalanma",
            isim: "Siyasi Birliğin Parçalanması", 
            kisaAd: "1278+: İkinci Beylikler",
            renk: "#27ae60", 
            startYear: 1278, 
            endYear: 1300, 
            odak: [39.0, 32.0], 
            bilgi: "<b>Otorite Boşluğu:</b> Merkezi gücün tamamen çökmesiyle sınır boylarındaki Türkmenler (Uçlar) bağımsızlık ilan etti. Anadolu yamalı bohçaya döndü.", 
            rota: [] 
        }
    ];

    // Tek Parça Selçuklu Haritası (1277'ye kadar görünen)
    const selcukluSiniri = L.polygon([
        [36.0, 27.0], [41.5, 27.0], [41.5, 42.0], [37.0, 40.0], [36.0, 32.0]
    ], { color: '#C9A84C', weight: 2, fillOpacity: 0.15 })
    .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif;"><h4 style="margin:0 0 5px 0; color:#C9A84C;">Türkiye Selçuklu Devleti</h4><p style="margin:0; font-size:12px;">Siyasi birliğin henüz bozulmadığı dönem.</p></div>`);

    // İkinci Beylikler Poligonları (1278'den sonra belirecek olanlar)
    const beyliklerPoligonData = [
        { ad: "Karamanoğulları", renk: "#8B1A1A", sinir: [[36.5, 32.0], [38.5, 32.0], [38.0, 34.0], [36.5, 34.0]] },
        { ad: "Germiyanoğulları", renk: "#2980b9", sinir: [[38.5, 29.0], [39.5, 29.0], [39.5, 30.5], [38.5, 30.5]] },
        { ad: "Osmanoğulları", renk: "#27ae60", sinir: [[39.8, 29.5], [40.5, 29.5], [40.5, 30.5], [39.8, 30.5]] },
        { ad: "Karesioğulları", renk: "#8e44ad", sinir: [[39.0, 26.5], [40.0, 26.5], [40.3, 28.5], [39.0, 28.5]] },
        { ad: "Candaroğulları", renk: "#d35400", sinir: [[40.8, 33.0], [42.0, 33.0], [42.0, 35.5], [40.8, 35.5]] }
    ];

    let beylikLayerleri = [];
    beyliklerPoligonData.forEach(b => {
        let p = L.polygon(b.sinir, { color: b.renk, weight: 2, fillOpacity: 0.4 })
            .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif;"><h4 style="margin:0 0 5px 0; color:${b.renk};">${b.ad}</h4><p style="margin:0; font-size:12px;">Merkezi otoritenin çökmesiyle kurulan 2. Dönem Türk Beyliklerindendir.</p></div>`);
        beylikLayerleri.push(p);
    });

    let seferCizgileri = {};
    let olayMarkerlari = {}; 

    kosedagVerisi.forEach(sefer => {
        if (sefer.rota.length > 0) {
            seferCizgileri[sefer.id] = L.polyline([], {color: sefer.renk, weight: 6, opacity: 0.8, dashArray: '8, 8'}) 
                .bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                                <h4 style="margin:0 0 5px 0; color:${sefer.renk};">${sefer.isim}</h4>
                                <p style="margin:0; font-size:13px; line-height:1.4;">${sefer.bilgi}</p>
                            </div>`);
        }

        olayMarkerlari[sefer.id] = L.circleMarker(sefer.odak, {
            radius: 8, color: '#fff', fillColor: sefer.renk, weight: 2, fillOpacity: 1
        }).bindPopup(`<div style="color: ${highContrastColor}; font-family: 'Inter', sans-serif; max-width:220px;">
                        <h4 style="margin:0 0 5px 0; color:${sefer.renk};">${sefer.kisaAd}</h4>
                        <p style="margin:0; font-size:13px; line-height:1.4;">${sefer.bilgi}</p>
                      </div>`);
    });

    function haritayiYilaGoreGuncelle(guncelYil) {
        // 1. Siyasi Birlik Kontrolü (Parçalanma Animasyonu)
        if (guncelYil < 1278) {
            selcukluSiniri.addTo(window.currentMapInstance);
            beylikLayerleri.forEach(layer => window.currentMapInstance.removeLayer(layer));
        } else {
            window.currentMapInstance.removeLayer(selcukluSiniri);
            beylikLayerleri.forEach(layer => layer.addTo(window.currentMapInstance));
        }

        // 2. Rota ve Marker Kontrolü
        kosedagVerisi.forEach(sefer => {
            let gosterilecekRota = [];
            let markerAktif = false;

            if (guncelYil >= sefer.endYear) {
                gosterilecekRota = sefer.rota;
                markerAktif = true;
            } else if (guncelYil >= sefer.startYear) {
                let oran = (guncelYil - sefer.startYear) / (sefer.endYear - sefer.startYear);
                if (oran === 0) oran = 0.1;
                if (sefer.rota.length > 0) {
                    let hedefIndex = Math.floor(sefer.rota.length * oran);
                    gosterilecekRota = sefer.rota.slice(0, hedefIndex + 1);
                }
                markerAktif = true;
            }

            if (sefer.rota.length > 0) {
                if (gosterilecekRota.length > 0) {
                    seferCizgileri[sefer.id].addTo(window.currentMapInstance);
                    seferCizgileri[sefer.id].setLatLngs(gosterilecekRota);
                } else {
                    window.currentMapInstance.removeLayer(seferCizgileri[sefer.id]);
                }
            }

            if (markerAktif) {
                olayMarkerlari[sefer.id].addTo(window.currentMapInstance);
            } else {
                window.currentMapInstance.removeLayer(olayMarkerlari[sefer.id]);
            }
        });
    }

    // Slider Event Listener
    document.getElementById('yearSlider').addEventListener('input', function(e) {
        const secilenYil = parseInt(e.target.value);
        document.getElementById('yearDisplay').innerText = secilenYil;
        haritayiYilaGoreGuncelle(secilenYil);
    });

    // İMZA: Sol Alt Köşe
    const signature = L.control({position: 'bottomleft'});
    signature.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-signature');
        div.style.cssText = "background: rgba(13,17,23,0.9); color: #C9A84C; padding: 4px 8px; border: 1px solid #C9A84C; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-left: 5px;";
        div.innerHTML = 'Harita: Murat Mutlu';
        return div;
    };
    signature.addTo(window.currentMapInstance);

    // ETKİLEŞİMLİ LEJANT: Sağ Alt Köşe
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); color: ${highContrastColor};`;
        div.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; border-bottom:1px solid #ccc; padding-bottom:3px;">İstila ve Yıkım</h4>';
        
        kosedagVerisi.forEach(k => {
            const item = L.DomUtil.create('div', 'legend-item', div);
            item.style.cssText = "display:flex; align-items:center; margin-bottom:6px; font-size:11px; cursor:pointer; padding: 4px; border-radius:4px; transition: background 0.2s;";
            
            item.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
            item.onmouseout = function() { this.style.background = 'transparent'; };

            item.innerHTML = `<i style="background: ${k.renk}; width: 12px; height: 12px; border-radius:50%; display: inline-block; margin-right: 8px;"></i> <b>${k.kisaAd}</b>`;

            item.onclick = function() {
                window.currentMapInstance.flyTo(k.odak, 6, { duration: 1.5 });
                document.getElementById('yearSlider').value = k.endYear;
                document.getElementById('yearDisplay').innerText = k.endYear;
                haritayiYilaGoreGuncelle(k.endYear);
                setTimeout(() => { olayMarkerlari[k.id].openPopup(); }, 1200); 
            };
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);

    // Başlangıç Yılı Tetiklemesi
    haritayiYilaGoreGuncelle(1242); 
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 1. ARAÇ: İKTA SİSTEMİ ÇARKI (KILIÇ VE SABAN SİMÜLATÖRÜ)
window.HARITA_MOTORU["harita_u1_arac_ikta"] = function() {
    const mapCanvas = document.getElementById('mapCanvas');
    const controlsContainer = document.getElementById('mapControlsContainer');

    // Harita katmanını temizle (Bu bir araç olduğu için Leaflet objesini devredışı bırakıyoruz)
    if (window.currentMapInstance) {
        window.currentMapInstance.remove();
        window.currentMapInstance = null;
    }

    // Slider Alanını Başlık ve Bilgi Paneli Olarak Kullanıyoruz
    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0;">
            <h3 style="margin:0; color: #E8A020;">İkta Sistemi Simülatörü</h3>
            <p style="font-size: 0.85em; opacity: 0.8; margin:5px 0 0 0;">Devletin toprağını yönet, ordunu besle, üretimi aksatma!</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Simülatör Arayüzü (mapCanvas içine basılır)
    mapCanvas.innerHTML = `
        <div id="iktaSimulator" style="width:100%; height:100%; background:#f4e4b0; color:#2c3e50; font-family:'Inter', sans-serif; display:flex; flex-direction:column; padding:15px; box-sizing:border-box; overflow-y:auto;">
            
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:20px;">
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #8B1A1A; text-align:center;">
                    <i class="fa-solid fa-wheat-awn" style="color:#8B1A1A;"></i><br>
                    <small>Üretim</small><br><b id="resUretim">50</b>
                </div>
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #2980b9; text-align:center;">
                    <i class="fa-solid fa-shield-halved" style="color:#2980b9;"></i><br>
                    <small>Cebelü (Asker)</small><br><b id="resOrdu">0</b>
                </div>
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #27ae60; text-align:center;">
                    <i class="fa-solid fa-crown" style="color:#27ae60;"></i><br>
                    <small>İtibar (Kut)</small><br><b id="resKut">100</b>
                </div>
            </div>

            <div id="senaryoKutusu" style="flex-grow:1; background:rgba(255,255,255,0.7); border:1px dashed #2c3e50; border-radius:12px; padding:15px; margin-bottom:20px; text-align:center; display:flex; flex-direction:column; justify-content:center;">
                <p id="senaryoMetni" style="font-weight:600; font-size:1.1em;">Hasat zamanı geldi! Köylüden vergiler toplandı. Bu kaynağı nasıl dağıtacaksın?</p>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
                <button onclick="window.IKTA_MOTORU.kararVer('uretim')" style="padding:12px; border:none; border-radius:8px; background:#2c3e50; color:#fff; font-weight:bold; cursor:pointer;">
                    <i class="fa-solid fa-seedling"></i> Tohum Dağıt (Gelecek Yılı Garantiye Al)
                </button>
                <button onclick="window.IKTA_MOTORU.kararVer('ordu')" style="padding:12px; border:none; border-radius:8px; background:#8B1A1A; color:#fff; font-weight:bold; cursor:pointer;">
                    <i class="fa-solid fa-horse"></i> Cebelü Yetiştir (Orduya Asker Gönder)
                </button>
                <button onclick="window.IKTA_MOTORU.kararVer('kisisel')" style="padding:12px; border:none; border-radius:8px; background:#27ae60; color:#fff; font-weight:bold; cursor:pointer;">
                    <i class="fa-solid fa-tent"></i> Kılıç Hakkı Al (Kendi İhtiyaçlarını Karşıla)
                </button>
            </div>

            <div style="margin-top:15px; font-size:10px; font-weight:bold; color:rgba(0,0,0,0.5);">
                Harita/Araç: Murat Mutlu
            </div>
        </div>
    `;

    // Oyun Mantığı
    window.IKTA_MOTORU = {
        uretim: 50,
        ordu: 0,
        kut: 100,
        yil: 1,
        
        guncelle: function() {
            document.getElementById('resUretim').innerText = this.uretim;
            document.getElementById('resOrdu').innerText = this.ordu;
            document.getElementById('resKut').innerText = this.kut;
        },

        kararVer: function(tur) {
            let mesaj = "";
            if(tur === 'uretim') {
                this.uretim += 20;
                this.kut += 5;
                mesaj = "Tebrikler! Köylüye tohum desteği verdin. Üretimde süreklilik sağlandı.";
            } else if(tur === 'ordu') {
                this.ordu += 10;
                this.uretim -= 10;
                mesaj = "Savaşa hazır mısın? Atlı askerlerin (Cebelü) sayısı arttı, ancak üretim biraz düştü.";
            } else if(tur === 'kisisel') {
                this.kut -= 10;
                this.uretim -= 5;
                mesaj = "Kendi sarayını süsledin. Ancak halk ve devlet bu durumdan pek memnun değil!";
            }

            this.yil++;
            if(this.uretim < 10) {
                this.kut -= 30;
                mesaj = "KRİTİK: Toprağı boş bıraktın! Selçuklu kanunlarına göre toprak elinden alınabilir!";
            }

            if(this.kut <= 0) {
                document.getElementById('iktaSimulator').innerHTML = `
                    <div style="text-align:center; padding:40px;">
                        <i class="fa-solid fa-skull-crossbones" style="font-size:4em; color:#8B1A1A;"></i>
                        <h2>AZLEDİLDİN!</h2>
                        <p>İkta sistemini kötü yönettin. Devlet toprağı senden geri aldı.</p>
                        <button onclick="window.HARITA_MOTORU['harita_u1_arac_ikta']()" style="padding:10px 20px; border:none; background:#2c3e50; color:#fff; border-radius:5px;">Yeniden Başla</button>
                    </div>
                `;
                return;
            }

            document.getElementById('senaryoMetni').innerHTML = `<span style="color:#8B1A1A;">Yıl ${this.yil}:</span><br>${mesaj}`;
            this.guncelle();
        }
    };

    window.IKTA_MOTORU.guncelle();
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 3. ARAÇ: AHİ EVRAN'IN TEZGAHI (ETİK VE MESLEK SİMÜLATÖRÜ)
window.HARITA_MOTORU["harita_u1_arac_ahi"] = function() {
    const mapCanvas = document.getElementById('mapCanvas');
    const controlsContainer = document.getElementById('mapControlsContainer');

    // Harita katmanını temizle
    if (window.currentMapInstance) {
        window.currentMapInstance.remove();
        window.currentMapInstance = null;
    }

    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0;">
            <h3 style="margin:0; color: #E8A020;">Ahi Evran'ın Tezgahı</h3>
            <p style="font-size: 0.85em; opacity: 0.8; margin:5px 0 0 0;">Dürüstlük ve liyakatle yüksel, Ahi ahlakını kuşan!</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    mapCanvas.innerHTML = `
        <div id="ahiSimulator" style="width:100%; height:100%; background:#f1e7d0; color:#2c3e50; font-family:'Inter', sans-serif; display:flex; flex-direction:column; padding:15px; box-sizing:border-box; overflow-y:auto;">
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #8B1A1A; text-align:center;">
                    <small>Rütbe:</small><br><b id="ahiRutbe" style="color:#8B1A1A;">Yamak</b>
                </div>
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #27ae60; text-align:center;">
                    <small>Fütüvvet (Ahlak):</small><br><b id="ahiPuan">0</b>
                </div>
            </div>

            <div style="width:100%; height:10px; background:#ccc; border-radius:5px; margin-bottom:20px; overflow:hidden;">
                <div id="ahiProgress" style="width:0%; height:100%; background:#27ae60; transition: width 0.5s;"></div>
            </div>

            <div style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 10px rgba(0,0,0,0.1); text-align:center; flex-grow:1; display:flex; flex-direction:column; justify-content:center;">
                <div id="ahiIcon" style="font-size:3em; color:#C9A84C; margin-bottom:15px;"><i class="fa-solid fa-hammer"></i></div>
                <p id="ahiSenaryo" style="font-size:1.1em; font-weight:500; line-height:1.5;">Debbağ (Deri) atölyesinde ilk günün. Ustan sana işlenmiş derileri saymanı söyledi. Bazı derilerde ufak kusurlar fark ettin. Ne yaparsın?</p>
            </div>

            <div id="ahiButonlar" style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                </div>

            <div style="margin-top:15px; font-size:10px; font-weight:bold; color:rgba(0,0,0,0.5);">
                Harita/Araç: Murat Mutlu
            </div>
        </div>
    `;

    // Oyun Mantığı ve Senaryolar
    window.AHI_MOTORU = {
        puan: 0,
        index: 0,
        rutbeler: ["Yamak", "Çırak", "Kalfa", "Usta"],
        senaryolar: [
            {
                t: "Bazı derilerde ufak kusurlar fark ettin. Ne yaparsın?",
                o: [
                    { b: "Kusurları gizle, ustana 'hepsi sağlam' de.", p: -20, m: "Ahi yalan söylemez! Ustan kusuru fark etti, pabucun dama atılma riskiyle karşı karşıyasın." },
                    { b: "Hemen ustana durumu bildir ve dürüst ol.", p: 25, m: "Aferin evlat! Dürüstlük en büyük sermayedir. 'Çırak' rütbesine yükseldin." }
                ]
            },
            {
                t: "Komşu dükkanın sahibi Ahi Ahmet hastalandı, tezgahı boş kaldı. Ne yaparsın?",
                o: [
                    { b: "Kendi işime bakarım, müşteri bana gelir.", p: -10, m: "Ahilik bencillik değildir. Dayanışma ruhuna aykırı davrandın." },
                    { b: "Dükkanına yardım et, müşterilerini bekle.", p: 30, m: "İşte Ahi ruhu! 'Yol kardeşi'ne sahip çıktın. Fütüvvetin arttı." }
                ]
            },
            {
                t: "Bir müşteri gelip malın gerçek değerinden çok daha fazlasını teklif etti. Ne yaparsın?",
                o: [
                    { b: "Parayı kabul et, sonuçta kendi teklif etti.", p: -15, m: "Ahi haksız kazanç peşinde koşmaz. Narh fiyatından fazlasını almak ayıptır." },
                    { b: "Malın değerini söyle, fazlasını reddet.", p: 30, m: "Harikasın! Kalite ve adalet seninle. 'Kalfa' mertebesine ulaştın." }
                ]
            },
            {
                t: "Çırağın bir hata yaptı ve malı bozdu. Ne yaparsın?",
                o: [
                    { b: "Onu herkesin içinde ağırla fırçala.", p: -10, m: "Ahi merhametlidir. Eğitim sabır gerektirir." },
                    { b: "Hatasını öğret ve birlikte düzeltin.", p: 25, m: "Ustalık sadece zanaat değil, insan yetiştirmektir. Şed kuşanmaya çok yaklaştın!" }
                ]
            }
        ],

        baslat: function() {
            this.puan = 0;
            this.index = 0;
            this.guncelle();
        },

        guncelle: function() {
            if(this.index >= this.senaryolar.length) {
                this.bitir();
                return;
            }

            const s = this.senaryolar[this.index];
            document.getElementById('ahiSenaryo').innerText = s.t;
            document.getElementById('ahiPuan').innerText = this.puan;
            document.getElementById('ahiProgress').style.width = (this.puan > 0 ? this.puan : 0) + "%";
            
            // Rütbe hesaplama
            let rIndex = Math.floor(this.puan / 30);
            if(rIndex > 3) rIndex = 3;
            if(rIndex < 0) rIndex = 0;
            document.getElementById('ahiRutbe').innerText = this.rutbeler[rIndex];

            const btnKutusu = document.getElementById('ahiButonlar');
            btnKutusu.innerHTML = "";
            s.o.forEach(opt => {
                const b = document.createElement('button');
                b.style.cssText = "padding:12px; border:none; border-radius:8px; background:#2c3e50; color:#fff; font-weight:bold; cursor:pointer;";
                b.innerText = opt.b;
                b.onclick = () => this.kararVer(opt.p, opt.m);
                btnKutusu.appendChild(b);
            });
        },

        kararVer: function(puanEk, mesaj) {
            this.puan += puanEk;
            const sBox = document.getElementById('ahiSenaryo');
            sBox.innerHTML = `<span style="color:#8B1A1A; font-weight:700;">Sonuç:</span><br>${mesaj}`;
            document.getElementById('ahiButonlar').innerHTML = "";

            setTimeout(() => {
                this.index++;
                this.guncelle();
            }, 2500);
        },

        bitir: function() {
            let finalMesaj = this.puan >= 80 ? "Şed Kuşandın! Artık bir Ustasın." : "Eğitimin devam ediyor, biraz daha dürüstlük!";
            let finalIcon = this.puan >= 80 ? "fa-certificate" : "fa-rotate-right";
            
            document.getElementById('ahiSimulator').innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <i class="fa-solid ${finalIcon}" style="font-size:4em; color:#27ae60;"></i>
                    <h2>${finalMesaj}</h2>
                    <p>Fütüvvet Puanın: <b>${this.puan}</b></p>
                    <button onclick="window.HARITA_MOTORU['harita_u1_arac_ahi']()" style="padding:10px 20px; border:none; background:#2c3e50; color:#fff; border-radius:5px; cursor:pointer;">Tekrar Dene</button>
                </div>
            `;
        }
    };

    window.AHI_MOTORU.baslat();
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 2. ARAÇ: DİVAN-I SALTANAT (GÜNCELLENMİŞ - 10 GÖREV)
window.HARITA_MOTORU["harita_u1_arac_divan"] = function() {
    const mapCanvas = document.getElementById('mapCanvas');
    const controlsContainer = document.getElementById('mapControlsContainer');

    if (window.currentMapInstance) {
        window.currentMapInstance.remove();
        window.currentMapInstance = null;
    }

    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0;">
            <h3 style="margin:0; color: #E8A020;">Divan-ı Saltanat: Karar Odası</h3>
            <p style="font-size: 0.85em; opacity: 0.8; margin:5px 0 0 0;">Devlet meselelerini doğru Divan dairesine yönlendir!</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    mapCanvas.innerHTML = `
        <div id="divanSimulator" style="width:100%; height:100%; background:#e0d4b0; color:#2c3e50; font-family:'Inter', sans-serif; display:flex; flex-direction:column; padding:15px; box-sizing:border-box; overflow-y:auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(255,255,255,0.5); padding:10px; border-radius:10px;">
                <span>Puan: <b id="divanPuan">0</b></span>
                <span>Görev: <b id="divanGorevNo">1</b>/10</span>
            </div>

            <div style="background:#fff; border-left:5px solid #8B1A1A; padding:15px; border-radius:8px; margin-bottom:20px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <small style="color:#8B1A1A; font-weight:bold; text-transform:uppercase;">Devlet Meselesi:</small>
                <p id="gorevMetni" style="margin:10px 0 0 0; font-size:1.1em; font-weight:500; line-height:1.4;">Yükleniyor...</p>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button onclick="window.DIVAN_MOTORU.cevapla('istifa')" style="padding:15px 10px; border:none; border-radius:8px; background:#2c3e50; color:#fff; cursor:pointer; font-size:0.9em;">
                    <b>Divan-ı İstifa</b><br><small>(Mali İşler)</small>
                </button>
                <button onclick="window.DIVAN_MOTORU.cevapla('arz')" style="padding:15px 10px; border:none; border-radius:8px; background:#8B1A1A; color:#fff; cursor:pointer; font-size:0.9em;">
                    <b>Divan-ı Arz</b><br><small>(Askeri İşler)</small>
                </button>
                <button onclick="window.DIVAN_MOTORU.cevapla('pervane')" style="padding:15px 10px; border:none; border-radius:8px; background:#C9A84C; color:#fff; cursor:pointer; font-size:0.9em;">
                    <b>Divan-ı Pervane</b><br><small>(Arazi Kayıtları)</small>
                </button>
                <button onclick="window.DIVAN_MOTORU.cevapla('insa')" style="padding:15px 10px; border:none; border-radius:8px; background:#27ae60; color:#fff; cursor:pointer; font-size:0.9em;">
                    <b>Divan-ı İnşa/Tuğra</b><br><small>(Yazışma/Mühür)</small>
                </button>
            </div>

            <div id="divanGeriBildirim" style="margin-top:20px; text-align:center; min-height:40px; font-weight:bold;"></div>

            <div style="margin-top:auto; font-size:10px; font-weight:bold; color:rgba(0,0,0,0.5); padding-top:10px;">
                Harita/Araç: Murat Mutlu
            </div>
        </div>
    `;

    window.DIVAN_MOTORU = {
        puan: 0,
        gorevIndex: 0,
        havuz: [
            { t: "Devlet hazinesinin yıllık altın rezervleri ve harcamaları Müstevfi tarafından denetlenecek.", c: "istifa" },
            { t: "Ordunun asker sayımı yapılacak ve biştegânî (maaş) defterleri güncellenecek.", c: "arz" },
            { t: "Yeni fethedilen topraklar has ve ikta olarak paylaştırılıp deftere tescil edilecek.", c: "pervane" },
            { t: "Halife'den gelen tebrik mektubuna resmi diplomatik dil ile Sultan adına cevap yazılacak.", c: "insa" },
            { t: "Önemli bir kervansarayın tadilatı için hazineden gerekli ödenek çıkarılacak.", c: "istifa" },
            { t: "Sultanın sefere çıkacağı ordunun lojistik hazırlıkları ve piyade kayıtları kontrol edilecek.", c: "arz" },
            { t: "Emekli olan bir emire hizmetleri karşılığında verilecek has topraklarının yerleri belirlenecek.", c: "pervane" },
            { t: "Vilayetlere gönderilecek olan yeni kanunnamelerin çoğaltılması ve Sultanın mühürünün basılması gerekiyor.", c: "insa" },
            { t: "Vergilerin toplanma sürecindeki mali aksaklıklar giderilmeli ve kayıtlar şeffaflaştırılmalı.", c: "istifa" },
            { t: "Donanma hazırlıkları için gerekli olan denizci (levent) sayımı ve bütçesi onaylanmalı.", c: "arz" }
        ],

        baslat: function() {
            this.havuz = this.havuz.sort(() => Math.random() - 0.5);
            this.gorevIndex = 0;
            this.puan = 0;
            this.gorevYaz();
        },

        gorevYaz: function() {
            if(this.gorevIndex >= 10) { 
                this.bitir();
                return;
            }
            document.getElementById('gorevMetni').innerText = this.havuz[this.gorevIndex].t;
            document.getElementById('divanGorevNo').innerText = this.gorevIndex + 1;
            document.getElementById('divanPuan').innerText = this.puan;
        },

        cevapla: function(secim) {
            const dogruCevap = this.havuz[this.gorevIndex].c;
            const gb = document.getElementById('divanGeriBildirim');

            if(secim === dogruCevap) {
                this.puan += 10;
                gb.style.color = "#27ae60";
                gb.innerHTML = "<i class='fa-solid fa-check'></i> Doğru Karar! Devlet çarkları dönüyor.";
            } else {
                gb.style.color = "#8B1A1A";
                gb.innerHTML = "<i class='fa-solid fa-xmark'></i> Hatalı Atama! Bürokrasi tıkandı.";
            }

            this.gorevIndex++;
            setTimeout(() => {
                gb.innerHTML = "";
                this.gorevYaz();
            }, 1200);
        },

        bitir: function() {
            document.getElementById('divanSimulator').innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <i class="fa-solid fa-scroll" style="font-size:4em; color:#C9A84C;"></i>
                    <h2>Divan Toplantısı Sona Erdi</h2>
                    <p>Liyakat ve Bürokrasi Puanın: <b style="font-size:1.5em; color:#27ae60;">${this.puan}/100</b></p>
                    <button onclick="window.HARITA_MOTORU['harita_u1_arac_divan']()" style="padding:12px 25px; border:none; background:#2c3e50; color:#fff; border-radius:8px; font-weight:bold; cursor:pointer;">Yeni Oturuma Başla</button>
                </div>
            `;
        }
    };

    window.DIVAN_MOTORU.baslat();
};
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 4. ARAÇ: KÜLLİYE MİMARI (VAKIF SİSTEMİ SİMÜLATÖRÜ)
window.HARITA_MOTORU["harita_u1_arac_kulliye"] = function() {
    const mapCanvas = document.getElementById('mapCanvas');
    const controlsContainer = document.getElementById('mapControlsContainer');

    // Harita katmanını temizle
    if (window.currentMapInstance) {
        window.currentMapInstance.remove();
        window.currentMapInstance = null;
    }

    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0;">
            <h3 style="margin:0; color: #E8A020;">Külliye Mimarı: Vakıf Sistemi</h3>
            <p style="font-size: 0.85em; opacity: 0.8; margin:5px 0 0 0;">Gelir kaynaklarını (Akar) yarat, halka ücretsiz hizmet sun!</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    mapCanvas.innerHTML = `
        <div id="kulliyeSimulator" style="width:100%; height:100%; background:#e9e4d4; color:#2c3e50; font-family:'Inter', sans-serif; display:flex; flex-direction:column; padding:15px; box-sizing:border-box; overflow-y:auto;">
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #8B1A1A; text-align:center;">
                    <i class="fa-solid fa-coins" style="color:#8B1A1A;"></i><br>
                    <small>Vakıf Geliri (Akar):</small><br><b id="resAkar">100</b> Akçe
                </div>
                <div style="background:#fff; padding:10px; border-radius:8px; border:2px solid #27ae60; text-align:center;">
                    <i class="fa-solid fa-heart-pulse" style="color:#27ae60;"></i><br>
                    <small>Sosyal Hizmet Puanı:</small><br><b id="resHizmet">0</b>
                </div>
            </div>

            <div id="kulliyeAlan" style="flex-grow:1; background:rgba(255,255,255,0.4); border:2px dashed #a0937d; border-radius:15px; position:relative; margin-bottom:15px; display:flex; flex-wrap:wrap; align-content:center; justify-content:center; gap:10px; padding:10px;">
                <div title="Külliyenin Merkezi" style="width:70px; height:70px; background:#2c3e50; color:#fff; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:0.7em;">
                    <i class="fa-solid fa-mosque" style="font-size:1.5em;"></i><br><b>CAMİ</b>
                </div>
                </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <button onclick="window.KULLIYE_MOTORU.insaEt('bedesten')" style="padding:10px; border:none; border-radius:8px; background:#8B1A1A; color:#fff; cursor:pointer; font-size:0.85em;">
                    <i class="fa-solid fa-shop"></i> Bedesten Kur<br><small>(Gelir Arttırır)</small>
                </button>
                <button onclick="window.KULLIYE_MOTORU.insaEt('medrese')" style="padding:10px; border:none; border-radius:8px; background:#2980b9; color:#fff; cursor:pointer; font-size:0.85em;">
                    <i class="fa-solid fa-book-open"></i> Medrese Aç<br><small>(Hizmet Arttırır)</small>
                </button>
                <button onclick="window.KULLIYE_MOTORU.insaEt('darussifa')" style="padding:10px; border:none; border-radius:8px; background:#27ae60; color:#fff; cursor:pointer; font-size:0.85em;">
                    <i class="fa-solid fa-hospital"></i> Darüşşifa Kur<br><small>(Hizmet Arttırır)</small>
                </button>
                <button onclick="window.KULLIYE_MOTORU.insaEt('imarethane')" style="padding:10px; border:none; border-radius:8px; background:#d35400; color:#fff; cursor:pointer; font-size:0.85em;">
                    <i class="fa-solid fa-bowl-food"></i> İmarethane Aç<br><small>(Hizmet Arttırır)</small>
                </button>
            </div>

            <div id="kulliyeMesaj" style="margin-top:10px; text-align:center; font-size:0.9em; font-weight:bold; color:#8B1A1A; height:20px;"></div>

            <div style="margin-top:10px; font-size:10px; font-weight:bold; color:rgba(0,0,0,0.5);">
                Harita/Araç: Murat Mutlu
            </div>
        </div>
    `;

    // Simülatör Mantığı
    window.KULLIYE_MOTORU = {
        akar: 100,
        hizmet: 0,
        birimler: {
            bedesten: { isim: "Bedesten", icon: "fa-shop", maliyet: 50, gelir: 30, hizmet: 0, renk: "#8B1A1A" },
            medrese: { isim: "Medrese", icon: "fa-book-open", maliyet: 80, gelir: -20, hizmet: 40, renk: "#2980b9" },
            darussifa: { isim: "Darüşşifa", icon: "fa-hospital", maliyet: 100, gelir: -30, hizmet: 50, renk: "#27ae60" },
            imarethane: { isim: "İmarethane", icon: "fa-bowl-food", maliyet: 60, gelir: -15, hizmet: 30, renk: "#d35400" }
        },

        insaEt: function(tip) {
            const birim = this.birimler[tip];
            const msg = document.getElementById('kulliyeMesaj');

            if (this.akar >= birim.maliyet) {
                this.akar -= birim.maliyet;
                this.hizmet += birim.hizmet;
                // Akar sistemini güncelle (Gelir/Gider dengesi)
                // Her yeni bina yapıldığında akar akışı değişecek (Gelecek turlar için)
                
                this.gorselEkle(birim);
                msg.style.color = "#27ae60";
                msg.innerText = birim.isim + " inşa edildi!";
                
                // Zamanla gelir akışı simülasyonu
                this.akar += birim.gelir; 
                this.guncelle();
            } else {
                msg.style.color = "#8B1A1A";
                msg.innerText = "Yetersiz Vakıf Geliri (Akar)!";
            }
            
            if(this.hizmet >= 150) {
                this.bitir();
            }
        },

        gorselEkle: function(birim) {
            const alan = document.getElementById('kulliyeAlan');
            const div = document.createElement('div');
            div.style.cssText = `width:60px; height:60px; background:${birim.renk}; color:#fff; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:0.6em; animation: popIn 0.3s ease;`;
            div.innerHTML = `<i class="fa-solid ${birim.icon}" style="font-size:1.4em;"></i><br><b>${birim.isim}</b>`;
            alan.appendChild(div);
        },

        guncelle: function() {
            document.getElementById('resAkar').innerText = this.akar;
            document.getElementById('resHizmet').innerText = this.hizmet;
        },

        bitir: function() {
            document.getElementById('kulliyeSimulator').innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <i class="fa-solid fa-city" style="font-size:4em; color:#27ae60;"></i>
                    <h2>Muazzam Bir Külliye!</h2>
                    <p>Sosyal Devlet anlayışını en üst seviyeye çıkardın. Halkın duası seninle.</p>
                    <p>Toplam Hizmet Puanı: <b>${this.hizmet}</b></p>
                    <button onclick="window.HARITA_MOTORU['harita_u1_arac_kulliye']()" style="padding:12px 25px; border:none; background:#2c3e50; color:#fff; border-radius:8px; cursor:pointer;">Yeni Şehir İnşa Et</button>
                </div>
            `;
        }
    };

    window.KULLIYE_MOTORU.guncelle();
};

// Basit animasyon için style ekleme
const style = document.createElement('style');
style.innerHTML = `@keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }`;
document.head.appendChild(style);
window.HARITA_MOTORU = window.HARITA_MOTORU || {};

// 5. ARAÇ: HAÇLI SEFERLERİ MOTİVASYON RADARI (SONUÇ ÜSTTE VERSİYONU)
window.HARITA_MOTORU["harita_u1_arac_hacli_radar"] = function() {
    const mapCanvas = document.getElementById('mapCanvas');
    const controlsContainer = document.getElementById('mapControlsContainer');

    if (window.currentMapInstance) {
        window.currentMapInstance.remove();
        window.currentMapInstance = null;
    }

    controlsContainer.innerHTML = `
        <div style="text-align: center; color: #F4E4B0;">
            <h3 style="margin:0; color: #E8A020;">Motivasyon Radarı: Haçlı Seferleri</h3>
            <p style="font-size: 0.85em; opacity: 0.8; margin:5px 0 0 0;">Tarihsel iddiaların ardındaki gerçek nedenleri analiz et!</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    mapCanvas.innerHTML = `
        <div id="radarSimulator" style="width:100%; height:100%; background:#f2f2f2; color:#2c3e50; font-family:'Inter', sans-serif; display:flex; flex-direction:column; padding:15px; box-sizing:border-box; overflow-y:auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#fff; padding:10px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <span>Doğru Analiz: <b id="radarSkor" style="color:#27ae60;">0</b></span>
                <span>Kaynak: <b id="radarSira">1</b>/10</span>
            </div>

            <div id="radarGeriBildirim" style="text-align:center; font-weight:bold; min-height:35px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; border-radius:8px;"></div>

            <div style="background:#fff; border-top:4px solid #E8A020; padding:20px; border-radius:8px; margin-bottom:15px; box-shadow:0 4px 10px rgba(0,0,0,0.1); position:relative; min-height:100px; display:flex; align-items:center; justify-content:center;">
                <i class="fa-solid fa-quote-left" style="position:absolute; top:10px; left:10px; color:#ddd; font-size:1.5em;"></i>
                <p id="radarMetni" style="font-style:italic; font-weight:500; text-align:center; line-height:1.5; margin:0;">Yükleniyor...</p>
                <i class="fa-solid fa-quote-right" style="position:absolute; bottom:10px; right:10px; color:#ddd; font-size:1.5em;"></i>
            </div>

            <p style="text-align:center; font-size:0.85em; font-weight:bold; margin-bottom:10px; color:#8B1A1A; text-transform:uppercase;">Temel Motivasyonu Seçin:</p>

            <div style="display:grid; grid-template-columns: 1fr; gap:10px;">
                <button onclick="window.RADAR_MOTORU.analizEt('dini')" style="padding:15px; border:none; border-radius:8px; background:#2980b9; color:#fff; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition: transform 0.1s;">
                    <i class="fa-solid fa-cross"></i> DİNİ NEDENLER
                </button>
                <button onclick="window.RADAR_MOTORU.analizEt('ekonomik')" style="padding:15px; border:none; border-radius:8px; background:#27ae60; color:#fff; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition: transform 0.1s;">
                    <i class="fa-solid fa-coins"></i> EKONOMİK NEDENLER
                </button>
                <button onclick="window.RADAR_MOTORU.analizEt('siyasi')" style="padding:15px; border:none; border-radius:8px; background:#8B1A1A; color:#fff; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition: transform 0.1s;">
                    <i class="fa-solid fa-crown"></i> SİYASİ / SOSYAL NEDENLER
                </button>
            </div>

            <div style="margin-top:auto; font-size:10px; font-weight:bold; color:rgba(0,0,0,0.5); padding-top:10px;">
                Harita/Araç: Murat Mutlu
            </div>
        </div>
    `;

    window.RADAR_MOTORU = {
        skor: 0,
        sira: 0,
        havuz: [
            { t: "Papa II. Urbanus'un çağrısı: 'Kutsal şehir Kudüs'ü dinsizlerin elinden kurtarmalıyız!'", c: "dini" },
            { t: "Avrupalı soyluların düşüncesi: 'Doğu'da yeni topraklar fethedip kendi krallıklarımızı kurabiliriz.'", c: "siyasi" },
            { t: "Fakir halkın hayali: 'Doğu'nun zenginliklerine (ipek, baharat) ulaşıp açlıktan kurtulacağız.'", c: "ekonomik" },
            { t: "Venedikli tüccarların planı: 'Doğu Akdeniz limanlarını ele geçirip ticareti tekeline almalıyız.'", c: "ekonomik" },
            { t: "Kluni tarikatının propagandası: 'Hristiyanlık dünyasını tek bir bayrak altında birleştirmeliyiz.'", c: "dini" },
            { t: "Derebeylerin (Feodal beyler) arzusu: 'Macera arayan şövalyelere Doğu'da yeni mülkler bulmalıyız.'", c: "siyasi" },
            { t: "Bizans İmparatoru'nun yardım isteği: 'Türk akınlarını durdurmak için Avrupa'dan destek almalıyım.'", c: "siyasi" },
            { t: "Hristiyan hacıların iddiası: 'Kutsal mekanlara giden yolların güvenliğini sağlamalıyız.'", c: "dini" },
            { t: "İpek ve Baharat Yolu'nun kontrolünün tamamen Müslümanların eline geçmesi.", c: "ekonomik" },
            { t: "Avrupa'da topraksız kalan senyörlerin yeni bir statü ve güç arayışı.", c: "siyasi" }
        ],

        baslat: function() {
            this.havuz = this.havuz.sort(() => Math.random() - 0.5);
            this.sira = 0;
            this.skor = 0;
            this.goster();
        },

        goster: function() {
            if(this.sira >= 10) {
                this.bitir();
                return;
            }
            document.getElementById('radarMetni').innerText = this.havuz[this.sira].t;
            document.getElementById('radarSira').innerText = this.sira + 1;
            document.getElementById('radarSkor').innerText = this.skor;
            document.getElementById('radarGeriBildirim').innerHTML = "";
            document.getElementById('radarGeriBildirim').style.background = "transparent";
        },

        analizEt: function(secim) {
            const dogru = this.havuz[this.sira].c;
            const gb = document.getElementById('radarGeriBildirim');

            if(secim === dogru) {
                this.skor += 10;
                gb.style.color = "#fff";
                gb.style.background = "#27ae60";
                gb.innerHTML = "<i class='fa-solid fa-circle-check'></i> DOĞRU ANALİZ!";
            } else {
                gb.style.color = "#fff";
                gb.style.background = "#8B1A1A";
                gb.innerHTML = "<i class='fa-solid fa-circle-xmark'></i> YANILTMACA!";
            }

            this.sira++;
            setTimeout(() => {
                this.goster();
            }, 1500);
        },

        bitir: function() {
            let seviye = this.skor >= 80 ? "Usta Tarihçi" : "Tarih Dedektifi";
            document.getElementById('radarSimulator').innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <i class="fa-solid fa-radar" style="font-size:4em; color:#8B1A1A;"></i>
                    <h2>Analiz Raporu Tamam</h2>
                    <p>Dedektiflik Seviyen: <b>${seviye}</b></p>
                    <p>Doğruluk Puanın: <b style="font-size:1.5em; color:#27ae60;">${this.skor}/100</b></p>
                    <button onclick="window.HARITA_MOTORU['harita_u1_arac_hacli_radar']()" style="padding:12px 25px; border:none; background:#2c3e50; color:#fff; border-radius:8px; font-weight:bold; cursor:pointer;">Yeniden Analiz Et</button>
                </div>
            `;
        }
    };

    window.RADAR_MOTORU.baslat();
};