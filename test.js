// SET UP CANVAS & GLOBAL VARIABLES
// ==============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

// Game states: "menu", "characterSelect", "playing", "gameOver"
let gameState = "menu";
// Game mode: "single" for AI opponent; "two" for two-player.
let gameMode = "single";

// AUDIO (Not Finished)
const bgMusic = new Audio(
  "pixel-fight-8-bit-arcade-music-background-music-for-video-208775.mp3"
);
bgMusic.loop = true;
bgMusic.volume = 0.3;

const punchSound = new Audio("punch.mp3");
const specialSound = new Audio("special.mp3");

// CHARACTER OPTIONS
// -------------------------------
const characters = [
  {
    name: "Flare",
    color: "red",
    attackingColor: "red",
    specialAttackingColor: "orange",
    stamina: 90,
    health: 90,
    redBar: 90,
    speed: 6,
    attack: "high",
    jump: "medium",
    special: "Fire Dash",
  },
  {
    name: "Vortex",
    color: "blue",
    attackingColor: "blue",
    specialAttackingColor: "DeepSkyBlue",
    stamina: 100,
    health: 100,
    redBar: 100,
    speed: 8,
    attack: "medium",
    jump: "high",
    special: "Teleportation",
  },
  {
    name: "Titan",
    color: "brown",
    health: 150,
    redBar: 100,
    speed: 3,
    attackingColor: "brown",
    specialAttackingColor: "DarkOliveGreen",
    stamina: 90,
    attack: "high",
    jump: "low",
    special: "Ground Slam",
  },
  {
    name: "Volt",
    color: "yellow",
    health: 110,
    redBar: 100,
    speed: 5,
    attackingColor: "yellow",
    specialAttackingColor: "Electric Blue",
    stamina: 100,
    attack: "high",
    jump: "medium",
    special: "Lightning Strike",
  },
  {
    name: "Frost",
    color: "lightblue",
    health: 115,
    redBar: 100,
    speed: 5,
    attackingColor: "lightblue",
    specialAttackingColor: "LightCyan",
    stamina: 100,
    attack: "low",
    jump: "high",
    special: "Frozen Trap",
  },
  {
    name: "Shade",
    color: "purple",
    health: 90,
    redBar: 90,
    speed: 10,
    attackingColor: "purple",
    specialAttackingColor: "DarkSlateGray",
    stamina: 110,
    attack: "low",
    jump: "medium",
    special: "Shadow Clone",
  },
  {
    name: "Blaze",
    color: "orange",
    health: 100,
    redBar: 100,
    speed: 6,
    attackingColor: "orange",
    specialAttackingColor: "DarkRed",
    stamina: 90,
    attack: "high",
    jump: "low",
    special: "Lava Burst",
  },
  {
    name: "Mystic",
    color: "white",
    health: 100,
    redBar: 100,
    speed: 4,
    attackingColor: "white",
    specialAttackingColor: "Gold",
    stamina: 120,
    attack: "low",
    jump: "medium",
    special: "Healing Aura",
  },
];

// Selected characters
let selectedCharP1 = null;
let selectedCharP2 = null;
// In single-player mode, Player 2 will be AI-controlled (using the default or a random selection).

// -------------------------------
// EFFECTS (not finished)
// -------------------------------
let effects = [];

// -------------------------------
// PLAYER OBJECTS (will be created when the game starts)
// -------------------------------
let player1, player2;

// -------------------------------
// KEY & MOUSE INPUT STATE
// -------------------------------
const keys = {
  a: false,
  d: false,
  w: false, // jump for P1
  // For player2 in two-player mode:
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false, // jump for P2
};

// Attacking damage / reading keys event
window.addEventListener("keydown", (e) => {
  // In "playing" state, only process movement keys if not in a menu.
  if (gameState === "playing") {
    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = true;
    }
    const currentTime = Date.now();
    // --- Player 1 Normal Attack (Space) with combo logic ---
    if (
      e.key === " " &&
      currentTime - player1.lastNormalAttackTime > player1.attackCooldown
    ) {
      // Check for combo (if within 400ms, add multiplier)
      if (currentTime - player1.lastNormalAttackTime < 400) {
        player1.comboCount++;
      } else {
        player1.comboCount = 1;
      }
      player1.lastNormalAttackTime = currentTime;
      // Only allow attack if enough stamina:
      if (player1.stamina >= 10) {
        player1.isAttacking = true;
        player1.stamina -= 10;
        punchSound.play();
        setTimeout(() => {
          player1.isAttacking = false;
          // Reset combo count after attack resolves:
          player1.comboCount = 0;
        }, 100);
      }
    }

    // --- Player 2 Normal Attack (slash) for two-player mode ---
    if (
      gameMode === "two" &&
      e.key === "/" &&
      currentTime - player2.lastNormalAttackTime > player2.attackCooldown
    ) {
      if (currentTime - player2.lastNormalAttackTime < 400) {
        player2.comboCount++;
      } else {
        player2.comboCount = 1;
      }
      player2.lastNormalAttackTime = currentTime;
      if (player2.stamina >= 10) {
        player2.isAttacking = true;
        player2.stamina -= 10;
        punchSound.play();
        setTimeout(() => {
          player2.isAttacking = false;
          player2.comboCount = 0;
        }, 100);
      }
    }

    // --- Player 1 Special Attack ('c') ---
    if (
      e.key === "c" &&
      currentTime - player1.lastSpecialAttackTime > player1.spAttackCooldown
    ) {
      if (player1.stamina >= 20) {
        player1.isSpecialAttacking = true;
        player1.stamina -= 20;
        specialSound.play();
        // Spawn a special effect at opponent's location
        effects.push({
          x: player2.x + player2.width / 2,
          y: player2.y + player2.height / 2,
          radius: 10,
          alpha: 1,
          decay: 0.05,
          color: "purple",
        });
        player1.lastSpecialAttackTime = currentTime;
        setTimeout(() => (player1.isSpecialAttacking = false), 100);
      }
    }

    // --- Player 2 Special Attack (Enter) for two-player mode ---
    if (
      gameMode === "two" &&
      e.key === "Enter" &&
      currentTime - player2.lastSpecialAttackTime > player2.spAttackCooldown
    ) {
      if (player2.stamina >= 20) {
        player2.isSpecialAttacking = true;
        player2.stamina -= 20;
        specialSound.play();
        effects.push({
          x: player1.x + player1.width / 2,
          y: player1.y + player1.height / 2,
          radius: 10,
          alpha: 1,
          decay: 0.05,
          color: "green",
        });
        player2.lastSpecialAttackTime = currentTime;
        setTimeout(() => (player2.isSpecialAttacking = false), 100);
      }
    }
  } else if (gameState === "menu") {
    // --- Main Menu Controls ---
    // Press 1 for Single Player, 2 for Two Player.
    if (e.key === "1") {
      gameMode = "single";
    }
    if (e.key === "2") {
      gameMode = "two";
    }
    // Press Enter to go to Character Selection.
    if (e.key === "Enter") {
      gameState = "characterSelect";
    }
  } else if (gameState === "gameOver") {
    // Press Enter to return to the main menu.
    if (e.key === "Enter") {
      gameState = "menu";
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// Character Selection code
canvas.addEventListener("click", (e) => {
  if (gameState === "characterSelect") {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const boxWidth = 150;
    const boxHeight = 80;
    const startX = (canvas.width - 4 * boxWidth) / 2;
    const startY = 100;

    for (let i = 0; i < characters.length; i++) {
      let row = Math.floor(i / 4);
      let col = i % 4;
      let boxX = startX + col * (boxWidth + 10);
      let boxY = startY + row * (boxHeight + 10);

      if (
        mouseX >= boxX &&
        mouseX <= boxX + boxWidth &&
        mouseY >= boxY &&
        mouseY <= boxY + boxHeight
      ) {
        if (!selectedCharP1) {
          selectedCharP1 = characters[i];
        } else if (gameMode === "two" && !selectedCharP2) {
          selectedCharP2 = characters[i];
        }
      }
    }

    if (gameMode === "single" && selectedCharP1) {
      selectedCharP2 =
        characters[Math.floor(Math.random() * characters.length)];
      startGame();
    }
    if (gameMode === "two" && selectedCharP1 && selectedCharP2) {
      startGame();
    }
  }
});

// -------------------------------
// INITIALIZE PLAYERS (called when game starts)
// -------------------------------
function startGame() {
  // Create player objects based on selected character stats.
  player1 = {
    x: 50,
    y: 250,
    width: 50,
    height: 100,
    ...selectedCharP1,
    velocityY: 0,
    isJumping: false,
    isAttacking: false,
    isSpecialAttacking: false,
    attackCooldown: 300,
    spAttackCooldown: 500,
    lastNormalAttackTime: 0,
    lastSpecialAttackTime: 0,
    facingLeft: false,
    comboCount: 0,
    stamina: selectedCharP1.stamina,
    maxStamina: 100,
  };

  player2 = {
    x: 700,
    y: 250,
    width: 50,
    height: 100,
    ...selectedCharP2,
    velocityY: 0,
    isJumping: false,
    isAttacking: false,
    isSpecialAttacking: false,
    attackCooldown: 300,
    spAttackCooldown: 500,
    lastNormalAttackTime: 0,
    lastSpecialAttackTime: 0,
    facingLeft: false,
    comboCount: 0,
    stamina: selectedCharP2.stamina,
    maxStamina: 100,
  };

  // Reset health in case characters have been used before.
  player1.health = selectedCharP1.health;
  player2.health = selectedCharP2.health;

  // Start background music.
  bgMusic.play();

  // Switch to playing state.
  gameState = "playing";
}

// -------------------------------
// AI LOGIC (for single-player mode)
// -------------------------------
function updateAI() {
  // Only run if in single-player mode.
  if (gameMode !== "single") return;

  // Simple AI: move toward player1.
  if (player2.x > player1.x + player1.width) {
    player2.x -= player2.speed;
  } else if (player2.x < player1.x - player2.width) {
    player2.x += player2.speed;
  } else {
    // If close enough, attack.
    const currentTime = Date.now();
    if (
      currentTime - player2.lastNormalAttackTime > player2.attackCooldown &&
      player2.stamina >= 10
    ) {
      player2.isAttacking = true;
      player2.lastNormalAttackTime = currentTime;
      player2.comboCount = 1; // AI does a simple attack.
      player2.stamina -= 10;
      punchSound.play();
      setTimeout(() => {
        player2.isAttacking = false;
      }, 100);
    }
  }
  // Occasionally jump (small chance)
  if (!player2.isJumping && Math.random() < 0.005) {
    player2.velocityY = -12.5;
    player2.isJumping = true;
  }
}

// -------------------------------
// UPDATE & RENDER FUNCTIONS
// -------------------------------

function updateGame() {
  // -------- Movement for Player 1 (controlled by keys) --------
  if (keys.a) {
    player1.x -= player1.speed;
    player1.facingLeft = true;
  }
  if (keys.d) {
    player1.x += player1.speed;
    player1.facingLeft = false;
  }
  if (keys.w && !player1.isJumping) {
    if (player1.jump === "high") {
      player1.velocityY = -14;
    } else if (player1.jump === "medium") {
      player1.velocityY = -12.5;
    } else if (player1.jump === "low") {
      player1.velocityY = -11;
    }
    player1.isJumping = true;
  }

  // -------- Movement for Player 2 (only if two-player; else AI) --------
  if (gameMode === "two") {
    if (keys.ArrowLeft) {
      player2.x -= player2.speed;
      player2.facingLeft = true;
    }
    if (keys.ArrowRight) {
      player2.x += player2.speed;
      player2.facingLeft = false;
    }
    if (keys.ArrowUp && !player2.isJumping) {
      if (player2.jump === "high") {
        player2.velocityY = -14;
      } else if (player2.jump === "medium") {
        player2.velocityY = -12.5;
      } else if (player2.jump === "low") {
        player2.velocityY = -11;
      }
      player2.isJumping = true;
    }
  } else {
    updateAI();
  }

  // -------- Clamp positions within canvas --------
  player1.x = Math.max(0, Math.min(player1.x, canvas.width - player1.width));
  player2.x = Math.max(0, Math.min(player2.x, canvas.width - player2.width));

  // -------- Gravity & Jumping --------
  // For Player 1:
  player1.y += player1.velocityY;
  if (player1.y < 250) {
    player1.velocityY += 0.5;
  } else {
    player1.y = 250;
    player1.velocityY = 0;
    player1.isJumping = false;
  }
  // For Player 2:
  player2.y += player2.velocityY;
  if (player2.y < 250) {
    player2.velocityY += 0.5;
  } else {
    player2.y = 250;
    player2.velocityY = 0;
    player2.isJumping = false;
  }

  // -------- Stamina Regeneration --------
  [player1, player2].forEach((p) => {
    if (p.stamina < p.maxStamina) {
      p.stamina += 0.2;
    }
  });

  // -------- Collision Detection for Attacks --------
  // For Player 1 (normal attack)
  // Define attack range
  const attackRange = 50; // Adjust if needed

  // Function to check if a player is within attack range
  function isWithinAttackRange(attacker, defender) {
    return (
      Math.abs(attacker.x - defender.x) < attackRange || // Attack from behind
      Math.abs(attacker.x + attacker.width - defender.x) < attackRange // Attack from front
    );
  }
  function p2isWithinAttackRange(attacker, defender) {
    return (
      Math.abs(attacker.x - defender.x) < attackRange || // Attack from behind
      Math.abs(defender.x + defender.width - attacker.x) < attackRange // Attack from front
    );
  }
  // Player 1 attack logic
  if (player1.isAttacking && isWithinAttackRange(player1, player2)) {
    if (player1.attack === "high") {
      player2.health -= player1.comboCount * 1.15;
    } else if (player1.attack === "medium") {
      player2.health -= player1.comboCount;
    } else if (player1.attack === "low") {
      player2.health -= player1.comboCount * 0.9;
    }
  }

  // Player 2 (AI) attack logic
  if (player2.isAttacking && p2isWithinAttackRange(player2, player1)) {
    if (player2.attack === "high") {
      player1.health -= player2.comboCount * 1.15;
    } else if (player2.attack === "medium") {
      player1.health -= player2.comboCount;
    } else if (player2.attack === "low") {
      player1.health -= player2.comboCount * 0.9;
    }
  }

  // For special attacks: same direction check
  if (player1.isSpecialAttacking) {
    if (
      (player1.x + player1.width >= player2.x && player1.speed > 0) || // Player 1 is moving right
      (player1.x <= player2.x + player2.width && player1.speed < 0) // Player 1 is moving left
    ) {
      if (Math.abs(player1.x + player1.width - player2.x) < 50) {
        player2.health -= 1.75;
      }
    }
  }

  if (player2.isSpecialAttacking) {
    if (
      (player2.x + player2.width >= player1.x && player2.speed > 0) || // Player 2 is moving right
      (player2.x <= player1.x + player1.width && player2.speed < 0) // Player 2 is moving left
    ) {
      if (Math.abs(player2.x - (player1.x + player1.width)) < 50) {
        player1.health -= 1.75;
      }
    }
  }

  // -------- Update Special Effects --------
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].radius += 1;
    effects[i].alpha -= effects[i].decay;
    if (effects[i].alpha <= 0) {
      effects.splice(i, 1);
    }
  }

  // -------- Check for Win Condition --------
  if (player1.health <= 0 || player2.health <= 0) {
    gameState = "gameOver";
    bgMusic.pause();
  }
}

// Drawing frames
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw players:
  // Player 1:
  if (player1.isAttacking) {
    ctx.fillStyle = player1.attackingColor;
  } else if (player1.isSpecialAttacking) {
    ctx.fillStyle = player1.specialAttackingColor;
  } else {
    ctx.fillStyle = player1.color;
  }
  ctx.fillRect(player1.x, player1.y, player1.width, player1.height);

  // Player 2:
  if (player2.isAttacking) {
    ctx.fillStyle = player2.attackingColor;
  } else if (player2.isSpecialAttacking) {
    ctx.fillStyle = player2.specialAttackingColor;
  } else {
    ctx.fillStyle = player2.color;
  }
  ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

  // Draw Health Bars:
  if (player1.redBar < 100) {
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, player1.redBar * 2, 10);
  } else if (player1.redBar >= 100) {
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 200, 10);
  }
  if (player2.redBar < 100) {
    ctx.fillStyle = "red";
    ctx.fillRect(580, 20, player2.redBar * 2, 10);
  } else if (player2.redBar >= 100) {
    ctx.fillStyle = "red";
    ctx.fillRect(580, 20, 200, 10);
  }

  if (player1.health > 100) {
    ctx.fillStyle = "green";
    ctx.fillRect(20, 20, (player1.health - (player1.health - 100)) * 2, 10);
    ctx.fillStyle = "blue";
    ctx.fillRect(20, 20, (player1.health - 100) * 2, 10);
  } else if (player1.health <= 100 && player1.health >= 0) {
    ctx.fillStyle = "green";
    ctx.fillRect(20, 20, player1.health * 2, 10);
  }
  if (player2.health > 100) {
    ctx.fillStyle = "green";
    ctx.fillRect(580, 20, (player2.health - (player2.health - 100)) * 2, 10);
    ctx.fillStyle = "blue";
    ctx.fillRect(580, 20, (player2.health - 100) * 2, 10);
  } else if (player2.health <= 100 && player2.health >= 0) {
    ctx.fillStyle = "green";
    ctx.fillRect(580, 20, player2.health * 2, 10);
  }

  // Draw Stamina Bars below Health Bars:
  ctx.fillStyle = "darkred";
  ctx.fillRect(20, 35, 200, 10);
  ctx.fillRect(580, 35, 200, 10);

  ctx.fillStyle = "gold";
  ctx.fillRect(20, 35, (player1.stamina / player1.maxStamina) * 200, 10);
  ctx.fillRect(580, 35, (player2.stamina / player2.maxStamina) * 200, 10);

  // Draw instructions for special attacks.
  ctx.fillStyle = "white";
  ctx.font = "15px Arial";
  ctx.fillText("C for Special Attack", 20, 60);
  if (gameMode === "two") {
    ctx.fillText("Enter for Special Attack", 580, 60);
  }

  // Draw Special Effects:
  effects.forEach((eff) => {
    ctx.save();
    ctx.globalAlpha = eff.alpha;
    ctx.beginPath();
    ctx.arc(eff.x, eff.y, eff.radius, 0, Math.PI * 2);
    ctx.fillStyle = eff.color;
    ctx.fill();
    ctx.restore();
  });

  // If game over, show winner:
  if (player1.health <= 0 || player2.health <= 0) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    let winner = player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!";
    ctx.fillText(winner, canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText(
      "Press Enter to return to Menu",
      canvas.width / 2 - 140,
      canvas.height / 2 + 40
    );
  }
}

// -------------------------------
// MAIN MENU & CHARACTER SELECTION DRAW FUNCTIONS
// -------------------------------
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("Best Fighting Game OAT", canvas.width / 2 - 220, 150);
  ctx.font = "20px Arial";
  ctx.fillText(
    "Press 1 for Single Player or 2 for Two Player",
    canvas.width / 2 - 190,
    220
  );
  ctx.fillText("Press Enter to continue", canvas.width / 2 - 110, 260);
}

function drawCharacterSelect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Select Your Character", canvas.width / 2 - 140, 50);

  const boxWidth = 150;
  const boxHeight = 80;
  const startX = (canvas.width - 4 * boxWidth) / 2;
  const startY = 100;

  for (let i = 0; i < characters.length; i++) {
    let row = Math.floor(i / 4);
    let col = i % 4;
    let boxX = startX + col * (boxWidth + 10);
    let boxY = startY + row * (boxHeight + 10);

    ctx.strokeStyle = "white";
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = characters[i].color;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = "black";
    ctx.fillText(characters[i].name, boxX + 20, boxY + 30);
  }
}

// -------------------------------
// MAIN LOOP
// -------------------------------
function loop() {
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "characterSelect") {
    drawCharacterSelect();
  } else if (gameState === "playing") {
    updateGame();
    drawGame();
  } else if (gameState === "gameOver") {
    drawGame();
  }
  requestAnimationFrame(loop);
}

// Start the loop.
loop();
