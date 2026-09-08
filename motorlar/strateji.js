// strateji.js

// Ortak Yardımcı Fonksiyon
function logGame(id, msg) {
    const logBox = document.getElementById(id);
    if(logBox) {
        logBox.innerHTML = `<div style="margin-bottom: 8px;">> ${msg}</div>` + logBox.innerHTML;
    }
}

/* =========================================
   1. PADİŞAHIN KARARLARI (REIGNS TARZI)
   ========================================= */
let reignsState = { gold: 50, army: 50, people: 50, religion: 50, year: 0 };
const reignsEvents = [
    { text: "Hünkarım, Anadolu'da şiddetli bir kuraklık baş gösterdi. Devlet ambarlarındaki buğdayı halka ücretsiz dağıtalım mı?", char: "🌾", yes: { gold: -15, people: +20, army: 0, religion: +5 }, no: { gold: +5, people: -25, army: -5, religion: 0 } },
    { text: "Yeniçeriler cülus bahşişlerini az buldular ve kazan kaldırdılar. İstedikleri ekstra altını verelim mi?", char: "⚔️", yes: { gold: -25, army: +20, people: -10, religion: 0 }, no: { gold: 0, army: -30, people: +5, religion: -5 } },
    { text: "Şeyhülislam, matbaanın dinen caiz olmadığını söylüyor ve yasaklanmasını talep ediyor. Yasaklayalım mı?", char: "📜", yes: { gold: -10, religion: +20, people: -10, army: 0 }, no: { gold: +15, religion: -25, people: +15, army: +5 } },
    { text: "Venedik elçisi, Karadeniz'de ticaret izni karşılığında hazinemize yüklü miktarda altın teklif ediyor. Kabul edelim mi?", char: "💰", yes: { gold: +30, army: -10, people: -5, religion: -10 }, no: { gold: -10, army: +10, people: +5, religion: +5 } }
];
let currentReignsEvent = null;

function initReigns() {
    reignsState = { gold: 50, army: 50, people: 50, religion: 50, year: 0 };
    if(document.getElementById('reigns-restart')) {
        document.getElementById('reigns-restart').style.display = 'none';
        document.getElementById('reigns-actions').style.display = 'flex';
        updateReignsUI();
        nextReignsEvent();
    }
}

function updateReignsUI() {
    document.getElementById('bar-gold').style.height = reignsState.gold + '%';
    document.getElementById('bar-army').style.height = reignsState.army + '%';
    document.getElementById('bar-people').style.height = reignsState.people + '%';
    document.getElementById('bar-religion').style.height = reignsState.religion + '%';
    document.getElementById('reigns-year').innerText = reignsState.year;
    
    if(reignsState.gold <= 0 || reignsState.gold >= 100 || reignsState.army <= 0 || reignsState.army >= 100 || reignsState.people <= 0 || reignsState.people >= 100 || reignsState.religion <= 0 || reignsState.religion >= 100) {
        gameOverReigns();
    }
}

function nextReignsEvent() {
    currentReignsEvent = reignsEvents[Math.floor(Math.random() * reignsEvents.length)];
    document.getElementById('reigns-text').innerText = currentReignsEvent.text;
    document.getElementById('reigns-character').innerText = currentReignsEvent.char;
}

function makeDecision(isYes) {
    if(!currentReignsEvent) return;
    let effects = isYes ? currentReignsEvent.yes : currentReignsEvent.no;
    reignsState.gold = Math.max(0, Math.min(100, reignsState.gold + effects.gold));
    reignsState.army = Math.max(0, Math.min(100, reignsState.army + effects.army));
    reignsState.people = Math.max(0, Math.min(100, reignsState.people + effects.people));
    reignsState.religion = Math.max(0, Math.min(100, reignsState.religion + effects.religion));
    reignsState.year += Math.floor(Math.random() * 3) + 1;
    if(reignsState.year >= 20) {
        if(typeof unlockBadge === 'function') unlockBadge('padisah_adil');
    }
    updateReignsUI();
    if(document.getElementById('reigns-actions').style.display !== 'none') nextReignsEvent();
}

function gameOverReigns() {
    document.getElementById('reigns-text').innerHTML = `<strong>OYUN BİTTİ!</strong><br><br>Dengeyi kaybettiniz!<br><br>Tahtta ${reignsState.year} yıl kaldınız.`;
    document.getElementById('reigns-character').innerText = "💀";
    document.getElementById('reigns-actions').style.display = 'none';
    document.getElementById('reigns-restart').style.display = 'block';
}


/* =========================================
   2. İPEK YOLU TÜCCARI
   ========================================= */
const srCities = [{ name: "Şian", silkPrice: 5, spicePrice: 15 }, { name: "Buhara", silkPrice: 15, spicePrice: 10 }, { name: "İstanbul", silkPrice: 30, spicePrice: 5 }];
let srState = { cityIndex: 0, gold: 100, water: 10, food: 10, silk: 0, spice: 0 };
function initSilkRoad() { 
    srState = { cityIndex: 0, gold: 100, water: 10, food: 10, silk: 0, spice: 0 }; 
    if(document.getElementById('sr-restart')) {
        document.getElementById('sr-restart').style.display = 'none'; 
        document.getElementById('sr-travel-controls').style.display = 'block'; 
        document.getElementById('sr-log').innerHTML = ""; 
        logGame('sr-log', "Kervan yola çıkmaya hazır."); 
        updateSRUI(); 
    }
}
function updateSRUI() {
    let city = srCities[srState.cityIndex];
    document.getElementById('sr-city').innerText = city.name;
    document.getElementById('sr-gold').innerText = srState.gold; document.getElementById('sr-water').innerText = srState.water; document.getElementById('sr-food').innerText = srState.food; document.getElementById('sr-silk').innerText = srState.silk; document.getElementById('sr-spice').innerText = srState.spice;
    document.getElementById('price-silk').innerText = city.silkPrice; document.getElementById('price-spice').innerText = city.spicePrice;
    if(srState.cityIndex === srCities.length - 1) { 
        document.getElementById('sr-travel-controls').style.display = 'none'; 
        document.getElementById('sr-restart').style.display = 'block'; 
        logGame('sr-log', `Tebrikler! İstanbul'a ulaştın. Toplam servetin: ${srState.gold} Altın.`); 
        if(typeof unlockBadge === 'function') unlockBadge('ipekyolu_kral');
    }
}
function buyItem(item) { let p = item === 'silk' ? srCities[srState.cityIndex].silkPrice : srCities[srState.cityIndex].spicePrice; if(srState.gold >= p) { srState.gold -= p; srState[item]++; updateSRUI(); } else logGame('sr-log', "Yeterli altın yok!"); }
function sellItem(item) { let p = item === 'silk' ? srCities[srState.cityIndex].silkPrice : srCities[srState.cityIndex].spicePrice; if(srState[item] > 0) { srState.gold += p; srState[item]--; updateSRUI(); } else logGame('sr-log', "Elinde kalmadı!"); }
function travelNextCity() {
    if(srState.water < 2 || srState.food < 2) { logGame('sr-log', "ÖLÜM: Erzak bitti."); document.getElementById('sr-travel-controls').style.display = 'none'; document.getElementById('sr-restart').style.display = 'block'; return; }
    srState.water -= 2; srState.food -= 2;
    if(Math.random() < 0.3) { logGame('sr-log', "Eşkıya saldırısı! 10 altın çaldılar."); srState.gold = Math.max(0, srState.gold - 10); } else logGame('sr-log', "Yolculuk güvenli geçti.");
    srState.cityIndex++; updateSRUI();
}


/* =========================================
   3. DEVRİM MAHKEMESİ (1789)
   ========================================= */
let frState = { jacobin: 50, bourgeoisie: 50, peasant: 50, threat: 50, month: 0 };
const frEvents = [
    { text: "Kral kaçarken Varennes'de yakalandı! Onu giyotine gönderelim mi?", char: "👑", yes: { jacobin: +20, bourgeoisie: -10, peasant: +10, threat: +20 }, no: { jacobin: -30, bourgeoisie: +20, peasant: -10, threat: -10 } },
    { text: "Ekmek fiyatları kontrolden çıktı. Fırıncıları asıp fiyatları sabitleyelim mi (Karaborsa Yasası)?", char: "🥖", yes: { jacobin: +15, bourgeoisie: -25, peasant: +20, threat: 0 }, no: { jacobin: -20, bourgeoisie: +15, peasant: -30, threat: +10 } },
    { text: "Avusturya ordusu sınıra dayandı! Genel seferberlik (Levee en masse) ilan edelim mi?", char: "⚔️", yes: { jacobin: +10, bourgeoisie: -10, peasant: -20, threat: -30 }, no: { jacobin: -10, bourgeoisie: +10, peasant: +10, threat: +40 } }
];
let currentFREvent = null;

function initFR() {
    frState = { jacobin: 50, bourgeoisie: 50, peasant: 50, threat: 50, month: 0 };
    if(document.getElementById('fr-restart')) {
        document.getElementById('fr-restart').style.display = 'none'; document.getElementById('fr-actions').style.display = 'flex';
        updateFRUI(); nextFREvent();
    }
}
function updateFRUI() {
    document.getElementById('fr-bar-jacobin').style.height = frState.jacobin + '%';
    document.getElementById('fr-bar-bourgeoisie').style.height = frState.bourgeoisie + '%';
    document.getElementById('fr-bar-peasant').style.height = frState.peasant + '%';
    document.getElementById('fr-bar-threat').style.height = frState.threat + '%';
    document.getElementById('fr-month').innerText = frState.month;
    if(frState.jacobin <= 0 || frState.jacobin >= 100 || frState.bourgeoisie <= 0 || frState.peasant <= 0 || frState.threat >= 100) gameOverFR();
}
function nextFREvent() {
    currentFREvent = frEvents[Math.floor(Math.random() * frEvents.length)];
    document.getElementById('fr-text').innerText = currentFREvent.text; document.getElementById('fr-character').innerText = currentFREvent.char;
}
function makeFRDecision(isYes) {
    if(!currentFREvent) return;
    let e = isYes ? currentFREvent.yes : currentFREvent.no;
    frState.jacobin = Math.max(0, Math.min(100, frState.jacobin + e.jacobin));
    frState.bourgeoisie = Math.max(0, Math.min(100, frState.bourgeoisie + e.bourgeoisie));
    frState.peasant = Math.max(0, Math.min(100, frState.peasant + e.peasant));
    frState.threat = Math.max(0, Math.min(100, frState.threat + e.threat));
    frState.month += 1;
    if(frState.month >= 12) {
        if(typeof unlockBadge === 'function') unlockBadge('fransa_devrim');
    }
    updateFRUI(); if(document.getElementById('fr-actions').style.display !== 'none') nextFREvent();
}
function gameOverFR() {
    document.getElementById('fr-text').innerHTML = `<strong>DEVRİM YEDİ BİTİRDİ!</strong><br><br>Giyotin sizi bekliyor. ${frState.month} ay hayatta kaldınız.`;
    document.getElementById('fr-character').innerText = "🪓"; document.getElementById('fr-actions').style.display = 'none'; document.getElementById('fr-restart').style.display = 'block';
}


/* =========================================
   4. KOLONİ DİRENİŞİ (1776)
   ========================================= */
let amState = { militia: 500, gold: 100, french: 0, britishControl: 50 };
function initAm() {
    amState = { militia: 500, gold: 100, french: 0, britishControl: 50 };
    if(document.getElementById('am-restart')) {
        document.getElementById('am-restart').style.display = 'none';
        document.getElementById('btn-am-recruit').disabled = false; document.getElementById('btn-am-attack').disabled = false; document.getElementById('btn-am-diplo').disabled = false;
        document.getElementById('am-log').innerHTML = ""; logGame('am-log', "General Washington, İngilizler Boston'a yığılıyor. Emirleriniz?"); updateAmUI();
    }
}
function updateAmUI() {
    document.getElementById('am-militia').innerText = amState.militia; document.getElementById('am-gold').innerText = amState.gold; document.getElementById('am-french').innerText = '%' + amState.french;
    document.getElementById('am-british-bar').style.width = Math.min(100, Math.max(0, amState.britishControl)) + '%';
    
    document.getElementById('btn-am-recruit').disabled = amState.gold < 20;
    document.getElementById('btn-am-attack').disabled = amState.militia < 100;
    document.getElementById('btn-am-diplo').disabled = amState.gold < 30;
    
    if(amState.french >= 100) { logGame('am-log', "ZAFER! Fransız donanması geldi ve İngilizler teslim oldu."); endAm(); }
    else if(amState.britishControl >= 100) { logGame('am-log', "HEZİMET! İngilizler tüm kolonileri ele geçirdi."); endAm(); }
}
function actionAm(type) {
    if(type === 'recruit') { amState.gold -= 20; amState.militia += 150; logGame('am-log', "20 Altın harcandı, 150 milis katıldı."); }
    else if(type === 'attack') {
        amState.militia -= 100;
        if(Math.random() < 0.6) { amState.britishControl -= 10; amState.gold += 30; logGame('am-log', "Başarılı pusu! İngiliz baskısı kırıldı, ganimet alındı."); }
        else { amState.britishControl += 5; logGame('am-log', "Saldırı başarısız! Birliklerimiz dağıldı."); }
    }
    else if(type === 'diplomacy') { amState.gold -= 30; amState.french += 25; logGame('am-log', "Elçi Paris'te başarılı oldu! Fransız desteği artıyor."); }
    
    // İngiliz hamlesi
    if(Math.random() < 0.4 && amState.britishControl < 100 && amState.french < 100) {
        amState.britishControl += 10; logGame('am-log', "İngiliz donanması yeni askerler indirdi! (Baskı +%10)");
    }
    updateAmUI();
}
function endAm() { document.getElementById('btn-am-recruit').disabled = true; document.getElementById('btn-am-attack').disabled = true; document.getElementById('btn-am-diplo').disabled = true; document.getElementById('am-restart').style.display = 'block'; }


/* =========================================
   5. 95 TEZ (1517)
   ========================================= */
let refState = { turns: 20, followers: 0, danger: 0 };
function initRef() { 
    refState = { turns: 20, followers: 0, danger: 0 }; 
    if(document.getElementById('ref-restart')) {
        document.getElementById('ref-restart').style.display = 'none'; document.getElementById('btn-ref-print').disabled = false; document.getElementById('btn-ref-preach').disabled = false; document.getElementById('btn-ref-hide').disabled = false; document.getElementById('ref-log').innerHTML = ""; logGame('ref-log', "Tezleri astın. Şimdi yayma vakti!"); updateRefUI(); 
    }
}
function updateRefUI() {
    document.getElementById('ref-turns').innerText = refState.turns; document.getElementById('ref-followers').innerText = refState.followers;
    document.getElementById('ref-danger-bar').style.width = Math.min(100, Math.max(0, refState.danger)) + '%';
    if(refState.followers >= 100) { 
        logGame('ref-log', "ZAFER! Reform hareketi Avrupa'ya yayıldı!"); 
        if(typeof unlockBadge === 'function') unlockBadge('reform_atesi');
        endRef(); 
    }
    else if(refState.danger >= 100) { logGame('ref-log', "Aforoz edildin ve Engizisyon tarafından yakalandın!"); endRef(); }
    else if(refState.turns <= 0) { logGame('ref-log', "Süre doldu, fikirlerin unutulup gitti."); endRef(); }
}
function actionRef(type) {
    refState.turns--;
    if(type === 'print') { refState.followers += 15; refState.danger += 10; logGame('ref-log', "İncil basıldı. İnananlar arttı ama Papalık öfkeli."); }
    else if(type === 'preach') { refState.followers += 25; refState.danger += 20; logGame('ref-log', "Meydanda vaaz verdin. Büyük kitleler katıldı ama çok dikkat çektin!"); }
    else if(type === 'hide') { refState.danger = Math.max(0, refState.danger - 30); logGame('ref-log', "Wartburg Kalesi'nde saklandın. Tehdit azaldı."); }
    updateRefUI();
}
function endRef() { document.getElementById('btn-ref-print').disabled = true; document.getElementById('btn-ref-preach').disabled = true; document.getElementById('btn-ref-hide').disabled = true; document.getElementById('ref-restart').style.display = 'block'; }


// Initial Loads
window.addEventListener('load', () => { 
    initReigns(); 
    initSilkRoad(); 
    initFR(); 
    initAm(); 
    initRef(); 
});
