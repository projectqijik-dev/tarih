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
