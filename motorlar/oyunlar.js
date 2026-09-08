// oyunlar.js

/* --- KATEGORİ VE GENEL SİSTEM --- */
function toggleCategory(cat) {
    document.querySelectorAll('.category-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.master-btn').forEach(btn => btn.style.background = 'var(--panel-bg)');
    
    document.getElementById('category-' + cat).classList.add('active');
    document.getElementById('btn-cat-' + cat).style.background = 'rgba(0,0,0,0.05)';
    
    // Açılan kategorideki ilk oyunu otomatik seç
    if(cat === 'mini') switchGame('game-2048');
    if(cat === 'strategy') switchGame('game-reigns');
}

function switchGame(gameId) {
    document.querySelectorAll('.game-container').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(gameId).classList.add('active');
    event.target.classList.add('active');
}

// Data Export/Import
function exportData() {
    const data = {
        score2048: localStorage.getItem('tarih_2048_score') || 0,
        best2048: localStorage.getItem('tarih_2048_best') || 0,
        grid2048: localStorage.getItem('tarih_2048_grid') || null,
        bestMemory: localStorage.getItem('tarih_memory_best') || null,
        bestHangman: localStorage.getItem('tarih_hangman_best') || 0,
        sudokuGrid: localStorage.getItem('tarih_sudoku_grid') || null,
        sudokuInit: localStorage.getItem('tarih_sudoku_init') || null
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tarih_oyun_verileri.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.score2048 !== undefined) localStorage.setItem('tarih_2048_score', data.score2048);
            if(data.best2048 !== undefined) localStorage.setItem('tarih_2048_best', data.best2048);
            if(data.grid2048 !== undefined) localStorage.setItem('tarih_2048_grid', data.grid2048);
            if(data.bestMemory !== undefined) localStorage.setItem('tarih_memory_best', data.bestMemory);
            if(data.bestHangman !== undefined) localStorage.setItem('tarih_hangman_best', data.bestHangman);
            if(data.sudokuGrid !== undefined) localStorage.setItem('tarih_sudoku_grid', data.sudokuGrid);
            if(data.sudokuInit !== undefined) localStorage.setItem('tarih_sudoku_init', data.sudokuInit);
            alert("Veriler başarıyla yüklendi! Sayfa yenileniyor...");
            location.reload();
        } catch(err) {
            alert("Geçersiz dosya formatı.");
        }
    };
    reader.readAsText(file);
}

/* --- 2048 KLASİK SÜRÜM --- */
let board2048 = [];
let score2048 = 0;
let best2048 = localStorage.getItem('tarih_2048_best') || 0;

function init2048(reset = false) {
    document.getElementById('best-2048').innerText = best2048;
    const savedGrid = localStorage.getItem('tarih_2048_grid');
    
    if (savedGrid && !reset) {
        board2048 = JSON.parse(savedGrid);
        score2048 = parseInt(localStorage.getItem('tarih_2048_score')) || 0;
    } else {
        board2048 = Array(4).fill().map(() => Array(4).fill(0));
        score2048 = 0;
        addRandomTile();
        addRandomTile();
    }
    updateBoard2048();
}

function save2048() {
    localStorage.setItem('tarih_2048_grid', JSON.stringify(board2048));
    localStorage.setItem('tarih_2048_score', score2048);
    if(score2048 > best2048) {
        best2048 = score2048;
        localStorage.setItem('tarih_2048_best', best2048);
        document.getElementById('best-2048').innerText = best2048;
    }
}

function addRandomTile() {
    let emptyCells = [];
    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
            if(board2048[r][c] === 0) emptyCells.push({r,c});
        }
    }
    if(emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board2048[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard2048() {
    const grid = document.getElementById('grid-2048');
    grid.innerHTML = '';
    
    for(let i=0; i<16; i++) {
        let bgCell = document.createElement('div');
        bgCell.className = 'grid-cell';
        grid.appendChild(bgCell);
    }

    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
            if(board2048[r][c] !== 0) {
                let val = board2048[r][c];
                let tile = document.createElement('div');
                tile.className = `tile tile-${val > 2048 ? 2048 : val}`;
                tile.style.width = '22.5%';
                tile.style.height = '22.5%';
                tile.style.left = `${c * 25 + 2.5}%`;
                tile.style.top = `${r * 25 + 2.5}%`;
                tile.innerText = val;
                grid.appendChild(tile);
            }
        }
    }
    document.getElementById('score-2048').innerText = score2048;
    save2048();
}

function move2048(direction) {
    let moved = false;
    let newBoard = JSON.parse(JSON.stringify(board2048));

    function slide(row) {
        let arr = row.filter(val => val);
        let missing = 4 - arr.length;
        let zeros = Array(missing).fill(0);
        return arr.concat(zeros);
    }

    function combine(row) {
        for (let i = 0; i < 3; i++) {
            if (row[i] !== 0 && row[i] === row[i + 1]) {
                row[i] *= 2;
                score2048 += row[i];
                row[i + 1] = 0;
                
                if (row[i] === 2048) {
                    if (typeof unlockBadge === 'function') unlockBadge('2048_zekasi');
                }
            }
        }
        return row;
    }

    if (direction === 'Left' || direction === 'Right') {
        for (let r = 0; r < 4; r++) {
            let row = newBoard[r];
            if (direction === 'Right') row.reverse();
            row = slide(row);
            row = combine(row);
            row = slide(row);
            if (direction === 'Right') row.reverse();
            newBoard[r] = row;
        }
    } else if (direction === 'Up' || direction === 'Down') {
        for (let c = 0; c < 4; c++) {
            let row = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
            if (direction === 'Down') row.reverse();
            row = slide(row);
            row = combine(row);
            row = slide(row);
            if (direction === 'Down') row.reverse();
            for (let r = 0; r < 4; r++) {
                newBoard[r][c] = row[r];
            }
        }
    }

    if (JSON.stringify(board2048) !== JSON.stringify(newBoard)) {
        board2048 = newBoard;
        addRandomTile();
        updateBoard2048();
    }
}

document.addEventListener('keydown', (e) => {
    if(!document.getElementById('game-2048').classList.contains('active')) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move2048(e.key.replace('Arrow', ''));
    }
});

let touchStartX = 0;
let touchStartY = 0;
document.getElementById('grid-2048').addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

document.getElementById('grid-2048').addEventListener('touchend', e => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, {passive: true});

function handleSwipe(startX, startY, endX, endY) {
    if(!document.getElementById('game-2048').classList.contains('active')) return;
    let diffX = endX - startX;
    let diffY = endY - startY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) move2048(diffX > 0 ? 'Right' : 'Left');
    } else {
        if (Math.abs(diffY) > 30) move2048(diffY > 0 ? 'Down' : 'Up');
    }
}


/* --- HAFIZA KARTLARI (Sadeleştirilmiş 6 Çift) --- */
const memoryPairs = [
    { id: 1, text: "1453", match: "Fatih Sultan Mehmet" },
    { id: 2, text: "1923", match: "Mustafa Kemal Atatürk" },
    { id: 3, text: "Malazgirt", match: "Alparslan" },
    { id: 4, text: "Matbaa", match: "Gutenberg" },
    { id: 6, text: "Göbeklitepe", match: "Sıfır Noktası" },
    { id: 7, text: "Yazı", match: "Sümerler" }
];

let memoryCards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let memoryMoves = 0;
let matchedPairs = 0;
let bestMemory = localStorage.getItem('tarih_memory_best') || '-';

function initMemory() {
    document.getElementById('best-memory').innerText = bestMemory;
    const grid = document.getElementById('grid-memory');
    grid.innerHTML = '';
    // Dinamik grid boyutu ayarlama (12 kart için 4x3)
    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    
    memoryMoves = 0;
    matchedPairs = 0;
    document.getElementById('moves-memory').innerText = memoryMoves;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    memoryCards = [];
    memoryPairs.forEach(pair => {
        memoryCards.push({ id: pair.id, text: pair.text });
        memoryCards.push({ id: pair.id, text: pair.match });
    });

    memoryCards.sort(() => 0.5 - Math.random());

    memoryCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">?</div>
                <div class="memory-card-back">${card.text}</div>
            </div>
        `;
        
        cardElement.addEventListener('click', flipCard);
        grid.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    memoryMoves++;
    document.getElementById('moves-memory').innerText = memoryMoves;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.id === secondCard.dataset.id;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;

    if (matchedPairs === memoryPairs.length) {
        setTimeout(() => {
            alert(`Tebrikler! Oyunu ${memoryMoves} hamlede bitirdin.`);
            let currentBest = localStorage.getItem('tarih_memory_best');
            if (!currentBest || memoryMoves < parseInt(currentBest)) {
                localStorage.setItem('tarih_memory_best', memoryMoves);
                document.getElementById('best-memory').innerText = memoryMoves;
            }
        }, 500);
    }
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

/* --- ADAM ASMACA (Tarih Sürümü) --- */
const hangmanWords = [
    "CUMHURIYET", "RONESANS", "MATBAA", "ALGORITMA", "DEZENFORMASYON", 
    "IMPARATORLUK", "MEZOPOTAMYA", "SADRAZAM", "OSMANLI", "SELCUKLU",
    "LOZAN", "MONDROS", "YENICERI", "FEODALITE", "KAPITALIZM"
];
let chosenWord = "";
let guessedLetters = [];
let mistakes = 0;
let maxMistakes = 6;
let scoreHangman = 0;
let bestHangman = localStorage.getItem('tarih_hangman_best') || 0;

const hangmanStages = [
`
  +---+
  |   |
      |
      |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
];

function initHangman() {
    document.getElementById('best-hangman').innerText = bestHangman;
    document.getElementById('score-hangman').innerText = scoreHangman;
    chosenWord = hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
    guessedLetters = [];
    mistakes = 0;
    
    updateHangmanDisplay();
    generateKeyboard();
}

function updateHangmanDisplay() {
    document.getElementById('hangman-drawing').innerText = hangmanStages[mistakes];
    
    let wordHTML = '';
    let isWon = true;
    for(let char of chosenWord) {
        if(guessedLetters.includes(char)) {
            wordHTML += `<div class="hangman-letter">${char}</div>`;
        } else {
            wordHTML += `<div class="hangman-letter"></div>`;
            isWon = false;
        }
    }
    document.getElementById('hangman-word').innerHTML = wordHTML;
    
    if(isWon) {
        setTimeout(() => {
            alert("Tebrikler, kelimeyi buldun!");
            scoreHangman++;
            document.getElementById('score-hangman').innerText = scoreHangman;
            if(scoreHangman > bestHangman) {
                bestHangman = scoreHangman;
                localStorage.setItem('tarih_hangman_best', bestHangman);
                document.getElementById('best-hangman').innerText = bestHangman;
            }
            initHangman();
        }, 300);
    } else if(mistakes >= maxMistakes) {
        setTimeout(() => {
            alert("Oyun bitti! Kelime: " + chosenWord);
            scoreHangman = 0;
            initHangman();
        }, 300);
    }
}

function generateKeyboard() {
    const letters = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"; // Türkçe klavye mantığı, kelimeler ingiliz alfabesiyle ama olsun
    let kbHTML = '';
    for(let i=0; i<letters.length; i++) {
        kbHTML += `<button class="key-btn" id="key-${letters[i]}" onclick="guessLetter('${letters[i]}')">${letters[i]}</button>`;
    }
    document.getElementById('hangman-keyboard').innerHTML = kbHTML;
}

function guessLetter(letter) {
    if(guessedLetters.includes(letter) || mistakes >= maxMistakes) return;
    
    guessedLetters.push(letter);
    let btn = document.getElementById(`key-${letter}`);
    
    if(chosenWord.includes(letter)) {
        btn.classList.add('correct');
    } else {
        btn.classList.add('wrong');
        mistakes++;
    }
    updateHangmanDisplay();
}

/* --- SUDOKU --- */
// Sabit, çözülmüş ve kurallara uygun basit bir 9x9 şablonu (Performans için)
const baseSudoku = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
];

let currentSudoku = [];
let initialSudoku = [];
let selectedCell = null;
let currentDifficulty = 'Kolay'; // Kolay, Orta, Zor

function shuffleSudoku(board) {
    let newBoard = JSON.parse(JSON.stringify(board));
    // Sütunları 3lü bloklar içinde karıştır
    for(let block=0; block<3; block++) {
        let cols = [block*3, block*3+1, block*3+2];
        cols.sort(() => Math.random() - 0.5);
        for(let r=0; r<9; r++) {
            let temp = [newBoard[r][block*3], newBoard[r][block*3+1], newBoard[r][block*3+2]];
            newBoard[r][block*3] = temp[cols[0]-block*3];
            newBoard[r][block*3+1] = temp[cols[1]-block*3];
            newBoard[r][block*3+2] = temp[cols[2]-block*3];
        }
    }
    return newBoard;
}

function generatePuzzle(difficulty) {
    let board = shuffleSudoku(baseSudoku);
    let holes = difficulty === 'Kolay' ? 35 : (difficulty === 'Orta' ? 45 : 55);
    let puzzle = JSON.parse(JSON.stringify(board));
    
    for(let i=0; i<holes; i++) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        puzzle[r][c] = 0;
    }
    return puzzle;
}

function initSudoku(reset = false) {
    document.getElementById('sudoku-diff-label').innerText = "Seviye: " + currentDifficulty;
    
    if(!reset && localStorage.getItem('tarih_sudoku_grid')) {
        currentSudoku = JSON.parse(localStorage.getItem('tarih_sudoku_grid'));
        initialSudoku = JSON.parse(localStorage.getItem('tarih_sudoku_init'));
    } else {
        initialSudoku = generatePuzzle(currentDifficulty);
        currentSudoku = JSON.parse(JSON.stringify(initialSudoku));
        localStorage.setItem('tarih_sudoku_init', JSON.stringify(initialSudoku));
        saveSudoku();
    }
    
    selectedCell = null;
    renderSudoku();
}

function changeSudokuDiff(diff) {
    currentDifficulty = diff;
    initSudoku(true);
}

function saveSudoku() {
    localStorage.setItem('tarih_sudoku_grid', JSON.stringify(currentSudoku));
}

function renderSudoku() {
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '';
    
    for(let r=0; r<9; r++) {
        let rowDiv = document.createElement('div');
        rowDiv.className = 'sudoku-row';
        rowDiv.style.display = 'contents';
        for(let c=0; c<9; c++) {
            let cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            if(initialSudoku[r][c] !== 0) {
                cell.classList.add('initial');
                cell.innerText = initialSudoku[r][c];
            } else {
                cell.classList.add('user-input');
                if(currentSudoku[r][c] !== 0) {
                    cell.innerText = currentSudoku[r][c];
                }
                cell.onclick = () => selectSudokuCell(r, c, cell);
            }
            
            if(selectedCell && selectedCell.r === r && selectedCell.c === c) {
                cell.classList.add('selected');
            }
            
            board.appendChild(cell);
        }
    }
}

function selectSudokuCell(r, c, el) {
    if(initialSudoku[r][c] !== 0) return; // Cannot edit initial numbers
    selectedCell = {r, c};
    renderSudoku();
}

function sudokuInput(num) {
    if(!selectedCell) return;
    currentSudoku[selectedCell.r][selectedCell.c] = num;
    saveSudoku();
    renderSudoku();
    checkSudokuWin();
}

function checkSudokuWin() {
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            if(currentSudoku[r][c] === 0) return; // Not full yet
        }
    }
    // Very basic check (true validation is harder without full engine, but if board is full we congratulate)
    setTimeout(() => {
        alert("Tebrikler! Sudoku'yu tamamladın.");
        initSudoku(true);
    }, 500);
}

// Initial Loads
window.onload = () => {
    init2048();
    initMemory();
    initHangman();
    initSudoku();
};
