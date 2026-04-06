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

// Türkçe dil destekli ve Tarihi/Fiziki (Terrain) görünümlü harita altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
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

// Türkçe dil destekli ve Tarihi/Fiziki (Terrain) görünümlü harita altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
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
    },
	// 3. HARİTA: MEZOPOTAMYA UYGARLIKLARI
    "mezopotamya_uygarliklari": function() {
        // Kontrol paneli içeriğini ayarla
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">Kadim Mezopotamya topraklarında kurulan uygarlıkları keşfedin. Detaylar için bölgelerin üzerine tıklayın.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        // Haritayı Mezopotamya üzerine odaklayarak başlat
        window.currentMapInstance = L.map('mapCanvas').setView([33.5, 43.5], 6);

        // Tarihi parşömen dokusunu yansıtan bir Leaflet-TileLayer ekle (Opsiyonel)
        // L.tileLayer('url_to_textured_tile_layer').addTo(window.currentMapInstance);
        // Varsayılan tile layer'ı kullan:
// Türkçe dil destekli ve Tarihi/Fiziki (Terrain) görünümlü harita altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        // Uygarlık verileri: Poligonlar ve Bilgiler
        const uygarliklar = [
            {
                isim: "Sümerler",
                renk: "#1e90ff", // Mavi (image_0.png'deki gibi)
                koordinatlar: [
                    [32.5, 43.0], [31.5, 43.5], [30.5, 44.5], [31.0, 45.5], [32.0, 45.0], [32.5, 44.0]
                ], // Yaklaşık poligon koordinatları
                bilgi: "<b>Sümerler (MÖ 4000-2000)</b><br>Mezopotamya medeniyetinin temelini attılar. Yazıyı (çivi yazısı) buldular, tekerleği icat ettiler, site devletleri (Ur, Uruk, Nippur) kurdular ve ziggurat denilen tapınaklar inşa ettiler."
            },
            {
                isim: "Akkadlar",
                renk: "#cd5c5c", // Kızıl (image_0.png'deki gibi)
                koordinatlar: [
                    [33.5, 42.5], [32.5, 43.0], [32.5, 44.0], [33.5, 43.5], [34.0, 43.0]
                ],
                bilgi: "<b>Akkadlar (MÖ 2350-2150)</b><br>Kral Sargon önderliğinde Mezopotamya'da ilk merkezi imparatorluğu kurdular. Sümer kültürünü benimsediler ve yaydılar."
            },
            {
                isim: "Babiller",
                renk: "#ffd700", // Sarı (image_0.png'deki gibi)
                koordinatlar: [
                    [33.0, 43.0], [32.0, 43.5], [31.5, 44.0], [31.5, 44.5], [32.5, 45.0], [33.0, 44.5], [33.5, 44.0]
                ],
                bilgi: "<b>Babiller (MÖ 1894-1595, MÖ 626-539)</b><br>Hammurabi Kanunları ile ünlüdürler. Babil'in Asma Bahçeleri ve Babil Kulesi bu dönemin önemli eserlerindendir."
            },
            {
                isim: "Asurlar",
                renk: "#9370db", // Mor (image_0.png'deki gibi)
                koordinatlar: [
                    [36.5, 41.0], [35.5, 42.0], [35.5, 43.5], [36.5, 43.0], [37.0, 42.0], [37.0, 41.5]
                ],
                bilgi: "<b>Asurlar (MÖ 2500-609)</b><br>Kuzey Mezopotamya'da kuruldular. Güçlü bir orduya ve merkezi bir yönetime sahiptiler. Başkentleri Ninova'da dünyanın ilk kütüphanesini kurdular."
            }
        ];

        // Uygarlık bölgelerini poligon olarak haritaya ekle
        uygarliklar.forEach(uygarlik => {
            L.polygon(uygarlik.koordinatlar, {
                color: uygarlik.renk,
                fillColor: uygarlik.renk,
                fillOpacity: 0.5,
                weight: 2
            })
            .addTo(window.currentMapInstance)
            .bindPopup(uygarlik.bilgi);
        });

        // Lejant Ekleme (image_0.png'deki gibi)
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Mezopotamya Uygarlıkları</h4>';
            uygarliklar.forEach(u => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${u.renk}; width: 15px; height: 10px; display: inline-block; margin-right: 5px; opacity: 0.7;"></i> ${u.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },
    // 4. HARİTA: İLK ÇAĞ UYGARLIKLARI (DÜNYA)
    "ilk_cag": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">İlk Çağ'da Asya, Avrupa, Afrika ve Amerika'da kurulan büyük medeniyetler.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        // Dünyayı görecek şekilde geniş bir açı ile başlat
        window.currentMapInstance = L.map('mapCanvas').setView([30.0, 30.0], 2);

        // Türkçe ve Fiziki Google Haritalar Altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        const uygarliklar = [
            {
                isim: "Hititler (Anadolu)", renk: "#e74c3c",
                koordinatlar: [[41.0, 32.0], [38.0, 32.0], [38.0, 36.0], [40.0, 38.0], [41.0, 36.0]],
                bilgi: "<b>Hititler</b><br>Anadolu'nun ilk merkezi krallığı. Başkentleri Hattuşaş'tır. Pankuş meclisi ve Anal adı verilen yıllıklarla tarihe geçmişlerdir."
            },
            {
                isim: "Mısır Uygarlığı", renk: "#f1c40f",
                koordinatlar: [[31.0, 30.0], [24.0, 33.0], [22.0, 31.0], [30.0, 28.0]],
                bilgi: "<b>Mısır Uygarlığı</b><br>Nil Nehri etrafında gelişmiştir. Etrafı çöllerle kaplı olduğu için özgün bir kültürü vardır. Piramitler, hiyeroglif yazısı ve güneş takvimi ile öne çıkarlar."
            },
            {
                isim: "Hint Uygarlığı", renk: "#2ecc71",
                koordinatlar: [[25.0, 67.0], [20.0, 72.0], [25.0, 77.0], [30.0, 75.0]],
                bilgi: "<b>Hint Uygarlığı</b><br>İndus ve Ganj nehirleri boylarında kurulmuştur. Kast sistemi adı verilen katı bir sosyal sınıflandırma uygulamışlardır."
            },
            {
                isim: "Çin Uygarlığı", renk: "#e67e22",
                koordinatlar: [[35.0, 105.0], [30.0, 110.0], [35.0, 120.0], [40.0, 115.0]],
                bilgi: "<b>Çin Uygarlığı</b><br>Sarı Irmak ve Gökırmak etrafında şekillenmiştir. Kağıt, matbaa, barut ve pusula gibi dünyayı değiştiren icatları yapmışlardır."
            },
            {
                isim: "Yunan Uygarlığı", renk: "#3498db",
                koordinatlar: [[39.0, 20.0], [36.0, 21.0], [38.0, 24.0], [40.0, 23.0]],
                bilgi: "<b>Yunan Uygarlığı</b><br>Polis adı verilen şehir devletleri (Atina, Sparta) kurdular. Demokrasinin ilk izleri ve felsefi düşünce burada gelişmiştir."
            },
            {
                isim: "İnka Uygarlığı (Amerika)", renk: "#9b59b6",
                koordinatlar: [[-10.0, -78.0], [-20.0, -70.0], [-15.0, -68.0], [-5.0, -75.0]],
                bilgi: "<b>İnkalar</b><br>Güney Amerika'da And Dağları üzerinde muazzam taş işçiliği ile Machu Picchu gibi şehirler kuran büyük imparatorluk."
            },
            {
                isim: "Maya/Aztek (Amerika)", renk: "#8e44ad",
                koordinatlar: [[20.0, -90.0], [15.0, -90.0], [15.0, -88.0], [20.0, -87.0]],
                bilgi: "<b>Mayalar ve Aztekler</b><br>Orta Amerika'da (Meksika) tapınaklar inşa eden, astronomi ve matematikte (Sıfırın kullanımı) çok ileri giden medeniyetler."
            }
        ];

        uygarliklar.forEach(uygarlik => {
            L.polygon(uygarlik.koordinatlar, { color: uygarlik.renk, fillColor: uygarlik.renk, fillOpacity: 0.5, weight: 2 })
            .addTo(window.currentMapInstance)
            .bindPopup(uygarlik.bilgi);
        });

        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">İlk Çağ Uygarlıkları</h4>';
            uygarliklar.forEach(u => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${u.renk}; width: 15px; height: 10px; display: inline-block; margin-right: 5px; opacity: 0.7;"></i> ${u.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },

    // 5. HARİTA: İLK ÇAĞ GÖÇ YOLLARI
    "goc_yollari": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">İlk Çağ'da dünyayı şekillendiren kitlesel göç hareketleri. Çizgilere tıklayarak bilgi alabilirsiniz.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        window.currentMapInstance = L.map('mapCanvas').setView([38.0, 45.0], 3);

        // Türkçe ve Fiziki Google Haritalar Altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        const gocler = [
            {
                isim: "Ege (Deniz Kavimleri) Göçleri", renk: "#2980b9",
                bilgi: "<b>Ege Göçleri (MÖ 13. yy)</b><br>Balkanlardan gelerek Yunanistan, Anadolu ve Mısır'a kadar uzanan yıkıcı göç dalgasıdır. Hitit İmparatorluğu'nun yıkılmasına neden olmuştur.",
                rota: [[39.0, 22.0], [35.0, 25.0], [36.0, 32.0], [31.0, 32.0]]
            },
            {
                isim: "İç Asya (Türk) Göçleri - Batı", renk: "#c0392b",
                bilgi: "<b>İç Asya Göçleri</b><br>İklim değişiklikleri ve otlak yetersizliği nedeniyle Orta Asya'dan Hazar'ın kuzeyinden Avrupa'ya doğru yapılan göçler.",
                rota: [[45.0, 100.0], [48.0, 80.0], [47.0, 60.0], [48.0, 40.0], [45.0, 25.0]]
            },
            {
                isim: "İç Asya (Türk) Göçleri - Güney", renk: "#d35400",
                bilgi: "<b>İç Asya Göçleri</b><br>Orta Asya'dan Hindistan ve Çin'e doğru yapılan tarihi göç dalgaları.",
                rota: [[45.0, 100.0], [35.0, 80.0], [25.0, 75.0]]
            },
            {
                isim: "Babil Sürgünü (Yahudi Göçü)", renk: "#8e44ad",
                bilgi: "<b>Babil Sürgünü (MÖ 586)</b><br>Babil Kralı Nebukadnezar'ın Kudüs'ü işgal etmesiyle Yahudilerin Babil'e sürgün edilmesi olayıdır.",
                rota: [[31.7, 35.2], [33.0, 36.0], [34.0, 40.0], [32.5, 44.4]]
            },
            {
                isim: "İlk Hristiyanların Göçü", renk: "#27ae60",
                bilgi: "<b>İlk Hristiyanların Göçü (MS 1. ve 2. yy)</b><br>Roma İmparatorluğu'nun baskısı nedeniyle Kudüs'ten Antakya, Kapadokya (Kayseri) ve Roma'ya doğru yapılan dini göçler.",
                rota: [[31.7, 35.2], [36.2, 36.1], [38.6, 34.7], [40.0, 28.0], [41.9, 12.5]]
            }
        ];

        gocler.forEach(goc => {
            // Göç yönünü hissettirmek için tireli çizgi (dashArray) kullanıyoruz
            L.polyline(goc.rota, {color: goc.renk, weight: 4, dashArray: '10, 10'})
            .addTo(window.currentMapInstance)
            .bindPopup(goc.bilgi);
        });

        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Göç Yolları</h4>';
            gocler.forEach(g => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${g.renk}; width: 15px; height: 3px; border-bottom: 2px dashed #fff; display: inline-block; margin-right: 5px;"></i> ${g.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    }
    // YENİ HARİTALARI BURANIN ALTINA, VİRGÜL KOYARAK EKLEMEYE DEVAM EDECEĞİZ.
};
// BİZANS İMPARATORLUĞU'NUN DEĞİŞİMİ HARİTASI (Garantili Ekleme Yöntemi)
window.HARITA_MOTORU["bizans_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="bizansYilBaslik" style="margin: 0 0 5px 0; color: #C9A84C; font-size: 18px; font-weight: 800;">395 - Doğu Roma'nın Doğuşu</h4>
            <p id="bizansBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Kavimler Göçü sonrası Roma ikiye ayrıldı. Doğu Roma; Balkanlar, Anadolu, Suriye ve Mısır'a hakimdi.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">395</span>
                <input type="range" id="bizansSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #C9A84C; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">1453</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Doğu Akdeniz'e odakla
    window.currentMapInstance = L.map('mapCanvas').setView([38.0, 25.0], 5);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const bizansVerisi = [
        {
            yil: 395, isim: "395 - Doğu Roma'nın Doğuşu (Yıllara göre ilerlemek için aşağıdaki butonu kaydırın)", renk: "#C9A84C",
            bilgi: "Kavimler Göçü sonrası Roma ikiye ayrıldı. Doğu Roma; Balkanlar, Anadolu, Suriye, Mısır ve Kuzey Libya'ya hakimdi.",
            koordinatlar: [ [[45, 14], [45, 30], [42, 40], [35, 40], [30, 35], [30, 25], [32, 20], [32, 10], [38, 20], [40, 20]] ]
        },
        {
            yil: 565, isim: "565 - I. Justinianus Dönemi (Zirve)", renk: "#2ecc71",
            bilgi: "Justinianus; İtalya, Kuzey Afrika kıyıları ve Güney İspanya'yı da alarak Akdeniz'i tekrar bir Roma gölü haline getirdi.",
            koordinatlar: [ [[45, -5], [45, 30], [42, 40], [35, 40], [30, 35], [30, -5], [38, -5], [40, 20], [46, 12]] ]
        },
        {
            yil: 1025, isim: "1025 - II. Basileios Dönemi", renk: "#f39c12",
            bilgi: "İslam fetihleriyle daralan sınırlar, Makedon Hanedanı ile toparlandı. Balkanlar ve Anadolu'da tekrar tam hakimiyet sağlandı.",
            koordinatlar: [ [[44, 18], [44, 28], [41, 40], [36, 36], [36, 26], [39, 20]] ]
        },
        {
            yil: 1204, isim: "1204 - Latin İstilası ve Parçalanma", renk: "#e74c3c",
            bilgi: "IV. Haçlı Seferi ile İstanbul işgal edildi. Bizans; İznik, Epir ve Trabzon gibi küçük bölgesel devletlere bölündü.",
            koordinatlar: [
                [[41.5, 29], [41.5, 31], [39, 31], [39, 29]],
                [[41.5, 38], [41.5, 41], [40.5, 41], [40.5, 38]],
                [[40, 20], [40, 22], [38, 22], [38, 20]]
            ]
        },
        {
            yil: 1453, isim: "1453 - Çöküş Öncesi Son Sınırlar", renk: "#901010",
            bilgi: "Koca imparatorluk sadece İstanbul surlarının içine ve Yunanistan'daki Mora Yarımadası'na sıkışmış durumdaydı.",
            koordinatlar: [
                [[41.2, 28.8], [41.2, 29.2], [40.8, 29.2], [40.8, 28.8]],
                [[38.5, 21], [38.5, 23.5], [36.5, 23.5], [36.5, 21]]
            ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = bizansVerisi[index];

        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('bizansYilBaslik').innerText = veri.isim;
        document.getElementById('bizansYilBaslik').style.color = veri.renk;
        document.getElementById('bizansBilgi').innerText = veri.bilgi;
    }

    document.getElementById('bizansSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// SASANİ İMPARATORLUĞU'NUN DEĞİŞİMİ HARİTASI
window.HARITA_MOTORU["sasani_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="sasaniYilBaslik" style="margin: 0 0 5px 0; color: #C9A84C; font-size: 18px; font-weight: 800;">224 - İmparatorluğun Kuruluşu</h4>
            <p id="sasaniBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Ardeşir Babekan, Part İmparatorluğu'nu yıkarak Sasani Devleti'ni kurdu. Merkez İran ve Mezopotamya kontrol altına alındı.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">224</span>
                <input type="range" id="sasaniSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #C9A84C; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">651</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Orta Doğu ve İran merkezli odakla
    window.currentMapInstance = L.map('mapCanvas').setView([33.0, 50.0], 5);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const sasaniVerisi = [
        {
            yil: 224, isim: "224 - İmparatorluğun Kuruluşu", renk: "#C9A84C", // Altın
            bilgi: "Ardeşir Babekan, Part İmparatorluğu'nu yıkarak Sasani Devleti'ni kurdu. Merkez İran, Persis ve Mezopotamya kontrol altına alındı.",
            koordinatlar: [ [[25, 48], [35, 43], [37, 45], [38, 55], [35, 60], [25, 60]] ]
        },
        {
            yil: 260, isim: "260 - I. Şapur Dönemi (Genişleme)", renk: "#2ecc71", // Yeşil
            bilgi: "Roma İmparatoru Valerianus esir alındı. Sınırlar Suriye'den İndus Nehri'ne, Kafkaslardan Basra Körfezi'ne kadar genişledi.",
            koordinatlar: [ [[25, 40], [36, 38], [40, 45], [42, 50], [40, 65], [25, 65]] ]
        },
        {
            yil: 620, isim: "620 - II. Hüsrev Dönemi (Zirve)", renk: "#f39c12", // Turuncu
            bilgi: "Sasani orduları Bizans'ı ağır yenilgilere uğratarak Suriye, Mısır, Anadolu ve İstanbul Boğazı'na kadar ulaştı. İmparatorluk en geniş sınırlarında.",
            koordinatlar: [ 
                [[13, 44], [25, 40], [30, 30], [22, 30], [31, 30], [32, 34], [41, 29], [41, 40], [42, 50], [40, 65], [25, 65], [25, 55], [13, 48]] 
            ]
        },
        {
            yil: 642, isim: "642 - Nihavend Savaşı ve Çöküş", renk: "#e74c3c", // Kırmızı
            bilgi: "Hz. Ömer döneminde İslam ordularına karşı alınan Kadisiye ve Nihavend yenilgileriyle Irak ve Batı İran kaybedildi. İmparatorluk hızla dağılıyor.",
            koordinatlar: [ [[28, 52], [36, 52], [38, 55], [39, 65], [28, 65]] ]
        },
        {
            yil: 651, isim: "651 - İmparatorluğun Sonu", renk: "#901010", // Koyu Kırmızı
            bilgi: "Son Sasani Kralı III. Yezdicerd'in Merv şehrinde öldürülmesiyle 400 yıllık Sasani İmparatorluğu tamamen tarih sahnesinden silindi.",
            koordinatlar: [ [[37, 61], [38, 61], [38, 62.5], [37, 62.5]] ] // Merv bölgesinde küçücük bir nokta
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = sasaniVerisi[index];

        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('sasaniYilBaslik').innerText = veri.isim;
        document.getElementById('sasaniYilBaslik').style.color = veri.renk;
        document.getElementById('sasaniBilgi').innerText = veri.bilgi;
    }

    document.getElementById('sasaniSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// 1. VE 2. GÖKTÜRK DEVLETLERİ HARİTASI
window.HARITA_MOTORU["gokturk_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="gokturkYilBaslik" style="margin: 0 0 5px 0; color: #3498db; font-size: 18px; font-weight: 800;">552 - I. Göktürk Devleti'nin Kuruluşu</h4>
            <p id="gokturkBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Bumin Kağan önderliğinde Avar (Juan-Juan) egemenliğine son verilerek Ötüken merkezli I. Göktürk Devleti kuruldu.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">552</span>
                <input type="range" id="gokturkSlider" min="0" max="5" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #3498db; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">744</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Orta Asya ve Moğolistan (Ötüken) merkezli odakla
    window.currentMapInstance = L.map('mapCanvas').setView([45.0, 90.0], 4);

    // Fiziki Harita Altlığı (Dağlar ve bozkırlar net görünsün diye)
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const gokturkVerisi = [
        {
            yil: 552, isim: "552 - I. Göktürk Devleti'nin Kuruluşu", renk: "#3498db", // Göktürk Mavisi
            bilgi: "Bumin Kağan önderliğinde Avar (Juan-Juan) egemenliğine son verilerek Ötüken merkezli I. Göktürk Devleti kuruldu. Bumin Kağan 'İl Kağan' unvanını aldı.",
            koordinatlar: [ [[43, 90], [50, 90], [52, 110], [45, 115], [40, 105]] ]
        },
        {
            yil: 582, isim: "582 - En Geniş Sınırlar", renk: "#2ecc71", // Yeşil
            bilgi: "Mukan Kağan ve İstemi Yabgu dönemlerindeki İpek Yolu fetihleriyle sınırlar Mançurya'dan Karadeniz'e ulaştı. Ancak devlet kısa süre sonra Doğu ve Batı olarak ikiye bölündü.",
            koordinatlar: [ [[40, 50], [50, 50], [55, 70], [55, 110], [50, 125], [40, 120], [35, 90], [38, 70], [35, 55]] ]
        },
        {
            yil: 630, isim: "630 - Fetret (Esaret) Devri", renk: "#7f8c8d", // Gri (Karanlık dönem)
            bilgi: "Zayıflayan Doğu ve Batı Göktürkleri, Çin (Tang Hanedanı) egemenliğine girdi. 50 yıl sürecek esaret ve bağımsızlık isyanları (Kürşad Ayaklanması) başladı.",
            koordinatlar: [ [[45, 100], [48, 100], [48, 110], [45, 110]] ] // Çin baskısıyla çok daralmış alan
        },
        {
            yil: 682, isim: "682 - II. Göktürk (Kutluk) Devleti", renk: "#f39c12", // Turuncu/Bronz (Diriliş)
            bilgi: "Kutluk (İlteriş) Kağan önderliğinde Çin'e karşı bağımsızlık kazanıldı. II. Göktürk Devleti kurularak dağınık Türk boyları yeniden tek bayrak altında birleştirildi.",
            koordinatlar: [ [[42, 90], [52, 90], [52, 115], [42, 115], [38, 105]] ]
        },
        {
            yil: 732, isim: "732 - Bilge Kağan ve Kül Tigin Dönemi", renk: "#C9A84C", // Altın (Zirve)
            bilgi: "Devletin en parlak dönemi. Çin vergiye bağlandı, Türk tarihi ve edebiyatının ilk yazılı kaynakları olan Orhun Abideleri (Bengü Taşlar) dikildi.",
            koordinatlar: [ [[40, 70], [52, 70], [55, 100], [52, 120], [40, 115], [35, 95]] ]
        },
        {
            yil: 744, isim: "744 - Çöküş", renk: "#e74c3c", // Kırmızı
            bilgi: "İç karışıklıklar ve zayıflayan merkezi otorite sonrası Basmıl, Karluk ve Uygur boylarının isyanı sonucunda II. Göktürk Devleti yıkıldı.",
            koordinatlar: [ [[46, 100], [48, 100], [48, 105], [46, 105]] ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = gokturkVerisi[index];

        // Eski sınırları haritadan temizle
        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        // Yeni sınırları çiz
        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5' // Sınırların kesik çizgili olması için
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        // Arayüzdeki metinleri ve renkleri güncelle (Slider rengini de metne uyduruyoruz)
        document.getElementById('gokturkYilBaslik').innerText = veri.isim;
        document.getElementById('gokturkYilBaslik').style.color = veri.renk;
        document.getElementById('gokturkBilgi').innerText = veri.bilgi;
        document.getElementById('gokturkSlider').style.accentColor = veri.renk;
    }

    // Slider (Kaydırma Çubuğu) dinleyicisi
    document.getElementById('gokturkSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında 552 yılını yükle
    haritayiGuncelle(0);
};
// UYGUR DEVLETİ'NİN DEĞİŞİMİ VE YERLEŞİK HAYATA GEÇİŞ (744 - 840)
window.HARITA_MOTORU["uygur_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="uygurYilBaslik" style="margin: 0 0 5px 0; color: #1abc9c; font-size: 18px; font-weight: 800;">744 - Uygur Kağanlığı'nın Kuruluşu</h4>
            <p id="uygurBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Kutluk Bilge Kül Kağan önderliğinde II. Göktürk Devleti'ne son verilerek Ötüken merkezli Uygur Devleti kuruldu.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">744</span>
                <input type="range" id="uygurSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #1abc9c; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">840</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    window.currentMapInstance = L.map('mapCanvas').setView([45.0, 95.0], 4);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const uygurVerisi = [
        {
            yil: 744, isim: "744 - Kuruluş (Ötüken Dönemi)", renk: "#1abc9c", // Turkuaz/Zümrüt
            bilgi: "II. Göktürklerin yıkılmasıyla kurulan devlet, geleneksel Türk merkezi Ötüken'i başkent yaptı. İlk dönemlerde bozkır kültürü hakimdi.",
            koordinatlar: [ [[43, 90], [50, 90], [52, 110], [45, 115], [40, 105]] ]
        },
        {
            yil: 751, isim: "751 - Bayan Çur ve Genişleme", renk: "#2ecc71", // Yeşil
            bilgi: "Talas Savaşı döneminde Çin'deki karışıklıklardan faydalanan Uygurlar, sınırlarını Mançurya'dan Aral Gölü'ne kadar genişlettiler.",
            koordinatlar: [ [[40, 60], [50, 60], [55, 80], [55, 115], [50, 125], [42, 120], [38, 100], [38, 70]] ]
        },
        {
            yil: 762, isim: "762 - Maniheizm ve Yerleşik Yaşam", renk: "#f39c12", // Turuncu (Kültürel dönüşüm)
            bilgi: "Bögü Kağan döneminde Maniheizm resmi din oldu. Et yeme ve savaşmanın yasaklandığı bu din etkisiyle ilk Türk şehirleri (Ordu-Balık) kurulmaya başlandı.",
            koordinatlar: [ [[42, 85], [52, 85], [52, 115], [42, 115], [38, 105]] ]
        },
        {
            yil: 800, isim: "800 - Kültürel Zirve ve Ticaret", renk: "#C9A84C", // Altın (Parlak dönem)
            bilgi: "Uygurlar matbaayı kullandılar, kütüphaneler kurdular ve ipek yolu ticaretini kontrol ettiler. Sanat ve edebiyatta muazzam bir gelişim yaşandı.",
            koordinatlar: [ [[40, 75], [52, 75], [53, 110], [42, 115], [36, 100]] ]
        },
        {
            yil: 840, isim: "840 - Kırgız İstilası ve Göç", renk: "#e74c3c", // Kırmızı (Çöküş)
            bilgi: "Şiddetli kıtlık ve salgın hastalıkların ardından Kırgızların saldırısı sonucu devlet yıkıldı. Uygurlar, Turfan ve Kansu bölgelerine göç etmek zorunda kaldı.",
            koordinatlar: [ 
                [[40, 85], [43, 85], [43, 90], [40, 90]], // Turfan Bölgesi
                [[36, 95], [39, 95], [39, 100], [36, 100]] // Kansu Bölgesi
            ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = uygurVerisi[index];
        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('uygurYilBaslik').innerText = veri.isim;
        document.getElementById('uygurYilBaslik').style.color = veri.renk;
        document.getElementById('uygurBilgi').innerText = veri.bilgi;
        document.getElementById('uygurSlider').style.accentColor = veri.renk;
    }

    document.getElementById('uygurSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// İSLAM DEVLETİ'NİN GENİŞLEMESİ (622 - 661)
window.HARITA_MOTORU["islam_genisleme"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="islamYilBaslik" style="margin: 0 0 5px 0; color: #2ecc71; font-size: 18px; font-weight: 800;">622-632 Hz. Muhammed Dönemi</h4>
            <p id="islamBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Medine İslam Devleti kuruldu. Bedir, Uhud, Hendek savaşları ve Mekke'nin fethiyle Arap Yarımadası'nın büyük bölümünde siyasi birlik sağlandı.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">622</span>
                <input type="range" id="islamSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #2ecc71; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">661</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Dönemleri değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Orta Doğu ve Arap Yarımadası'na odakla
    window.currentMapInstance = L.map('mapCanvas').setView([28.0, 42.0], 4);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const islamVerisi = [
        {
            donem: 0, isim: "Hz. Muhammed Dönemi (622-632)", renk: "#2ecc71", // Zümrüt Yeşili
            bilgi: "Medine İslam Devleti kuruldu. Bedir, Uhud, Hendek savaşları, Hudeybiye Barışı ve Mekke'nin fethiyle Arap Yarımadası'nda ilk kez siyasi birlik sağlandı.",
            koordinatlar: [ [[29, 35], [29, 48], [23, 60], [15, 54], [12, 44], [18, 40], [25, 36]] ]
        },
        {
            donem: 1, isim: "Hz. Ebubekir Dönemi (632-634)", renk: "#27ae60", // Koyu Yeşil
            bilgi: "Ridde (Dinden dönme) ve Yalancı Peygamberler olayları bastırılarak iç otorite sağlandı. Kuran-ı Kerim kitap (Mushaf) haline getirildi. Suriye ve Irak'a ilk seferler başladı.",
            koordinatlar: [ [[31, 35], [31, 47], [29, 48], [23, 60], [15, 54], [12, 44], [18, 40], [25, 36]] ] // Yarımada ve kuzeye hafif çıkış
        },
        {
            donem: 2, isim: "Hz. Ömer Dönemi (634-644)", renk: "#1abc9c", // Turkuaz
            bilgi: "En parlak genişleme dönemi. Yermük ve Ecnadeyn ile Suriye, Kadisiye ve Nihavend ile Sasani (İran) ve Irak, Amr İbnül As ile Mısır fethedildi. Devlet tam bir imparatorluğa dönüştü.",
            koordinatlar: [ [[31, 29], [36, 36], [37, 42], [35, 52], [33, 60], [25, 60], [15, 54], [12, 44], [18, 40], [25, 33], [28, 30]] ]
        },
        {
            donem: 3, isim: "Hz. Osman Dönemi (644-656)", renk: "#f1c40f", // Altın Sarısı
            bilgi: "Kuran-ı Kerim çoğaltılıp eyaletlere gönderildi. İlk İslam donanması kurularak Kıbrıs alındı. Sınırlar Kuzey Afrika'da (Libya) Tunus'a, doğuda Horasan ve Kafkaslara kadar genişledi.",
            koordinatlar: [ [[32, 20], [35, 33], [37, 36], [40, 44], [40, 65], [30, 65], [25, 60], [15, 54], [12, 44], [18, 40], [22, 30], [28, 20]] ]
        },
        {
            donem: 4, isim: "Hz. Ali Dönemi (656-661)", renk: "#e67e22", // Turuncu (İç karışıklıklar)
            bilgi: "Cemel Vakası ve Sıffin Savaşı gibi iç karışıklıklar (Fitne dönemi) nedeniyle bu dönemde yeni fetihler yapılamadı. Başkent Medine'den Kufe'ye taşındı.",
            koordinatlar: [ [[32, 20], [35, 33], [37, 36], [40, 44], [40, 65], [30, 65], [25, 60], [15, 54], [12, 44], [18, 40], [22, 30], [28, 20]] ] // Sınırlar aynı
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = islamVerisi[index];

        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('islamYilBaslik').innerText = veri.isim;
        document.getElementById('islamYilBaslik').style.color = veri.renk;
        document.getElementById('islamBilgi').innerText = veri.bilgi;
        document.getElementById('islamSlider').style.accentColor = veri.renk;
    }

    document.getElementById('islamSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// EMEVİ VE ABBASİ DEVLETLERİNİN DEĞİŞİMİ (661 - 1258)
window.HARITA_MOTORU["emevi_abbasi_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="emeviAbbasiBaslik" style="margin: 0 0 5px 0; color: #2ecc71; font-size: 18px; font-weight: 800;">661 - Emevi Devleti'nin Kuruluşu</h4>
            <p id="emeviAbbasiBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">Hz. Ali'nin vefatından sonra Muaviye, başkenti Şam (Dımaşk) yaparak Emevi Devleti'ni kurdu. Halifelik babadan oğula geçerek saltanata dönüştü.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">661</span>
                <input type="range" id="emeviAbbasiSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #2ecc71; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">950</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Devletlerin değişimini izlemek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Akdeniz ve Orta Doğu'yu görecek şekilde geniş açıyla odakla
    window.currentMapInstance = L.map('mapCanvas').setView([33.0, 25.0], 3);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const emeviAbbasiVerisi = [
        {
            yil: 661, isim: "661 - Emevi Devleti'nin Kuruluşu", anaRenk: "#2ecc71",
            bilgi: "Hz. Ali'nin vefatından sonra Muaviye, başkenti Şam (Dımaşk) yaparak Emevi Devleti'ni kurdu. Halifelik saltanata dönüştü.",
            poligonlar: [
                { ad: "Emeviler", renk: "#27ae60", coords: [ [[35, 35], [38, 45], [35, 60], [25, 60], [15, 50], [12, 44], [20, 35], [30, 30], [30, 40]] ] }
            ]
        },
        {
            yil: 732, isim: "732 - Emeviler'in Zirvesi", anaRenk: "#2ecc71",
            bilgi: "Kuzey Afrika tamamen fethedildi. Tarık bin Ziyad komutasında İspanya (Endülüs) alındı. Doğuda Türkistan ve Hindistan sınırlarına ulaşıldı.",
            poligonlar: [
                { ad: "Emeviler", renk: "#2ecc71", coords: [ [[43, -9], [43, 2], [36, -2], [36, 35], [42, 45], [40, 70], [25, 65], [15, 50], [12, 44], [25, 35], [25, -9]] ] }
            ]
        },
        {
            yil: 750, isim: "750 - Abbasilerin Kuruluşu", anaRenk: "#9b59b6",
            bilgi: "Ebu'l Abbas, Emevi hanedanını yıkarak Abbasi Devleti'ni kurdu. Ancak İspanya'da bağımsız 'Endülüs Emevi Devleti' yaşamaya devam etti.",
            poligonlar: [
                { ad: "Abbasiler", renk: "#8e44ad", coords: [ [[36, 0], [36, 35], [42, 45], [40, 70], [25, 65], [15, 50], [12, 44], [25, 35], [25, 0]] ] },
                { ad: "Endülüs Emevileri", renk: "#2ecc71", coords: [ [[43, -9], [43, 2], [36, 0], [36, -9]] ] }
            ]
        },
        {
            yil: 800, isim: "800 - Harun Reşid ve Altın Çağ", anaRenk: "#9b59b6",
            bilgi: "Abbasiler başkenti Bağdat'a taşıdı. Beytülhikme kurularak bilim ve sanatta İslam'ın Altın Çağı yaşandı. Türkler için 'Samarra' askeri şehirleri kuruldu.",
            poligonlar: [
                { ad: "Abbasiler", renk: "#9b59b6", coords: [ [[36, 10], [36, 35], [42, 45], [40, 70], [25, 65], [15, 50], [12, 44], [25, 35], [25, 10]] ] },
                { ad: "Endülüs Emevileri", renk: "#27ae60", coords: [ [[43, -9], [43, 2], [36, 0], [36, -9]] ] }
            ]
        },
        {
            yil: 950, isim: "950 - Abbasilerin Parçalanması", anaRenk: "#e67e22",
            bilgi: "Geniş sınırlara hükmetmek zorlaştı. Abbasiler Bağdat'a sıkışırken, Mısır ve Kuzey Afrika'da Tolunoğulları ve Fatımiler gibi yerel devletler (Tevaif-i Mülük) kuruldu.",
            poligonlar: [
                { ad: "Abbasiler", renk: "#8e44ad", coords: [ [[35, 40], [35, 48], [30, 48], [30, 40]] ] },
                { ad: "Yerel Devletler (Fatımiler vb.)", renk: "#d35400", coords: [ [[33, 10], [33, 35], [22, 35], [22, 10]] ] },
                { ad: "Endülüs Emevileri", renk: "#27ae60", coords: [ [[43, -9], [42, 3], [36, 0], [36, -9]] ] }
            ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = emeviAbbasiVerisi[index];

        // Eski poligonları temizle
        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        // Her devlet için yeni poligonları çiz
        veri.poligonlar.forEach(bolge => {
            const poligon = L.polygon(bolge.coords, {
                color: bolge.renk,
                fillColor: bolge.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance)
            .bindPopup(`<b>${bolge.ad}</b>`); // Tıklayınca devletin adını gösterir
            
            mevcutPoligonlar.push(poligon);
        });

        // Arayüz metinlerini ve slider rengini döneme göre güncelle
        document.getElementById('emeviAbbasiBaslik').innerText = veri.isim;
        document.getElementById('emeviAbbasiBaslik').style.color = veri.anaRenk;
        document.getElementById('emeviAbbasiBilgi').innerText = veri.bilgi;
        document.getElementById('emeviAbbasiSlider').style.accentColor = veri.anaRenk;
    }

    document.getElementById('emeviAbbasiSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// GELİŞMİŞ TİCARET YOLLARI HARİTASI (İpek, Baharat, Kral, Kürk)
window.HARITA_MOTORU["ticaret_yollari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="ticaretBaslik" style="margin: 0 0 5px 0; color: #f39c12; font-size: 18px; font-weight: 800;">Tarihi Ticaret Yolları</h4>
            <p id="ticaretBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">İlk ve Orta Çağ'da dünyayı birbirine bağlayan, sadece malların değil; kültürlerin, dinlerin ve icatların da taşındığı devasa ticaret ağları.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tümü</span>
                <input type="range" id="ticaretSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #f39c12; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tek Tek</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yolları ayrı ayrı incelemek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Asya, Avrupa ve Afrika'yı görecek şekilde geniş açıyla odakla
    window.currentMapInstance = L.map('mapCanvas').setView([38.0, 60.0], 3);

    // Fiziki Harita Altlığı (Dağlar ve çöller ticaret yollarını belirler)
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const yollar = [
        {
            id: 1, isim: "İpek Yolu", renk: "#e74c3c", // Kırmızı
            bilgi: "Çin'in Şian kentinden başlayıp Orta Asya (Semerkant, Buhara), İran ve Anadolu üzerinden Avrupa'ya uzanan en ünlü ticaret yoludur. İpek, kağıt, porselen ve barut taşınmıştır.",
            rota: [[34.2, 108.9], [40.1, 94.6], [39.4, 75.9], [39.6, 66.9], [37.6, 61.8], [35.5, 51.4], [33.3, 44.4], [36.2, 36.1], [41.0, 28.9], [45.4, 12.3]]
        },
        {
            id: 2, isim: "Baharat Yolu", renk: "#f39c12", // Turuncu
            bilgi: "Hindistan'dan başlayarak deniz yoluyla Kızıldeniz ve Basra Körfezi'ne, oradan da Mısır ve Suriye limanları üzerinden Avrupa'ya ulaşan hattır. Karabiber, tarçın, zencefil taşınmıştır.",
            rota: [[11.2, 75.7], [15.0, 65.0], [12.7, 45.0], [20.0, 38.0], [31.2, 29.9], [35.0, 20.0], [40.8, 14.2]]
        },
        {
            id: 3, isim: "Kral Yolu", renk: "#9b59b6", // Mor
            bilgi: "Lidyalılar ve Persler tarafından kurulan, Anadolu'da Sardes'ten (Manisa) başlayıp Pers başkenti Susa'ya uzanan ilk sistemli posta ve ticaret yoludur.",
            rota: [[38.4, 28.0], [38.6, 31.9], [40.0, 34.6], [38.3, 38.3], [36.3, 43.1], [32.1, 48.2]]
        },
        {
            id: 4, isim: "Kürk Yolu", renk: "#3498db", // Mavi
            bilgi: "Sibirya, Altay ve Ural dağlarının ormanlarından başlayarak İdil (Volga) Nehri üzerinden Hazar ve Karadeniz'e inen kuzey hattıdır. Samur, kunduz ve tilki kürkleri taşınırdı.",
            rota: [[60.0, 70.0], [55.0, 60.0], [51.0, 51.0], [46.3, 48.0], [47.0, 39.0], [45.3, 34.4]]
        }
    ];

    let mevcutCizgiler = [];

    function haritayiGuncelle(index) {
        // Eski çizgileri temizle
        mevcutCizgiler.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutCizgiler = [];

        if (index === 0) {
            // Slider en soldayken: Tüm yolları göster
            yollar.forEach(yol => {
                const cizgi = L.polyline(yol.rota, {color: yol.renk, weight: 5, opacity: 0.85})
                    .addTo(window.currentMapInstance)
                    .bindPopup(`<b>${yol.isim}</b><br>${yol.bilgi}`);
                mevcutCizgiler.push(cizgi);
            });
            
            document.getElementById('ticaretBaslik').innerText = "Tarihi Ticaret Yolları";
            document.getElementById('ticaretBaslik').style.color = "#f39c12";
            document.getElementById('ticaretBilgi').innerText = "İlk ve Orta Çağ'da dünyayı birbirine bağlayan, sadece malların değil; kültürlerin, dinlerin ve icatların da taşındığı devasa ticaret ağları.";
            document.getElementById('ticaretSlider').style.accentColor = "#f39c12";
        } else {
            // Slider kaydırıldığında: Tekil yol gösterimi
            const aktifYol = yollar[index - 1];
            
            // Diğer yolları soluk ve kesik çizgili olarak arka planda bırak
            yollar.forEach(yol => {
                if (yol.id !== aktifYol.id) {
                    const soluk = L.polyline(yol.rota, {color: yol.renk, weight: 3, opacity: 0.2, dashArray: '5, 10'})
                        .addTo(window.currentMapInstance);
                    mevcutCizgiler.push(soluk);
                }
            });

            // Seçili yolu kalın, parlak ve belirgin çiz
            const aktifCizgi = L.polyline(aktifYol.rota, {color: aktifYol.renk, weight: 7, opacity: 1})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${aktifYol.isim}</b><br>${aktifYol.bilgi}`);
                
            mevcutCizgiler.push(aktifCizgi);
            
            // Otomatik olarak o yolun popup'ını aç (Öğrencinin dikkatini hemen çeker)
            aktifCizgi.openPopup();

            // Arayüzü güncelle
            document.getElementById('ticaretBaslik').innerText = aktifYol.isim;
            document.getElementById('ticaretBaslik').style.color = aktifYol.renk;
            document.getElementById('ticaretBilgi').innerText = aktifYol.bilgi;
            document.getElementById('ticaretSlider').style.accentColor = aktifYol.renk;
        }
    }

    document.getElementById('ticaretSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında tüm yolları göster
    haritayiGuncelle(0);
};
// ORTA ÇAĞ'IN BÜYÜK DEVLETLERİ HARİTASI
window.HARITA_MOTORU["ortacag_devletleri"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="ortacagBaslik" style="margin: 0 0 5px 0; color: #9b59b6; font-size: 18px; font-weight: 800;">Orta Çağ'ın Büyük Güçleri</h4>
            <p id="ortacagBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">Orta Çağ boyunca Avrupa'dan Asya'ya kadar dünyayı şekillendiren, farklı yüzyıllarda zirveye ulaşmış en büyük imparatorluklar.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tümü</span>
                <input type="range" id="ortacagSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #9b59b6; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tek Tek</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Devletleri ayrı ayrı incelemek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Avrupa ve Asya'yı tam görecek şekilde geniş açıyla odakla
    window.currentMapInstance = L.map('mapCanvas').setView([40.0, 50.0], 3);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const devletler = [
        {
            id: 1, isim: "Frank İmparatorluğu (Avrupa)", renk: "#3498db", // Mavi
            bilgi: "Kavimler Göçü sonrası Batı Avrupa'da kurulan en güçlü devlettir. Şarlman döneminde zirveye ulaşmış, Avrupa'da feodalizmin temellerini atmıştır.",
            rota: [[42, -5], [52, 2], [54, 10], [48, 14], [43, 12], [43, 3]]
        },
        {
            id: 2, isim: "Bizans İmparatorluğu", renk: "#9b59b6", // Mor
            bilgi: "Doğu Roma olarak da bilinir. Orta Çağ boyunca Anadolu, Balkanlar ve Doğu Akdeniz'e hükmetmiş, 1453'te Fatih Sultan Mehmet tarafından yıkılana kadar yaşamıştır.",
            rota: [[44, 18], [44, 28], [41, 40], [36, 36], [36, 26], [39, 20]]
        },
        {
            id: 3, isim: "Sasani İmparatorluğu", renk: "#2ecc71", // Yeşil
            bilgi: "Orta Doğu'da İran ve Mezopotamya'ya hükmeden devasa bir güçtür. Bizans ile sürekli savaşmış, 7. yüzyılda İslam Orduları (Hz. Ömer) tarafından yıkılmıştır.",
            rota: [[25, 40], [36, 38], [40, 45], [42, 50], [40, 65], [25, 65]]
        },
        {
            id: 4, isim: "Moğol İmparatorluğu", renk: "#e74c3c", // Kırmızı
            bilgi: "13. yüzyılda Cengiz Han tarafından kurulan, tarihin bitişik sınırlara sahip en büyük imparatorluğudur. Çin'den Doğu Avrupa'ya kadar Asya'yı kasıp kavurmuştur.",
            rota: [[50, 30], [55, 60], [60, 100], [55, 130], [35, 120], [25, 100], [25, 60], [35, 45], [40, 40]]
        }
    ];

    let mevcutCizgiler = [];

    function haritayiGuncelle(index) {
        // Eski poligonları temizle
        mevcutCizgiler.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutCizgiler = [];

        if (index === 0) {
            // Slider en soldayken: Tüm devletleri göster
            devletler.forEach(devlet => {
                const poligon = L.polygon(devlet.rota, {color: devlet.renk, fillColor: devlet.renk, fillOpacity: 0.45, weight: 2})
                    .addTo(window.currentMapInstance)
                    .bindPopup(`<b>${devlet.isim}</b><br>${devlet.bilgi}`);
                mevcutCizgiler.push(poligon);
            });
            
            document.getElementById('ortacagBaslik').innerText = "Orta Çağ'ın Büyük Güçleri";
            document.getElementById('ortacagBaslik').style.color = "#9b59b6";
            document.getElementById('ortacagBilgi').innerText = "Orta Çağ boyunca Avrupa'dan Asya'ya kadar dünyayı şekillendiren, farklı yüzyıllarda zirveye ulaşmış en büyük imparatorluklar.";
            document.getElementById('ortacagSlider').style.accentColor = "#9b59b6";
        } else {
            // Slider kaydırıldığında: Tekil devlet gösterimi
            const aktifDevlet = devletler[index - 1];
            
            // Diğer devletleri soluk ve kesik çizgili (sadece sınır) olarak arka planda bırak
            devletler.forEach(devlet => {
                if (devlet.id !== aktifDevlet.id) {
                    const soluk = L.polygon(devlet.rota, {color: devlet.renk, fillOpacity: 0.05, weight: 2, opacity: 0.3, dashArray: '5, 10'})
                        .addTo(window.currentMapInstance);
                    mevcutCizgiler.push(soluk);
                }
            });

            // Seçili devleti parlak ve belirgin çiz
            const aktifPoligon = L.polygon(aktifDevlet.rota, {color: aktifDevlet.renk, fillColor: aktifDevlet.renk, fillOpacity: 0.6, weight: 4})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${aktifDevlet.isim}</b><br>${aktifDevlet.bilgi}`);
                
            mevcutCizgiler.push(aktifPoligon);
            aktifPoligon.openPopup();

            // Arayüzü güncelle
            document.getElementById('ortacagBaslik').innerText = aktifDevlet.isim;
            document.getElementById('ortacagBaslik').style.color = aktifDevlet.renk;
            document.getElementById('ortacagBilgi').innerText = aktifDevlet.bilgi;
            document.getElementById('ortacagSlider').style.accentColor = aktifDevlet.renk;
        }
    }

    document.getElementById('ortacagSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında tüm devletleri göster
    haritayiGuncelle(0);
};
// İLK ÇAĞ ANADOLU UYGARLIKLARI HARİTASI
window.HARITA_MOTORU["anadolu_uygarliklari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="anadoluBaslik" style="margin: 0 0 5px 0; color: #e74c3c; font-size: 18px; font-weight: 800;">Anadolu Uygarlıkları</h4>
            <p id="anadoluBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">İlk Çağ'da Anadolu'da kurulan, ticaret, tarım, hukuk ve mimari alanlarında dünya medeniyetine yön veren büyük uygarlıklar.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tümü</span>
                <input type="range" id="anadoluSlider" min="0" max="5" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #e74c3c; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tek Tek</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Uygarlıkları ayrı ayrı incelemek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı tam olarak Anadolu'nun merkezine odakla
    window.currentMapInstance = L.map('mapCanvas').setView([39.0, 35.0], 6);

    // Fiziki Harita Altlığı (Dağların, nehirlerin görünmesi uygarlıkların yerleşimini anlamak için kritiktir)
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const uygarliklar = [
        {
            id: 1, isim: "Hititler", renk: "#e74c3c", // Kırmızı
            bilgi: "Merkezi Çorum (Hattuşaş) olan, Kızılırmak yayı içinde kurulan ilk merkezi krallık. Pankuş meclisi, Anal (yıllık) yazıcılığı ve Kadeş Antlaşması ile bilinirler.",
            rota: [[41.2, 32.5], [38.5, 32.0], [37.5, 35.0], [38.5, 38.0], [40.5, 37.5]]
        },
        {
            id: 2, isim: "Frigler", renk: "#e67e22", // Turuncu
            bilgi: "Başkentleri Ankara (Gordion) olan, Sakarya nehri boylarında kurulmuş tarım toplumudur. Tarımı koruyan çok sert kanunları vardır. Tapates (halı) ve Fibula (çengelli iğne) onlara aittir.",
            rota: [[40.5, 30.0], [38.5, 30.0], [38.0, 32.5], [40.0, 32.5]]
        },
        {
            id: 3, isim: "Lidyalılar", renk: "#f1c40f", // Altın Sarısı
            bilgi: "Gediz ve Menderes nehirleri arasında, başkenti Manisa (Sardes) olan ticaret devletidir. Parayı icat ederek takas usulünü bitirmiş, Kral Yolu'nu kurmuşlardır.",
            rota: [[39.5, 27.0], [38.0, 27.0], [38.0, 29.5], [39.5, 29.5]]
        },
        {
            id: 4, isim: "İyonyalılar", renk: "#3498db", // Mavi (Denizci)
            bilgi: "Ege kıyılarında (İzmir, Efes, Milet, Foça) şehir devletleri (Polis) halinde yaşadılar. Özgür düşünce ortamı sayesinde bilim, felsefe, tıp ve matematikte (Tales, Hipokrat) çok ilerlediler.",
            rota: [[39.5, 26.0], [37.0, 26.0], [37.0, 27.5], [39.0, 27.5]]
        },
        {
            id: 5, isim: "Urartular", renk: "#9b59b6", // Mor
            bilgi: "Doğu Anadolu'da, başkenti Van (Tuşpa) olan dağlık bölge uygarlığıdır. Taş işçiliğinde, madencilikte ve su mühendisliğinde (Şamran Kanalı) çok gelişmişlerdir.",
            rota: [[40.5, 41.0], [38.0, 41.0], [37.5, 44.0], [40.0, 44.5]]
        }
    ];

    let mevcutCizgiler = [];

    function haritayiGuncelle(index) {
        // Eski poligonları temizle
        mevcutCizgiler.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutCizgiler = [];

        if (index === 0) {
            // Slider en soldayken: Tüm uygarlıkları göster
            uygarliklar.forEach(uyg => {
                const poligon = L.polygon(uyg.rota, {color: uyg.renk, fillColor: uyg.renk, fillOpacity: 0.45, weight: 2})
                    .addTo(window.currentMapInstance)
                    .bindPopup(`<b>${uyg.isim}</b><br>${uyg.bilgi}`);
                mevcutCizgiler.push(poligon);
            });
            
            document.getElementById('anadoluBaslik').innerText = "Anadolu Uygarlıkları";
            document.getElementById('anadoluBaslik').style.color = "#e74c3c";
            document.getElementById('anadoluBilgi').innerText = "İlk Çağ'da Anadolu'da kurulan, ticaret, tarım, hukuk ve mimari alanlarında dünya medeniyetine yön veren büyük uygarlıklar.";
            document.getElementById('anadoluSlider').style.accentColor = "#e74c3c";
        } else {
            // Slider kaydırıldığında: Tekil uygarlık gösterimi
            const aktifUygarlik = uygarliklar[index - 1];
            
            // Diğer uygarlıkları soluk ve kesik çizgili (sadece sınır) olarak arka planda bırak
            uygarliklar.forEach(uyg => {
                if (uyg.id !== aktifUygarlik.id) {
                    const soluk = L.polygon(uyg.rota, {color: uyg.renk, fillOpacity: 0.05, weight: 2, opacity: 0.3, dashArray: '5, 10'})
                        .addTo(window.currentMapInstance);
                    mevcutCizgiler.push(soluk);
                }
            });

            // Seçili uygarlığı parlak ve belirgin çiz
            const aktifPoligon = L.polygon(aktifUygarlik.rota, {color: aktifUygarlik.renk, fillColor: aktifUygarlik.renk, fillOpacity: 0.6, weight: 4})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${aktifUygarlik.isim}</b><br>${aktifUygarlik.bilgi}`);
                
            mevcutCizgiler.push(aktifPoligon);
            aktifPoligon.openPopup(); // Öğrencinin dikkatini hemen çekmek için popup otomatik açılır

            // Arayüzü güncelle
            document.getElementById('anadoluBaslik').innerText = aktifUygarlik.isim;
            document.getElementById('anadoluBaslik').style.color = aktifUygarlik.renk;
            document.getElementById('anadoluBilgi').innerText = aktifUygarlik.bilgi;
            document.getElementById('anadoluSlider').style.accentColor = aktifUygarlik.renk;
        }
    }

    document.getElementById('anadoluSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında tüm devletleri göster
    haritayiGuncelle(0);
};
