// Tüm harita çizim fonksiyonlarımızı tutan ana obje
window.HARITA_MOTORU = {
    
    // 1. HARİTA: KAVİMLER GÖÇÜ
    "kavimler_gocu": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center;">
                <label for="yearSlider" style="font-size: 1.1em; color: var(--text-color);">
                    <b>Yıl: <span id="yearDisplay" style="color: #2ecc71;">370</span></b>
                </label><br>
                <input type="range" id="yearSlider" min="370" max="600" value="370" step="1" style="width: 90%; cursor: pointer; accent-color: #2ecc71;">
                <p style="font-size: 0.85em; opacity: 0.7; margin-top: 5px;">Zamanı ilerletmek için kaydırıcıyı sağa doğru çekin.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        // Harita instance'ını global değişkene ata
        window.currentMapInstance = L.map('mapCanvas').setView([47.0, 15.0], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 10,
            attribution: '© OpenStreetMap'
        }).addTo(window.currentMapInstance);

        const kavimlerVerisi = [
            { isim: "Hunlar", renk: "red", startYear: 375, endYear: 453, bilgi: "Avrupa'ya ilerleyerek büyük göçü başlattılar.", rota: [[48.0, 60.0], [48.5, 53.0], [49.0, 48.0], [48.0, 43.0], [47.5, 38.0], [46.0, 32.0], [47.0, 25.0], [47.0, 19.0]] },
            { isim: "Vizigotlar", renk: "blue", startYear: 376, endYear: 418, bilgi: "Balkanlardan İtalya'ya geçip Roma'yı yağmaladıktan sonra İspanya'ya ulaştılar.", rota: [[45.0, 28.0], [43.0, 27.0], [41.0, 28.0], [39.0, 22.0], [41.0, 20.0], [43.0, 15.0], [45.0, 12.0], [41.9, 12.5], [44.0, 8.0], [43.0, 4.0], [41.0, -2.0], [39.0, -4.0]] },
            { isim: "Vandallar", renk: "orange", startYear: 406, endYear: 439, bilgi: "Kuzey Afrika'ya geçip Kartaca merkezli devlet kurdular.", rota: [[52.0, 15.0], [50.0, 10.0], [48.0, 5.0], [45.0, 2.0], [42.0, 0.0], [40.0, -4.0], [36.0, -5.0], [36.8, 10.1]] },
            { isim: "Ostrogotlar", renk: "purple", startYear: 453, endYear: 493, bilgi: "İtalya'ya yönelerek Batı Roma'nın kalbinde krallık kurdular.", rota: [[47.0, 30.0], [46.0, 25.0], [44.0, 22.0], [45.0, 15.0], [44.0, 11.0], [41.9, 12.5]] },
            { isim: "Franklar", renk: "green", startYear: 420, endYear: 509, bilgi: "Bugünkü Fransa topraklarına yerleşip güçlü bir krallık kurdular.", rota: [[51.0, 7.0], [50.0, 5.0], [48.8, 2.3], [46.0, 1.0]] }
        ];

        let kavimCizgileri = {};
        kavimlerVerisi.forEach(kavim => {
            kavimCizgileri[kavim.isim] = L.polyline([], {color: kavim.renk, weight: 4})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${kavim.isim}</b><br>${kavim.bilgi}`);
        });

        function haritayiYilaGoreGuncelle(guncelYil) {
            kavimlerVerisi.forEach(kavim => {
                let gosterilecekRota = [];
                if (guncelYil >= kavim.endYear) {
                    gosterilecekRota = kavim.rota;
                } else if (guncelYil > kavim.startYear) {
                    let oran = (guncelYil - kavim.startYear) / (kavim.endYear - kavim.startYear);
                    let hedefIndex = Math.floor(kavim.rota.length * oran);
                    if (hedefIndex === 0 && oran > 0) hedefIndex = 1; 
                    gosterilecekRota = kavim.rota.slice(0, hedefIndex + 1);
                }
                kavimCizgileri[kavim.isim].setLatLngs(gosterilecekRota);
            });
        }

        document.getElementById('yearSlider').addEventListener('input', function(e) {
            const secilenYil = parseInt(e.target.value);
            document.getElementById('yearDisplay').innerText = secilenYil;
            haritayiYilaGoreGuncelle(secilenYil);
        });

        haritayiYilaGoreGuncelle(370); 
        
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Kavimler</h4>';
            kavimlerVerisi.forEach(k => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${k.renk}; width: 15px; height: 3px; display: inline-block; margin-right: 5px;"></i> ${k.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },

    // 2. HARİTA: TİCARET YOLLARI
    "ticaret_yollari": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">Tarihi değiştiren büyük ticaret ağları. Detaylar için rotaların üzerine tıklayın.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        window.currentMapInstance = L.map('mapCanvas').setView([35.0, 50.0], 3);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 10,
            attribution: '© OpenStreetMap'
        }).addTo(window.currentMapInstance);

        const yollar = [
            { isim: "İpek Yolu", renk: "#e74c3c", bilgi: "Çin'den başlayarak Orta Asya üzerinden Avrupa'ya uzanan, ipek, porselen ve kağıt taşınan devasa ticaret ağı.", rota: [[34.2, 108.9], [40.1, 94.6], [39.4, 75.9], [39.6, 66.9], [37.6, 61.8], [35.5, 51.4], [33.3, 44.4], [36.2, 36.1], [41.0, 28.9]] },
            { isim: "Baharat Yolu", renk: "#f39c12", bilgi: "Hindistan'dan başlayıp deniz yoluyla Kızıldeniz'e, oradan İskenderiye üzerinden Avrupa'ya uzanan baharat hattı.", rota: [[11.2, 75.7], [15.0, 65.0], [12.7, 45.0], [20.0, 38.0], [31.2, 29.9], [35.0, 20.0], [45.4, 12.3]] },
            { isim: "Kral Yolu", renk: "#9b59b6", bilgi: "Sardes'ten (Manisa) başlayıp Pers başkenti Susa'ya uzanan, tarihin ilk büyük sistemli posta ve ticaret yolu.", rota: [[38.4, 28.0], [38.6, 31.9], [40.0, 34.6], [38.3, 38.3], [36.3, 43.1], [32.1, 48.2]] },
            { isim: "Kürk Yolu", renk: "#3498db", bilgi: "Sibirya ve Ural dağlarından başlayarak güneye, Hazar ve Karadeniz'e inen kuzey ticaret hattı.", rota: [[60.0, 70.0], [55.0, 60.0], [51.0, 51.0], [46.3, 48.0], [47.0, 39.0], [45.3, 34.4]] }
        ];

        yollar.forEach(yol => {
            L.polyline(yol.rota, {color: yol.renk, weight: 5, opacity: 0.8})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${yol.isim}</b><br>${yol.bilgi}`);
        });

        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Ticaret Yolları</h4>';
            yollar.forEach(y => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${y.renk}; width: 15px; height: 3px; display: inline-block; margin-right: 5px;"></i> ${y.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    }
    
    // YENİ HARİTALARI BURANIN ALTINA, VİRGÜL KOYARAK EKLEMEYE DEVAM EDECEĞİZ.
};