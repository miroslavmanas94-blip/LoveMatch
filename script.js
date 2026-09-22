// STAV APLIKACE
let currentUser = null;
let selectedAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=Love1";
let mainTimerInterval = null;

// GLO BÁLNÍ EXPOZICE FUNKCÍ PRO VITE ES MODULES
window.switchAuthMode = function(mode) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    if (mode === 'login') {
        document.getElementById('tab-btn-login').classList.add('active');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    } else {
        document.getElementById('tab-btn-register').classList.add('active');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
    }
};

window.pickAvatar = function(el) {
    document.querySelectorAll('.avatar-opt').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
    selectedAvatar = el.src;
};

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    const activeNavBtn = document.getElementById(`tab-nav-${tabName}`);
    if (activeNavBtn) activeNavBtn.classList.add('active');
    
    const contentEl = document.getElementById(`tab-content-${tabName}`);
    if (contentEl) contentEl.classList.remove('hidden');
};

window.pairPartner = function() {
    const code = document.getElementById('partner-code-input').value.trim().toUpperCase();
    const users = JSON.parse(localStorage.getItem('LM_USERS_DB')) || {};

    const partnerKey = Object.keys(users).find(k => users[k].pairCode === code);

    if (partnerKey && partnerKey !== currentUser.email) {
        currentUser.partnerEmail = partnerKey;
        currentUser.startDate = users[partnerKey].startDate;
        users[partnerKey].partnerEmail = currentUser.email;

        users[currentUser.email] = currentUser;
        localStorage.setItem('LM_USERS_DB', JSON.stringify(users));
        localStorage.setItem('LM_CURRENT_USER', JSON.stringify(currentUser));

        alert("Úspěšně propojeno s partnerem!");
        renderDashboard();
    } else {
        alert("Neplatný kód nebo zadáváte svůj vlastní kód!");
    }
};

window.showAddMeetupModal = function() {
    let html = `
        <h2>📅 Naplánovat Rande</h2>
        <div class="input-group" style="margin-top:15px;">
            <label>Název akce</label>
            <input type="text" id="meet-title" placeholder="např. Večeře, Kino...">
        </div>
        <div class="input-group">
            <label>Místo</label>
            <input type="text" id="meet-loc" placeholder="např. Centrum">
        </div>
        <div class="input-group">
            <label>Datum a Čas</label>
            <input type="datetime-local" id="meet-time">
        </div>
        <button type="button" class="btn btn-primary btn-full" onclick="saveMeetup()">Uložit do Plánovače</button>
    `;
    openModal(html);
};

window.saveMeetup = function() {
    const title = document.getElementById('meet-title').value;
    const loc = document.getElementById('meet-loc').value;
    const time = document.getElementById('meet-time').value;

    if (!title || !time) return alert("Vyplňte název a čas!");

    const meetups = JSON.parse(localStorage.getItem('LM_MEETUPS')) || [];
    meetups.push({ id: Date.now(), title, loc, time, user: currentUser.email });
    localStorage.setItem('LM_MEETUPS', JSON.stringify(meetups));

    closeModal();
    renderMeetups();
};

window.loadSharedVideo = function() {
    const input = document.getElementById('video-url-input').value.trim();
    const iframe = document.getElementById('shared-iframe');

    if (input.includes('youtube.com') || input.includes('youtu.be')) {
        let videoId = input.split('v=')[1] || input.split('/').pop();
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (input) {
        iframe.src = input;
    }
};

window.sendChatMessage = function() {
    const input = document.getElementById('chat-msg-input');
    const msg = input.value.trim();
    if (!msg) return;

    const chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML += `<div><strong>${currentUser.email.split('@')[0]}:</strong> ${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = '';
};

window.logout = function() {
    localStorage.removeItem('LM_CURRENT_USER');
    location.reload();
};

window.closeModal = closeModal;
window.openGame = openGame;

// NAČTENÍ PO SPUŠTĚNÍ
window.addEventListener('DOMContentLoaded', () => {
    // Připojení event listenerů pro formuláře
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.toLowerCase().trim();
            const pass = document.getElementById('login-password').value;

            const users = JSON.parse(localStorage.getItem('LM_USERS_DB')) || {};
            if (users[email] && users[email].password === pass) {
                currentUser = users[email];
                localStorage.setItem('LM_CURRENT_USER', JSON.stringify(currentUser));
                renderDashboard();
            } else {
                alert("Nesprávný e-mail nebo heslo!");
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value.toLowerCase().trim();
            const pass = document.getElementById('reg-password').value;
            const startDate = document.getElementById('reg-start-date').value || new Date().toISOString().split('T')[0];
            const firstPlace = document.getElementById('reg-first-place').value || "Nezadáno";
            const nickname = document.getElementById('reg-nickname').value || "Miláček";

            const pairCode = "LOVE-" + Math.random().toString(36).substring(2, 6).toUpperCase();

            const users = JSON.parse(localStorage.getItem('LM_USERS_DB')) || {};
            if (users[email]) {
                alert("E-mail již existuje!");
                return;
            }

            const newUser = {
                email,
                password: pass,
                pairCode,
                partnerEmail: null,
                startDate,
                firstPlace,
                nickname,
                avatar: selectedAvatar
            };

            users[email] = newUser;
            localStorage.setItem('LM_USERS_DB', JSON.stringify(users));

            currentUser = newUser;
            localStorage.setItem('LM_CURRENT_USER', JSON.stringify(currentUser));
            renderDashboard();
        });
    }

    const savedUser = localStorage.getItem('LM_CURRENT_USER');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        renderDashboard();
    }
});

// DASHBOARD RENDER
function renderDashboard() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');

    document.getElementById('dash-avatar-img').src = currentUser.avatar;
    document.getElementById('dash-user-name').innerText = `Ahoj, ${currentUser.email.split('@')[0]}!`;
    document.getElementById('dash-first-place').innerText = currentUser.firstPlace;
    document.getElementById('dash-nickname').innerText = currentUser.nickname;

    const badge = document.getElementById('dash-pair-badge');
    const banner = document.getElementById('pairing-banner');

    if (currentUser.partnerEmail) {
        badge.className = "badge badge-success";
        badge.innerText = `❤️ Spárováno s ${currentUser.partnerEmail}`;
        banner.classList.add('hidden');
    } else {
        badge.className = "badge badge-warning";
        badge.innerText = "Nespárováno";
        banner.classList.remove('hidden');
        document.getElementById('my-pair-code-text').innerText = currentUser.pairCode;
    }

    startTimers();
    renderMeetups();
}

// ODPOČET ČASU
function startTimers() {
    if (mainTimerInterval) clearInterval(mainTimerInterval);

    const start = new Date(currentUser.startDate).getTime();

    mainTimerInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - start;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = n => String(n).padStart(2, '0');
        document.getElementById('timer-together').innerText = `${days} dní, ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }, 1000);
}

function renderMeetups() {
    const meetups = JSON.parse(localStorage.getItem('LM_MEETUPS')) || [];
    const list = document.getElementById('meetups-list');

    if (meetups.length === 0) {
        list.innerHTML = `<p class="empty-text">Zatím nebylo naplánováno žádné rande.</p>`;
        return;
    }

    list.innerHTML = meetups.map(m => `
        <div class="glass-card" style="margin-bottom:10px; background:white;">
            <h4>❤️ ${m.title}</h4>
            <p style="font-size:0.85rem; color:#64748b;">📍 ${m.loc || 'Nezadáno'} | ⏰ ${new Date(m.time).toLocaleString()}</p>
        </div>
    `).join('');
}

// --- HER NÍ LOGIKA ---
function openGame(gameType) {
    if (gameType === 'chess') startChess();
    else if (gameType === 'puzzle') startPuzzle();
    else if (gameType === 'pexeso') startPexeso();
    else if (gameType === 'ttt') startTTT();
    else if (gameType === 'rps') startRPS();
}

// 1. ŠACHY
let chessBoardState = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']
];
let chessSelectedSq = null;

function startChess() {
    let html = `
        <h2 style="text-align:center;">♟️ Šachy pro Dva</h2>
        <div class="chess-board" id="chess-board"></div>
        <button type="button" class="btn btn-secondary btn-full" onclick="window.resetChess()">Restartovat Šachy</button>
    `;
    openModal(html);
    renderChessBoard();
}

window.resetChess = function() {
    chessBoardState = [
        ['♜','♞','♝','♛','♚','♝','♞','♜'],
        ['♟','♟','♟','♟','♟','♟','♟','♟'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['♙','♙','♙','♙','♙','♙','♙','♙'],
        ['♖','♘','♗','♕','♔','♗','♘','♖']
    ];
    chessSelectedSq = null;
    renderChessBoard();
};

function renderChessBoard() {
    const boardEl = document.getElementById('chess-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement('div');
            const isWhite = (r + c) % 2 === 0;
            sq.className = `chess-sq ${isWhite ? 'white' : 'black'}`;
            if (chessSelectedSq && chessSelectedSq.r === r && chessSelectedSq.c === c) {
                sq.classList.add('selected');
            }
            sq.innerText = chessBoardState[r][c];
            sq.onclick = () => handleChessClick(r, c);
            boardEl.appendChild(sq);
        }
    }
}

function handleChessClick(r, c) {
    if (chessSelectedSq) {
        chessBoardState[r][c] = chessBoardState[chessSelectedSq.r][chessSelectedSq.c];
        chessBoardState[chessSelectedSq.r][chessSelectedSq.c] = '';
        chessSelectedSq = null;
    } else if (chessBoardState[r][c] !== '') {
        chessSelectedSq = { r, c };
    }
    renderChessBoard();
}

// 2. PUZZLE
let puzzleTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let firstPuzzlePick = null;

function startPuzzle() {
    puzzleTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    firstPuzzlePick = null;
    let html = `
        <h2 style="text-align:center;">🧩 Obrázkové Puzzle</h2>
        <p style="text-align:center; font-size:0.8rem; color:#64748b;">Klikněte na postupně dvě dlaždice pro jejich prohození!</p>
        <div class="puzzle-board" id="puzzle-board"></div>
    `;
    openModal(html);
    renderPuzzle();
}

function renderPuzzle() {
    const board = document.getElementById('puzzle-board');
    if (!board) return;
    board.innerHTML = '';

    puzzleTiles.forEach((tileIdx, currentPos) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        const imgUrl = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400";
        tile.style.backgroundImage = `url(${imgUrl})`;
        const row = Math.floor(tileIdx / 3);
        const col = tileIdx % 3;
        tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

        tile.onclick = () => {
            if (firstPuzzlePick === null) {
                firstPuzzlePick = currentPos;
                tile.style.border = "2px solid #ff3b69";
            } else {
                let temp = puzzleTiles[firstPuzzlePick];
                puzzleTiles[firstPuzzlePick] = puzzleTiles[currentPos];
                puzzleTiles[currentPos] = temp;
                firstPuzzlePick = null;
                renderPuzzle();
            }
        };
        board.appendChild(tile);
    });
}

// 3. PEXESO
function startPexeso() {
    const icons = ['❤️', '💖', '🎁', '🌹', '🎬', '☕'];
    let deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    let flipped = [];

    let html = `
        <h2 style="text-align:center;">🎴 Pexeso pro Dva</h2>
        <div class="pexeso-board" id="pexeso-board"></div>
    `;
    openModal(html);

    const board = document.getElementById('pexeso-board');
    deck.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = 'pexeso-card';
        card.innerText = '❓';
        card.onclick = () => {
            if (flipped.length < 2 && !card.classList.contains('flipped')) {
                card.classList.add('flipped');
                card.innerText = icon;
                flipped.push({ card, icon });

                if (flipped.length === 2) {
                    if (flipped[0].icon === flipped[1].icon) {
                        flipped = [];
                    } else {
                        setTimeout(() => {
                            flipped.forEach(f => {
                                f.card.classList.remove('flipped');
                                f.card.innerText = '❓';
                            });
                            flipped = [];
                        }, 1000);
                    }
                }
            }
        };
        board.appendChild(card);
    });
}

// 4. PIŠKVORKY
function startTTT() {
    let boardState = Array(9).fill('');
    let turn = '❤️';

    let html = `
        <h2 style="text-align:center;">❌⭕ Piškvorky</h2>
        <div class="chess-board" style="grid-template-columns: repeat(3, 1fr); aspect-ratio:1; gap:6px; background:none; border:none;" id="ttt-board"></div>
    `;
    openModal(html);

    const board = document.getElementById('ttt-board');
    const render = () => {
        board.innerHTML = '';
        boardState.forEach((val, i) => {
            const cell = document.createElement('div');
            cell.className = 'chess-sq white';
            cell.style.borderRadius = '12px';
            cell.innerText = val;
            cell.onclick = () => {
                if (val === '') {
                    boardState[i] = turn;
                    turn = turn === '❤️' ? '⭕' : '❤️';
                    render();
                }
            };
            board.appendChild(cell);
        });
    };
    render();
}

// 5. KÁMEN NŮŽKY PAPÍR
function startRPS() {
    let html = `
        <h2 style="text-align:center;">✌️ Kámen, Nůžky, Papír</h2>
        <div style="display:flex; justify-content:space-around; font-size:3rem; margin:25px 0; cursor:pointer;">
            <span onclick="window.playRPS('🪨')">🪨</span>
            <span onclick="window.playRPS('✂️')">✂️</span>
            <span onclick="window.playRPS('📄')">📄</span>
        </div>
        <div id="rps-result" style="text-align:center; font-weight:bold;"></div>
    `;
    openModal(html);
}

window.playRPS = function(choice) {
    const opts = ['🪨', '✂️', '📄'];
    const opp = opts[Math.floor(Math.random() * opts.length)];
    let res = "Remíza! 🤝";
    if ((choice === '🪨' && opp === '✂️') || (choice === '✂️' && opp === '📄') || (choice === '📄' && opp === '🪨')) {
        res = "Vyhrál/a jsi! 🎉";
    } else if (choice !== opp) {
        res = "Partner / Soupeř vyhrál! 😅";
    }
    document.getElementById('rps-result').innerHTML = `Vy: ${choice} vs Soupeř: ${opp}<br><br><span style="color:#ff3b69; font-size:1.2rem;">${res}</span>`;
};

// MODAL UTILS
function openModal(htmlContent) {
    document.getElementById('modal-content').innerHTML = htmlContent;
    document.getElementById('game-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('game-modal').classList.add('hidden');
}