// SET UP CANVAS & GLOBAL VARIABLES
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

// Game states
let gameState = "menu";
let gameMode = "single"; // "single" for AI, "two" for PvP

// AUDIO SETTINGS
const bgMusic = new Audio("bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

const sounds = {
  punch: new Audio("punch.mp3"),
  special: new Audio("special.mp3"),
};

// CHARACTER OPTIONS
const characters = [
  {
    name: "Flare",
    color: "red",
    stamina: 90,
    health: 90,
    speed: 6,
    attack: "high",
    jump: "medium",
    special: "Fire Dash",
  },
  {
    name: "Vortex",
    color: "blue",
    stamina: 100,
    health: 100,
    speed: 8,
    attack: "medium",
    jump: "high",
    special: "Teleportation",
  },
  {
    name: "Titan",
    color: "brown",
    stamina: 90,
    health: 150,
    speed: 3,
    attack: "high",
    jump: "low",
    special: "Ground Slam",
  },
  {
    name: "Volt",
    color: "yellow",
    stamina: 100,
    health: 110,
    speed: 5,
    attack: "high",
    jump: "medium",
    special: "Lightning Strike",
  },
  {
    name: "Frost",
    color: "lightblue",
    stamina: 100,
    health: 115,
    speed: 5,
    attack: "low",
    jump: "high",
    special: "Frozen Trap",
  },
  {
    name: "Shade",
    color: "purple",
    stamina: 110,
    health: 90,
    speed: 10,
    attack: "low",
    jump: "medium",
    special: "Shadow Clone",
  },
  {
    name: "Blaze",
    color: "orange",
    stamina: 90,
    health: 100,
    speed: 6,
    attack: "high",
    jump: "low",
    special: "Lava Burst",
  },
  {
    name: "Mystic",
    color: "white",
    stamina: 120,
    health: 100,
    speed: 4,
    attack: "low",
    jump: "medium",
    special: "Healing Aura",
  },
];

// Selected Characters
let selectedCharP1 = null;
let selectedCharP2 = null;

// PLAYER OBJECTS
let player1, player2;

// INPUT HANDLING
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// CHARACTER SELECTION
canvas.addEventListener("click", (e) => {
  if (gameState !== "characterSelect") return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const charWidth = 150,
    charHeight = 80;

  characters.forEach((char, index) => {
    const col = index % 4,
      row = Math.floor(index / 4);
    const x = (canvas.width - 4 * charWidth) / 2 + col * (charWidth + 10);
    const y = 100 + row * (charHeight + 10);

    if (
      mouseX >= x &&
      mouseX <= x + charWidth &&
      mouseY >= y &&
      mouseY <= y + charHeight
    ) {
      if (!selectedCharP1) {
        selectedCharP1 = char;
      } else if (gameMode === "two" && !selectedCharP2) {
        selectedCharP2 = char;
      }
    }
  });

  if (selectedCharP1 && (gameMode === "single" || selectedCharP2)) {
    selectedCharP2 =
      selectedCharP2 ||
      characters[Math.floor(Math.random() * characters.length)];
    startGame();
  }
});

// START GAME FUNCTION
function startGame() {
  player1 = createPlayer(50, selectedCharP1);
  player2 = createPlayer(700, selectedCharP2);
  bgMusic.play();
  gameState = "playing";
}

function createPlayer(x, char) {
  return {
    x,
    y: 250,
    width: 50,
    height: 100,
    ...char,
    velocityY: 0,
    isJumping: false,
    isAttacking: false,
    facingLeft: false,
    stamina: char.stamina,
  };
}

// UPDATE GAME FUNCTION
function updateGame() {
  if (gameState !== "playing") return;

  updatePlayer(player1, keys.a, keys.d, keys.w);
  if (gameMode === "two")
    updatePlayer(player2, keys.ArrowLeft, keys.ArrowRight, keys.ArrowUp);
  else updateAI();
}

function updatePlayer(player, left, right, jump) {
  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;
  if (jump && !player.isJumping) {
    player.velocityY = -12;
    player.isJumping = true;
  }
  player.y += player.velocityY;
  if (player.y >= 250) {
    player.y = 250;
    player.isJumping = false;
  } else {
    player.velocityY += 0.5;
  }
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
}

function updateAI() {
  if (player2.x > player1.x + player1.width) player2.x -= player2.speed;
  else if (player2.x < player1.x - player2.width) player2.x += player2.speed;
}

// RENDER FUNCTION
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer(player1);
  drawPlayer(player2);
}

function drawPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// MAIN LOOP
function loop() {
  if (gameState === "menu") drawMenu();
  else if (gameState === "characterSelect") drawCharacterSelect();
  else if (gameState === "playing") {
    updateGame();
    drawGame();
  }
  requestAnimationFrame(loop);
}
loop();
