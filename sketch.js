let state = 'start'; // states: 'start', 'game', 'success'
let img, puz;
let pieces = [];
let board = [];
let pieceSize;
let draggingPiece = null;
let offsetX, offsetY;
let nextPageURL = 'https://xiaotian0722.github.io/Balloon/';
let startButton, nextButton, cueButton;
let showCue = false;

function preload() {
  img = loadImage('pic/bg.webp');
  puz = loadImage('pic/puzzle2.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  adjustPieces(); // Adjust pieces to fit the new canvas size

  startButton = createButton('Start');
  startButton.position(width / 2 - 50, height / 2 + 100);
  startButton.size(100, 50);
  startButton.mousePressed(startGame);

  nextButton = createButton('🎈');
  nextButton.position(width / 2 - 50, pieceSize * 4 + 100);
  nextButton.size(100, 50);
  nextButton.mousePressed(goToNextPage);
  nextButton.hide(); // Initially hide the next button

  cueButton = createButton('Cue');
  cueButton.position(width - 100, 50);
  cueButton.size(50, 25);
  cueButton.mousePressed(toggleCue);
  cueButton.hide(); // Initially hide the cue button
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  adjustPieces(); // Adjust pieces to fit the new canvas size
  startButton.position(width / 2 - 50, height / 2 + 100);
  nextButton.position(width / 2 - 50, height - 75);
  cueButton.position(width - 100, 50);
}

function adjustPieces() {
  pieceSize = min(width / 8, height / 8); // adjust the scale of every piece

  pieces = [];
  board = [];
  for (let i = 0; i < 16; i++) {
    pieces.push(new Piece(i % 4, Math.floor(i / 4)));
    board.push(null);
  }
}

function startGame() {
  state = 'game';
  startButton.hide();
  cueButton.show();
}

function goToNextPage() {
  window.location.href = nextPageURL;
}

function toggleCue() {
  showCue = !showCue;
}

function draw() {
  background(255);
  if (state === 'start') {
    image(img, 25, height / 2, 150, 300);
    textSize(24);
    fill(0);
    textAlign(CENTER, CENTER);
    text('This is the last one you need to get!', width / 2, height / 2 - 50);
    text('Drag the pieces and release with mouse.', width / 2, height / 2 + 25);
  } else if (state === 'game') {
    if (showCue) {
      image(puz, width / 2 - pieceSize * 2, height / 2 - pieceSize * 2, pieceSize * 4, pieceSize * 4);
    }
    drawBoard();
    drawPieces();
  } else if (state === 'success') {
    image(puz, width / 2 - pieceSize * 2, 0, pieceSize * 4, pieceSize * 4);
    textSize(24);
    fill(0);
    textAlign(CENTER, CENTER);
    text('You found all the lost pieces！', width / 2, pieceSize * 4 + 20);
    text('So many balloons? Go and check what happened.', width / 2, pieceSize * 4 + 50);
    nextButton.show(); // Show the next button
    cueButton.hide(); // Hide the cue button
  }
}

function drawBoard() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      noFill();
      stroke(0);
      rect(i * pieceSize, j * pieceSize, pieceSize, pieceSize);
    }
  }
}

function drawPieces() {
  for (let piece of pieces) {
    if (piece !== draggingPiece) {
      piece.show();
    }
  }
  if (draggingPiece) {
    draggingPiece.show(mouseX - offsetX, mouseY - offsetY);
  }
}

function mousePressed() {
  if (state === 'game') {
    for (let piece of pieces) {
      if (piece.contains(mouseX, mouseY)) {
        draggingPiece = piece;
        offsetX = mouseX - piece.x;
        offsetY = mouseY - piece.y;

        // clear current location info of the dragged piece
        let x = Math.floor(piece.x / pieceSize);
        let y = Math.floor(piece.y / pieceSize);
        let index = x + y * 4;
        if (x >= 0 && x < 4 && y >= 0 && y < 4 && board[index] === piece) {
          board[index] = null;
        }

        break;
      }
    }
  }
}

function mouseReleased() {
  if (draggingPiece) {
    let x = Math.floor(mouseX / pieceSize);
    let y = Math.floor(mouseY / pieceSize);
    let index = x + y * 4;

    if (x >= 0 && x < 4 && y >= 0 && y < 4 && !board[index]) {
      draggingPiece.snap(x, y);
      board[index] = draggingPiece;
    } else {
      draggingPiece.reset();
    }

    draggingPiece = null;

    if (checkSuccess()) {
      state = 'success';
    }
  }
}

function checkSuccess() {
  for (let i = 0; i < 16; i++) {
    if (!board[i] || board[i].index !== i) {
      return false;
    }
  }
  return true;
}

class Piece {
  constructor(i, j) {
    this.correctX = i * pieceSize;
    this.correctY = j * pieceSize;
    this.index = i + j * 4;
    this.reset();
  }

  contains(px, py) {
    return px > this.x && px < this.x + pieceSize && py > this.y && py < this.y + pieceSize;
  }

  show(nx = this.x, ny = this.y) {
    image(puz, nx, ny, pieceSize, pieceSize, this.correctX, this.correctY, pieceSize, pieceSize);
    this.x = nx;
    this.y = ny;
  }

  snap(i, j) {
    this.x = i * pieceSize;
    this.y = j * pieceSize;
  }

  reset() {
    this.x = random(width / 2, width - pieceSize);
    this.y = random(0, height - pieceSize);
  }
}
