// WebSocketの接続先（Apacheの設定に合わせる）

const socket = new WebSocket(CONFIG.BASE_URL);

const BOARD_SIZE = 8;


const menuArea = document.getElementById('menu-area');
const gameArea = document.getElementById('game-area');
const roomIdSpan = document.getElementById('display-room-id');
const board = document.getElementById('board');

const passbtn = document.getElementById("pass");

const finishbtn = document.getElementById('finish');

const pfBtn = document.getElementById('pf-btm');

let boardData = [];
let myColor = ""
let room_id = ""
let myTurn = 0
let currentTurn = 0

let isFinish = false

// サーバーからメッセージが届いた時
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("受信:", data);

    if (data.type === "room_created") {
        // 部屋が作られたらIDを表示して画面を切り替える
        roomIdSpan.textContent = data.room_id;
        menuArea.classList.remove('flex');
        menuArea.classList.add('hidden');
        gameArea.classList.remove('hidden');
    }    
    else if(data.type === "initGame") {
        console.log("繋がった")       
        menuArea.classList.add('hidden');
        gameArea.classList.add('hidden');
        pfBtn.classList.remove('hidden');
        for(let i = 0; i < BOARD_SIZE; i++) {
            for(let j = 0; j < BOARD_SIZE; j++) {
                boardData[i][j] = data.board[i][j]
            }
        }
        board.classList.remove('hidden');
        myColor = data.color
        room_id = data.id
        if(myColor == "white") {
            myTurn = -1
            console.log("あなたは白です")
            element.innerText = "あなたは白です"
        }
        else {
            myTurn = 1
            console.log("あなたは黒です")
            element.innerText = "あなたは黒です"
        }
        currentTurn = 1
        renderBoard()
    }
    else if(data.type === "update") {
        for(let i = 0; i < BOARD_SIZE; i++) {
            for(let j = 0; j < BOARD_SIZE; j++) {
                boardData[i][j] = data.board[i][j]
            }
        }
        currentTurn = data.turn
        console.log(currentTurn)
        if(currentTurn == myTurn) {
            element.innerText = "あなたの番です"
        }
        else {
            element.innerText = "相手の番です"
        }
        renderBoard()
    }else if(data.type == "finish") {
        if(data.winner == myTurn) {
            element.innerText = "あなたの勝ちです"
        }
        else if(data.winner == myTurn*-1) {
            element.innerText = "あなたの負けです"
        }
        else {
            element.innerText = "引き分けです"
        }
    }
};

// 「部屋を作る」ボタンを押した時
document.getElementById('create-btn').onclick = () => {
    const message = { type: "create" };
    socket.send(JSON.stringify(message));
};

// 「部屋に入る」ボタンを押した時
document.getElementById('join-btn').onclick = () => {
    const id = document.getElementById('room-id-input').value;
    const message = { type: "join", room_id: id };
    socket.send(JSON.stringify(message));
};



function init() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        boardData[i] = Array(BOARD_SIZE).fill(0);
    }
    board.classList.add('hidden');
    pfBtn.classList.add('hidden');

    passbtn.onclick = () => onPassClick();
    finishbtn.onclick = () => onFinishClick();
}

function onFinishClick() {
    console.log("終了を送信します")
    const message = { type: "finish", id: room_id};
    socket.send(JSON.stringify(message));
}

function onPassClick() {
    const message = { type: "pass", id: room_id, turn: myTurn};
    socket.send(JSON.stringify(message));
}

// 盤面の描画
function renderBoard() {
    board.innerHTML = ""; // 一度クリア
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.onclick = () => onCellClick(x, y);

            //オセロの石 = disc
            const disc = document.createElement("div");
            disc.classList.add("disc");

            if (boardData[y][x] === 1) disc.classList.add("black");
            if (boardData[y][x] === -1) disc.classList.add("white");
        
            cell.appendChild(disc);
            board.appendChild(cell);
        }
    }
}

function onCellClick(x, y) {
    console.log(x,y)
    if(currentTurn != myTurn && !isFinish) {
        return
    }
    const message = { type: "move",id: room_id, x: x, y: y, turn: myTurn};
    socket.send(JSON.stringify(message));
}


// HTMLに <div id="output"></div> があると想定
const element = document.getElementById("output");
element.innerText = "これは画面に表示される文章です。";


init()