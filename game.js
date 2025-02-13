// ======================================================================
// GENERAL OVERVIEW:
// 1. Set up the HTML canvas element and its 2D drawing context.
// 2. Define two player objects with properties for position, size,
//    colors (normal, attacking, special), health, and movement states.
// 3. Set up keyboard event listeners for movement, jumping, and attacking.
// 4. Create the game loop to update game logic (movement, gravity, collision)
//    and then render the updated state onto the canvas.
// 5. Draw the players and health bars, and check for win conditions.
// ======================================================================

// ------------------------------ SET UP CANVAS ------------------------------
// Step: Initialize the canvas element and its drawing context so that we can
//       draw our game elements (players, health bars, etc.) onto the screen.

// Get the canvas element from the HTML by its ID.
const canvas = document.getElementById("gameCanvas");

// Retrieve the 2D rendering context from the canvas.
const ctx = canvas.getContext("2d");

// Set the canvas dimensions.
canvas.width = 800; // Width of the canvas in pixels.
canvas.height = 400; // Height of the canvas in pixels.

// ------------------------------ PLAYER OBJECTS -----------------------------
// Step: Define the two player objects (Player 1 and Player 2) with their
//       initial properties such as position, size, colors, health, and
//       flags for movement and attack states.
// Define Player 1 (red) with its properties.
const player1 = {
  x: 50, // X-coordinate start position.
  y: 250, // Y-coordinate start (ground level).
  width: 50, // Width of the player.
  height: 100, // Height of the player.
  color: "red", // Default color.
  attackingColor: "OrangeRed", // Color when performing a normal attack.
  health: 100, // Starting health.
  isAttacking: false, // Flag to indicate if a normal attack is occurring.
  velocityY: 0, // Vertical velocity (for jump/gravity).
  isJumping: false, // Flag to prevent double jumps.
  isSpecialAttacking: false, // Flag for special attack state.
  specialAttackingColor: "purple", // Color when performing a special attack.
};

// Define Player 2 (blue) with its properties.
const player2 = {
  x: 700, // X-coordinate start position.
  y: 250, // Y-coordinate start (ground level).
  width: 50, // Width of the player.
  height: 100, // Height of the player.
  color: "blue", // Default color.
  attackingColor: "DodgerBlue", // Color when performing a normal attack.
  health: 100, // Starting health.
  isAttacking: false, // Flag to indicate if a normal attack is occurring.
  velocityY: 0, // Vertical velocity (for jump/gravity).
  isJumping: false, // Flag to prevent double jumps.
  isSpecialAttacking: false, // Flag for special attack state.
  specialAttackingColor: "green", // Color when performing a special attack.
};

// ------------------------------ MOVEMENT & KEY CONTROLS -------------------------
// Step: Set up the keyboard controls for moving the players, jumping, and attacking.

// Object to track whether movement keys are pressed.
const keys = {
  a: false, // 'a' key: Player 1 moves left.
  d: false, // 'd' key: Player 1 moves right.
  ArrowLeft: false, // Left arrow key: Player 2 moves left.
  ArrowRight: false, // Right arrow key: Player 2 moves right.
};

const speed = 5; // Speed at which players move horizontally.

// Define cooldown times for attacks (in milliseconds) to avoid spamming.
const attackCooldown = 300; // Cooldown for normal attacks.
let lastAttackTimeP1 = 0; // Timestamp of Player 1's last normal attack.
let lastAttackTimeP2 = 0; // Timestamp of Player 2's last normal attack.
const spAttackCooldown = 500; // Cooldown for special attacks.

// ------------------------------ EVENT LISTENERS FOR KEY INPUT ----------------------
// Step: Create event listeners to respond to key presses and releases,
//       handling movement, jumping, and both normal and special attacks.

// Listen for keydown events (when a key is pressed).
window.addEventListener("keydown", (e) => {
  const currentTime = Date.now(); // Get the current time for cooldown checks.

  // Update the pressed state for keys we are tracking.
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }

  // Handle Player 1 jump when 'w' is pressed (only if not already jumping).
  if (e.key === "w" && !player1.isJumping) {
    player1.velocityY = -12.5; // Apply upward velocity.
    player1.isJumping = true; // Set jump flag to prevent double jumps.
  }

  // Handle Player 2 jump when 'ArrowUp' is pressed (only if not already jumping).
  if (e.key === "ArrowUp" && !player2.isJumping) {
    player2.velocityY = -12.5; // Apply upward velocity.
    player2.isJumping = true; // Set jump flag.
  }

  // Handle normal attack for Player 1 when the spacebar is pressed.
  if (e.key === " " && currentTime - lastAttackTimeP1 > attackCooldown) {
    player1.isAttacking = true; // Activate attacking state.
    lastAttackTimeP1 = currentTime; // Update last attack time.
    setTimeout(() => (player1.isAttacking = false), 100); // Deactivate after 100ms.
  }

  // Handle normal attack for Player 2 when Enter is pressed.
  if (e.key === "Enter" && currentTime - lastAttackTimeP2 > attackCooldown) {
    player2.isAttacking = true; // Activate attacking state.
    lastAttackTimeP2 = currentTime; // Update last attack time.
    setTimeout(() => (player2.isAttacking = false), 100); // Deactivate after 100ms.
  }

  // Handle special attack for Player 1 when 'c' is pressed.
  if (e.key === "c" && currentTime - lastAttackTimeP1 > spAttackCooldown) {
    player1.isSpecialAttacking = true; // Activate special attack state.
    lastAttackTimeP1 = currentTime; // Update last attack time.
    setTimeout(() => (player1.isSpecialAttacking = false), 100); // Deactivate after 100ms.
  }

  // Handle special attack for Player 2 when 'Shift' is pressed.
  if (e.key === "Shift" && currentTime - lastAttackTimeP2 > spAttackCooldown) {
    player2.isSpecialAttacking = true; // Activate special attack state.
    lastAttackTimeP2 = currentTime; // Update last attack time.
    setTimeout(() => (player2.isSpecialAttacking = false), 100); // Deactivate after 100ms.
  }
});

// Listen for keyup events (when a key is released).
window.addEventListener("keyup", (e) => {
  // If the released key is tracked, mark it as not pressed.
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// ------------------------------ GAME LOGIC: UPDATE FUNCTION -----------------------
// Step: Create the update() function to handle all game logic, including
//       player movement, applying gravity, and collision detection for attacks.

function update() {
  // ---------- Movement Logic for Player 1 ----------
  // Move Player 1 left if the 'a' key is pressed.
  if (keys.a) {
    player1.x -= speed; // Shift left by reducing the x-coordinate.
  }

  // Move Player 1 right if the 'd' key is pressed.
  // Also ensure there is no unwanted collision with Player 2.
  if (
    keys.d &&
    (player1.x + player1.width < player2.x || // Player 1 is completely left of Player 2.
      player1.x > player2.x + player2.width || // Or completely right of Player 2.
      player1.y + player1.height < player2.y) // Or is above Player 2.
  ) {
    player1.x += speed; // Shift right by increasing the x-coordinate.
  }

  // ---------- Movement Logic for Player 2 ----------
  // Move Player 2 left if the left arrow key is pressed.
  // Ensure Player 2 is not colliding horizontally with Player 1.
  if (
    keys.ArrowLeft &&
    (player2.x > player1.x + player1.width || // Player 2 is completely right of Player 1.
      player2.x + player2.width < player1.x || // Or completely left of Player 1.
      player2.y + player2.height < player1.y) // Or is above Player 1.
  ) {
    player2.x -= speed; // Shift left.
  }

  // Move Player 2 right if the right arrow key is pressed.
  if (keys.ArrowRight) {
    player2.x += speed; // Shift right.
  }

  // ---------- Clamping Player Positions to the Canvas ----------
  // Prevent Player 1 from moving off the canvas.
  player1.x = Math.max(0, Math.min(player1.x, canvas.width - player1.width));

  // Prevent Player 2 from moving off the canvas.
  player2.x = Math.max(0, Math.min(player2.x, canvas.width - player2.width));

  // ---------- Gravity & Jump Mechanics ----------
  // Update vertical positions by applying current vertical velocity.
  player1.y += player1.velocityY;
  player2.y += player2.velocityY;

  // Apply gravity to Player 1 if above the ground level (y < 250).
  if (player1.y < 250) {
    player1.velocityY += 0.5; // Gradually increase downward speed.
  } else {
    // When landing, snap Player 1 to ground level and reset jump state.
    player1.y = 250;
    player1.velocityY = 0;
    player1.isJumping = false;
  }

  // Apply gravity to Player 2 similarly.
  if (player2.y < 250) {
    player2.velocityY += 0.5;
  } else {
    player2.y = 250;
    player2.velocityY = 0;
    player2.isJumping = false;
  }

  // ---------- Collision Detection for Attacks ----------
  // Check if Player 1’s normal attack is in range of Player 2.
  if (
    player1.isAttacking &&
    Math.abs(player1.x + player1.width - player2.x) < 50 // Horizontal proximity check.
  ) {
    player2.health -= 1; // Deduct health from Player 2.
  }

  // Check if Player 2’s normal attack is in range of Player 1.
  if (
    player2.isAttacking &&
    Math.abs(player2.x - (player1.x + player1.width)) < 50 // Horizontal proximity check.
  ) {
    player1.health -= 1; // Deduct health from Player 1.
  }

  // Check if Player 1’s special attack is in range.
  if (
    player1.isSpecialAttacking &&
    Math.abs(player1.x + player1.width - player2.x) < 50
  ) {
    player2.health -= 1.75; // Deduct more health due to special attack.
  }

  // Check if Player 2’s special attack is in range.
  if (
    player2.isSpecialAttacking &&
    Math.abs(player2.x - (player1.x + player1.width)) < 50
  ) {
    player1.health -= 1.75; // Deduct more health.
  }
}

// ------------------------------ RENDERING: DRAW FUNCTION --------------------------
// Step: Create the draw() function to render the current state of the game,
//       including players, health bars, and win messages onto the canvas.

function draw() {
  // Clear the entire canvas for the new frame.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ---------- Draw Player 1 ----------
  // Choose the fill color based on Player 1's current state.
  if (player1.isAttacking) {
    ctx.fillStyle = player1.attackingColor; // Normal attack color.
  } else if (player1.isSpecialAttacking) {
    ctx.fillStyle = player1.specialAttackingColor; // Special attack color.
  } else {
    ctx.fillStyle = player1.color; // Default color.
  }
  // Draw Player 1 as a rectangle on the canvas.
  ctx.fillRect(player1.x, player1.y, player1.width, player1.height);

  // ---------- Draw Player 2 ----------
  // Choose the fill color based on Player 2's current state.
  if (player2.isAttacking) {
    ctx.fillStyle = player2.attackingColor;
  } else if (player2.isSpecialAttacking) {
    ctx.fillStyle = player2.specialAttackingColor;
  } else {
    ctx.fillStyle = player2.color;
  }
  // Draw Player 2 as a rectangle.
  ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

  // ---------- Draw Health Bars ----------
  // Draw the background health bars in red.
  ctx.fillStyle = "red";
  // Health bar background for Player 1.
  ctx.fillRect(20, 20, 200, 10);
  // Health bar background for Player 2.
  ctx.fillRect(560, 20, 200, 10);

  // Draw the current health (green) for both players.
  ctx.fillStyle = "green";
  // Player 1's health bar: width is proportional to current health.
  ctx.fillRect(20, 20, player1.health * 2, 10);
  // Player 2's health bar.
  ctx.fillRect(560, 20, player2.health * 2, 10);

  // ---------- Draw Button Controls -------------
  ctx.fillStyle = "white"; // Set text color.
  ctx.font = "15px Arial"; // Set font size and type.
  ctx.fillText("C For Super Attack", 20, 45);

  ctx.fillStyle = "white"; // Set text color.
  ctx.font = "15px Arial"; // Set font size and type.
  ctx.fillText("Shift For Super Attack", 560, 45);
  // ---------- Check for Win Condition ----------
  // If either player's health is 0 or less, display the winning message.
  if (player1.health <= 0 || player2.health <= 0) {
    ctx.fillStyle = "white"; // Set text color.
    ctx.font = "30px Arial"; // Set font size and type.
    ctx.fillText(
      player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!", // Win message.
      300, // X-coordinate for the text.
      200 // Y-coordinate for the text.
    );
    return; // Exit the draw function (stopping further frames).
  }

  // Continue the game loop (targeting approximately 60 FPS).
  requestAnimationFrame(loop);
}

// ------------------------------ MAIN GAME LOOP --------------------------
// Step: Create the main game loop function that first updates the game logic
//       and then draws the current frame onto the canvas.

function loop() {
  update(); // Update game state (movement, gravity, collisions, etc.).
  draw(); // Draw the updated state on the canvas.
}

// ------------------------------ START THE GAME --------------------------
// Step: Kick off the game by calling the main loop function.
loop(); // Initiate the game loop.
