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
    stamina: 100,
    health: 90,
    redBar: 90,
    speed: 5,
    attack: "high",
    jump: "medium",
    special: "Fire Dash",
  },
  {
    name: "Vortex",
    color: "blue",
    attackingColor: "blue",
    specialAttackingColor: "DeepSkyBlue",
    stamina: 80,
    health: 100,
    redBar: 100,
    speed: 7,
    attack: "medium",
    jump: "high",
    special: "Air Tornado", // Updated from Teleportation
  },
  {
    name: "Titan",
    color: "brown",
    health: 125,
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
    health: 80,
    redBar: 80,
    speed: 8,
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
    health: 75,
    redBar: 75,
    speed: 10,
    attackingColor: "purple",
    specialAttackingColor: "DarkSlateGray",
    stamina: 110,
    attack: "medium",
    jump: "medium",
    special: "Shadow Teleprotation", // Updated from Shadow Clone
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
// In single-player mode, Player 2 will be AI-controlled.

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

let p1ultUsage = 1;
let p2ultUsage = 1;
// Attacking damage / reading keys event
window.addEventListener("keydown", (e) => {
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
      if (currentTime - player1.lastNormalAttackTime < 400) {
        player1.comboCount++;
      } else {
        player1.comboCount = 1;
      }
      player1.lastNormalAttackTime = currentTime;
      if (player1.stamina >= 10) {
        player1.isAttacking = true;
        player1.stamina -= 10;
        punchSound.play();
        setTimeout(() => {
          player1.isAttacking = false;
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
    // --- Player 1 Ultimate Attack ('f') ---
    if (e.key === "f" && p1ultUsage === 1) {
      if (player1.stamina >= 75) {
        player1.isUltAttacking = true;
        player1.stamina -= 75;
        p1ultUsage--;
        // Determine ult effect based on character
        if (player1.name === "Flare") {
          effects.push({
            type: "fireDash",
            duration: 2000,
            speedBoost: 12,
            damage: 0.2,
            owner: player1,
            startTime: Date.now(),
            applied: false,
          });
          player1.isInvincible = true;
          setTimeout(() => {
            player1.isInvincible = false;
          }, 2000);
        } else if (player1.name === "Vortex") {
          effects.push({
            type: "airTornado",
            duration: 3500,
            velocityMultiplier: 0.1,
            damage: 0.125,
            owner: player1,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player1.name === "Titan") {
          effects.push({
            type: "groundSlam",
            duration: 1000,
            damage: 2,
            owner: player1,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player1.name === "Volt") {
          effects.push({
            type: "lightningStrike",
            duration: 500,
            damage: 15,
            owner: player1,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player1.name === "Frost") {
          effects.push({
            type: "frozenTrap",
            duration: 2000,
            owner: player1,
            target: player2,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player1.name === "Shade") {
          effects.push({
            type: "shadowTeleprotation",
            duration: 100,
            owner: player1,
            target: player2,
            startTime: Date.now(),
          });
        } else if (player1.name === "Blaze") {
          effects.push({
            type: "lavaBurst",
            duration: 1500,
            damage: 0.5,
            owner: player1,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player1.name === "Mystic") {
          effects.push({
            type: "healingAura",
            duration: 3000,
            healPerTick: 0.5,
            owner: player1,
            startTime: Date.now(),
          });
        }
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
    // --- Player 2 Ultimate Attack ('m') for two-player mode ---
    if (gameMode === "two" && e.key === "m" && p2ultUsage === 1) {
      if (player2.stamina >= 75) {
        player2.isUltAttacking = true;
        player2.stamina -= 75;
        p2ultUsage--;
        if (player2.name === "Flare") {
          effects.push({
            type: "fireDash",
            duration: 2000,
            speedBoost: 12,
            damage: 0.2,
            owner: player2,
            startTime: Date.now(),
            applied: false,
          });
          player2.isInvincible = true;
          setTimeout(() => {
            player2.isInvincible = false;
          }, 2000);
        } else if (player2.name === "Vortex") {
          effects.push({
            type: "airTornado",
            duration: 3500,
            velocityMultiplier: 0.1,
            damage: 0.125,
            owner: player2,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player2.name === "Titan") {
          effects.push({
            type: "groundSlam",
            duration: 1000,
            damage: 2,
            owner: player2,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player2.name === "Volt") {
          effects.push({
            type: "lightningStrike",
            duration: 500,
            damage: 15,
            owner: player2,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player2.name === "Frost") {
          effects.push({
            type: "frozenTrap",
            duration: 2000,
            owner: player2,
            target: player1,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player2.name === "Shade") {
          effects.push({
            type: "shadowTeleprotation",
            duration: 100,
            owner: player2,
            target: player1,
            startTime: Date.now(),
          });
        } else if (player2.name === "Blaze") {
          effects.push({
            type: "lavaBurst",
            duration: 1500,
            damage: 0.5,
            owner: player2,
            startTime: Date.now(),
            applied: false,
          });
        } else if (player2.name === "Mystic") {
          effects.push({
            type: "healingAura",
            duration: 3000,
            healPerTick: 0.5,
            owner: player2,
            startTime: Date.now(),
          });
        }
        player2.lastSpecialAttackTime = currentTime;
        setTimeout(() => (player2.isSpecialAttacking = false), 100);
      }
    }
  } else if (gameState === "menu") {
    if (e.key === "1") {
      gameMode = "single";
    }
    if (e.key === "2") {
      gameMode = "two";
    }
    if (e.key === "Enter") {
      gameState = "characterSelect";
    }
  } else if (gameState === "gameOver") {
    if (e.key === "Enter") {
      gameState = "menu";
      selectedCharP1 = null;
      selectedCharP2 = null;
      p1ultUsage = 1;
      p2ultUsage = 1;
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
    isUltAttacking: false,
    attackCooldown: 300,
    spAttackCooldown: 500,
    lastNormalAttackTime: 0,
    lastSpecialAttackTime: 0,
    facingLeft: false,
    comboCount: 0,
    stamina: selectedCharP1.stamina,
    maxStamina: 100,
    isInvincible: false,
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
    isUltAttacking: false,
    attackCooldown: 300,
    spAttackCooldown: 500,
    lastNormalAttackTime: 0,
    lastSpecialAttackTime: 0,
    facingLeft: false,
    comboCount: 0,
    stamina: selectedCharP2.stamina,
    maxStamina: 100,
    isInvincible: false,
  };

  // Reset health and assign maxHealth for healing caps.
  player1.health = selectedCharP1.health;
  player2.health = selectedCharP2.health;
  player1.maxHealth = selectedCharP1.health;
  player2.maxHealth = selectedCharP2.health;

  bgMusic.play();
  gameState = "playing";
}

// -------------------------------
// AI LOGIC (for single-player mode)
// -------------------------------
function updateAI() {
  if (gameMode !== "single") return;

  if (player2.x > player1.x + player1.width) {
    player2.x -= player2.speed;
  } else if (player2.x < player1.x - player2.width) {
    player2.x += player2.speed;
  } else {
    const currentTime = Date.now();
    if (
      currentTime - player2.lastNormalAttackTime > player2.attackCooldown &&
      player2.stamina >= 10
    ) {
      player2.isAttacking = true;
      player2.lastNormalAttackTime = currentTime;
      player2.comboCount = 1;
      player2.stamina -= 10;
      punchSound.play();
      setTimeout(() => {
        player2.isAttacking = false;
      }, 100);
    }
  }
  if (!player2.isJumping && Math.random() < 0.005) {
    player2.velocityY = -12.5;
    player2.isJumping = true;
  }
}

// -------------------------------
// UPDATE & RENDER FUNCTIONS
// -------------------------------
function updateGame() {
  // Movement for Player 1
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

  // Movement for Player 2 (or AI)
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

  // Clamp positions within canvas
  player1.x = Math.max(0, Math.min(player1.x, canvas.width - player1.width));
  player2.x = Math.max(0, Math.min(player2.x, canvas.width - player2.width));

  // Gravity & Jumping for Player 1
  player1.y += player1.velocityY;
  if (player1.y < 250) {
    player1.velocityY += 0.5;
  } else {
    player1.y = 250;
    player1.velocityY = 0;
    player1.isJumping = false;
  }
  // Gravity & Jumping for Player 2
  player2.y += player2.velocityY;
  if (player2.y < 250) {
    player2.velocityY += 0.5;
  } else {
    player2.y = 250;
    player2.velocityY = 0;
    player2.isJumping = false;
  }

  // Stamina Regeneration
  [player1, player2].forEach((p) => {
    if (p.stamina < p.maxStamina) {
      p.stamina += 0.2;
    }
  });

  // Collision Detection for Attacks
  const attackRange = 50;
  function isWithinAttackRange(attacker, defender) {
    return (
      Math.abs(attacker.x - defender.x) < attackRange ||
      Math.abs(attacker.x + attacker.width - defender.x) < attackRange
    );
  }
  function p2isWithinAttackRange(attacker, defender) {
    return (
      Math.abs(attacker.x - defender.x) < attackRange ||
      Math.abs(defender.x + defender.width - attacker.x) < attackRange
    );
  }
  if (
    player1.isAttacking &&
    isWithinAttackRange(player1, player2) &&
    !player2.isInvincible
  ) {
    if (player1.attack === "high") {
      player2.health -= player1.comboCount * 1.15;
    } else if (player1.attack === "medium") {
      player2.health -= player1.comboCount;
    } else if (player1.attack === "low") {
      player2.health -= player1.comboCount * 0.9;
    }
  }
  if (
    player2.isAttacking &&
    p2isWithinAttackRange(player2, player1) &&
    !player1.isInvincible
  ) {
    if (player2.attack === "high") {
      player1.health -= player2.comboCount * 1.15;
    } else if (player2.attack === "medium") {
      player1.health -= player2.comboCount;
    } else if (player2.attack === "low") {
      player1.health -= player2.comboCount * 0.9;
    }
  }
  if (
    player1.isSpecialAttacking &&
    isWithinAttackRange(player1, player2) &&
    !player2.isInvincible
  ) {
    player2.health -= 1.75;
  }
  if (
    player2.isSpecialAttacking &&
    p2isWithinAttackRange(player2, player1) &&
    !player1.isInvincible
  ) {
    player1.health -= 1.75;
  }

  // Update Special Effects
  for (let i = effects.length - 1; i >= 0; i--) {
    let effect = effects[i];

    if (effect.type === "fireDash") {
      let elapsed = Date.now() - effect.startTime;
      if (elapsed < effect.duration) {
        if (!effect.applied) {
          effect.owner.speed += effect.speedBoost;
          effect.applied = true;
        }
        if (
          effect.owner === player1 &&
          Math.abs(effect.owner.x - player2.x) < 60
        ) {
          player2.health -= effect.damage;
        } else if (
          effect.owner === player2 &&
          Math.abs(effect.owner.x - player1.x) < 60
        ) {
          player1.health -= effect.damage;
        }
      } else {
        if (effect.applied) {
          effect.owner.speed -= effect.speedBoost;
        }
        effects.splice(i, 1);
      }
    } else if (effect.type === "airTornado") {
      let elapsed = Date.now() - effect.startTime;
      if (elapsed < effect.duration) {
        if (effect.owner === player1 && Math.abs(player2.x - player1.x) < 80) {
          player2.health -= effect.damage;
        } else if (
          effect.owner === player2 &&
          Math.abs(player1.x - player2.x) < 80
        ) {
          player1.health -= effect.damage;
        }
      } else {
        effects.splice(i, 1);
      }
    } else if (effect.type === "groundSlam") {
      let elapsed = Date.now() - effect.startTime;
      if (elapsed < effect.duration) {
        if (
          effect.owner === player1 &&
          Math.abs(player2.x - (player1.x + player1.width)) < 60
        ) {
          player2.health -= effect.damage;
        } else if (
          effect.owner === player2 &&
          Math.abs(player1.x - (player2.x - player2.width)) < 60
        ) {
          player1.health -= effect.damage;
        }
      } else {
        effects.splice(i, 1);
      }
    } else if (effect.type === "lightningStrike") {
      let elapsed = Date.now() - effect.startTime;
      if (!effect.applied && elapsed > 300) {
        if (effect.owner === player1) {
          player2.health -= effect.damage;
        } else {
          player1.health -= effect.damage;
        }
        effect.applied = true;
      }
      if (elapsed >= effect.duration) {
        effects.splice(i, 1);
      }
    } else if (effect.type === "frozenTrap") {
      let elapsed = Date.now() - effect.startTime;
      if (!effect.applied) {
        effect.originalSpeed = effect.target.speed;
        effect.target.speed = 0;
        effect.applied = true;
      }
      if (elapsed >= effect.duration) {
        effect.target.speed = effect.originalSpeed;
        effects.splice(i, 1);
      }
    } else if (effect.type === "shadowTeleprotation") {
      if (effect.owner === player1) {
        player1.x = player2.x - player1.width - 10;
        player2.health -= 5;
      } else {
        player2.x = player1.x + player1.width + 10;
        player1.health -= 5;
      }
      effects.splice(i, 1);
    } else if (effect.type === "lavaBurst") {
      let elapsed = Date.now() - effect.startTime;
      if (elapsed < effect.duration) {
        if (
          effect.owner === player1 &&
          Math.abs(player2.x - (player1.x + player1.width)) < 80
        ) {
          player2.health -= effect.damage;
        } else if (
          effect.owner === player2 &&
          Math.abs(player1.x - (player2.x - player2.width)) < 80
        ) {
          player1.health -= effect.damage;
        }
      } else {
        effects.splice(i, 1);
      }
    } else if (effect.type === "healingAura") {
      let elapsed = Date.now() - effect.startTime;
      if (elapsed < effect.duration) {
        effect.owner.health = Math.min(
          effect.owner.health + effect.healPerTick,
          effect.owner.maxHealth
        );
      } else {
        effects.splice(i, 1);
      }
    } else {
      // Generic effect update (for your circle effects)
      effect.radius += 1;
      effect.alpha -= effect.decay;
      if (effect.alpha <= 0) {
        effects.splice(i, 1);
      }
    }
  }

  // Check for Win Condition
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
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 200, 10);
  }
  if (player2.redBar < 100) {
    ctx.fillStyle = "red";
    ctx.fillRect(580, 20, player2.redBar * 2, 10);
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(580, 20, 200, 10);
  }

  if (player1.health > 100) {
    ctx.fillStyle = "green";
    ctx.fillRect(20, 20, 200, 10);
    ctx.fillStyle = "blue";
    ctx.fillRect(20, 20, (player1.health - 100) * 2, 10);
  } else if (player1.health >= 0) {
    ctx.fillStyle = "green";
    ctx.fillRect(20, 20, player1.health * 2, 10);
  }
  if (player2.health > 100) {
    ctx.fillStyle = "green";
    ctx.fillRect(580, 20, 200, 10);
    ctx.fillStyle = "blue";
    ctx.fillRect(580, 20, (player2.health - 100) * 2, 10);
  } else if (player2.health >= 0) {
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

  // Draw Special Effects:
  effects.forEach((eff) => {
    if (eff.type === "fireDash") {
      // Fire Dash effect (already implemented)
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "orange";
      if (eff.owner === player1) {
        ctx.fillRect(
          eff.owner.x - 20,
          eff.owner.y + 10,
          40,
          eff.owner.height - 20
        );
      } else if (eff.owner === player2) {
        ctx.fillRect(
          eff.owner.x + 20,
          eff.owner.y + 10,
          40,
          eff.owner.height - 20
        );
      }
      ctx.restore();
    } else if (eff.type === "airTornado") {
      // Air Tornado: Draw a rotating blue circle around the owner.
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "DeepSkyBlue";
      ctx.lineWidth = 5;
      ctx.translate(
        eff.owner.x + eff.owner.width / 2,
        eff.owner.y + eff.owner.height / 2
      );
      // Rotate based on time for a spinning effect.
      ctx.rotate((Date.now() / 1000) % (2 * Math.PI));
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (eff.type === "groundSlam") {
      // Ground Slam: Draw a shockwave semi-circle at the base.
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "brown";
      ctx.beginPath();
      ctx.arc(
        eff.owner.x + eff.owner.width / 2,
        eff.owner.y + eff.owner.height,
        40,
        0,
        Math.PI,
        true
      );
      ctx.fill();
      ctx.restore();
    } else if (eff.type === "lightningStrike") {
      // Lightning Strike: Draw a lightning bolt (line) from attacker to target.
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 4;
      ctx.beginPath();
      let startX = eff.owner.x + eff.owner.width / 2;
      let startY = eff.owner.y;
      // Determine the target based on which player is the attacker.
      let target = eff.owner === player1 ? player2 : player1;
      let endX = target.x + target.width / 2;
      let endY = target.y;
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    } else if (eff.type === "frozenTrap") {
      // Frozen Trap: Draw a blue overlay on the target.
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "lightblue";
      ctx.beginPath();
      ctx.arc(
        eff.target.x + eff.target.width / 2,
        eff.target.y + eff.target.height / 2,
        30,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    } else if (eff.type === "shadowTeleprotation") {
      // Shadow Teleprotation: A quick shadow flash at the attacker’s position.
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "purple";
      ctx.beginPath();
      ctx.arc(
        eff.owner.x + eff.owner.width / 2,
        eff.owner.y + eff.owner.height / 2,
        20,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    } else if (eff.type === "lavaBurst") {
      // Lava Burst: Draw a red burst around the owner.
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
        eff.owner.x + eff.owner.width / 2,
        eff.owner.y + eff.owner.height / 2,
        40,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    } else if (eff.type === "healingAura") {
      // Healing Aura: Draw a glowing aura that pulses.
      ctx.save();
      ctx.globalAlpha = 0.4 + 0.1 * Math.sin(Date.now() / 200);
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(
        eff.owner.x + eff.owner.width / 2,
        eff.owner.y + eff.owner.height / 2,
        30,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    } else {
      // Fallback for generic effects (e.g., the original circle effect)
      ctx.save();
      ctx.globalAlpha = eff.alpha;
      ctx.fillStyle = eff.color || "white";
      ctx.beginPath();
      ctx.arc(eff.x, eff.y, eff.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
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

loop();
