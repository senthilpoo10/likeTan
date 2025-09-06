// gameLogic.ts
"use client";

import { RefObject } from "react";
import { loadGameAssets } from "./loadAssets";
import { drawOpening, drawEnding, drawFinalScreen } from "./startAndEnding";
import {
  forgottenItemsInit,
  drawForgotten,
  clearForgottenItems,
  activeItems,
} from "./forgottenItems";
import { saveGameResult } from "./saveGameResult";

// Game phases
enum GamePhase {
  Opening,
  Playing,
  Ending,
  Final,
}

// Global game state
const gameState = {
  phase: GamePhase.Opening,
  round: 1,
  pl1Name: "",
  pl2Name: "",
  winnerName: "",
  winnerAvatar: new Image(),
};

// For smooth multiple keys
const keysPressed: { [key: string]: boolean } = {};

// Game options
export const gameOptions = {
  enableMadness: false,
};

export function gameLogic(
  canvasRef: RefObject<HTMLCanvasElement>,
  mode?: string,
  sessionData?: any,
  navigate?: (path: string, options?: any) => void
) {
  if (sessionData?.gameType === "madness") gameOptions.enableMadness = true;
  else gameOptions.enableMadness = false;

  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (sessionData) {
    gameState.pl1Name = sessionData.user || "Player1";
    gameState.pl2Name = sessionData.guest || "Player2";
  }

  // Music
  let animationId: number;
  let music: HTMLAudioElement;
  let keydownHandler: (e: KeyboardEvent) => void;
  let stopped = false;

  loadGameAssets(
    sessionData?.userColor,
    sessionData?.guestColor,
    sessionData?.gameType
  ).then(({ table, paddle1, paddle2, music: loadedMusic }) => {
    if (stopped) return;

    const player1Avatar = new Image();
    player1Avatar.src = sessionData?.userAvatar?.image || "/fallback1.png";
    const player2Avatar = new Image();
    player2Avatar.src = sessionData?.guestAvatar?.image || "/fallback2.png";

    music = loadedMusic;

    let paddleProgress = 0.5;
    let paddle2Progress = 0.5;
    const speedUp = 1.09;

    let p1Score = 0;
    let p2Score = 0;
    let p1Wins = 0;
    let p2Wins = 0;

    // 3D paddle values
    const minX = -80;
    const maxX = 100;
    const minY = 500;
    const maxY = 0;
    const minScale = 1.5;
    const maxScale = 0.5;

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      dx: 3 * (Math.random() > 0.5 ? 1 : -1), // ADJUST '3' TO MAKE BALL FASTER!
      dy: 1.5 * (Math.random() > 0.5 ? 1 : -1),
    };

    function drawBackground() {
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawPaddles() {
      // Interpolation for paddle1
      const x = minX + (maxX - minX) * paddleProgress;
      const y = minY + (maxY - minY) * paddleProgress;
      const scale = minScale + (maxScale - minScale) * paddleProgress;
      const paddleWidth = 80 * scale;
      const paddleHeight = 120 * scale;

      // paddle2
      const scale2 = minScale + (maxScale - minScale) * paddle2Progress;
      const x2 =
        canvas.width - (minX + (maxX - minX) * paddle2Progress + 80 * scale2);
      const y2 = minY + (maxY - minY) * paddle2Progress;
      const paddleWidth2 = 80 * scale2;
      const paddleHeight2 = 120 * scale2;

      ctx.drawImage(paddle1, x, y, paddleWidth, paddleHeight);
      ctx.drawImage(paddle2, x2, y2, paddleWidth2, paddleHeight2);

      return {
        x,
        y,
        paddleWidth,
        paddleHeight,
        x2,
        y2,
        paddleWidth2,
        paddleHeight2,
      };
    }

    function drawBall() {
      const ballProg = 1 - (ball.y - maxY) / (minY - maxY);
      const ballScale = minScale + (maxScale - minScale) * ballProg;
      const ballRadius = ball.radius * ballScale;

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      return ballRadius;
    }

    function checkPaddleCollision(
      x: number,
      y: number,
      w: number,
      h: number,
      isLeft: boolean
    ) {
      const hitTop = y + h * 0.2;
      const hitBottom = y + h * 0.8;
      const paddleCenterY = y + h / 2;

      const isBallApproaching =
        (isLeft && ball.dx < 0 && ball.x >= x) ||
        (!isLeft && ball.dx > 0 && ball.x <= x + w);

      if (
        isBallApproaching &&
        ball.x + ball.radius >= x &&
        ball.x - ball.radius <= x + w &&
        ball.y >= hitTop &&
        ball.y <= hitBottom &&
        ball.y < paddleCenterY
      ) {
        ball.dx *= -1;
        ball.dx *= speedUp;
        ball.dy *= speedUp;
        ball.x += isLeft ? 10 : -10;
      }
    }

    function checkItemCollision() {
      if (!gameOptions.enableMadness) return;
      for (const item of activeItems) {
        const itemRadius = (item.image.width * item.scale) / 2;
        const dx = ball.x - item.x;
        const dy = ball.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ball.radius + itemRadius) {
          if (Math.abs(dx) > Math.abs(dy)) ball.dx *= -1;
          else ball.dy *= -1;

          const overlap = ball.radius + itemRadius - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x += nx * overlap;
          ball.y += ny * overlap;
          ball.dx *= speedUp;
          ball.dy *= speedUp;
        }
      }
    }

    function checkOutOfBounds() {
      if (ball.x < -ball.radius || ball.x > canvas.width + ball.radius) {
        if (ball.x < -ball.radius) p2Score++;
        else p1Score++;

        if (p1Score === 2 || p2Score === 2) {
          gameState.phase = GamePhase.Ending;
        }

        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 2 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 1.5 * (Math.random() > 0.5 ? 1 : -1);
      }
    }

    function drawScore() {
      ctx.fillStyle = "white";
      ctx.font = "40px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${p1Score}`, canvas.width / 2 - 80, 300);
      ctx.fillText(`${p2Score}`, canvas.width / 2 + 60, 300);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (gameState.phase) {
        case GamePhase.Opening:
          drawOpening(ctx, {
            round: gameState.round,
            pl1Name: gameState.pl1Name,
            pl2Name: gameState.pl2Name,
            pl1Avatar: paddle1,
            pl2Avatar: paddle2,
          });
          return;
        case GamePhase.Ending:
          drawEnding(ctx, {
            round: gameState.round,
            pl1Name: gameState.pl1Name,
            pl2Name: gameState.pl2Name,
            pl1Avatar: paddle1,
            pl2Avatar: paddle2,
            winnerName:
              p1Score > p2Score ? gameState.pl1Name : gameState.pl2Name,
            winnerAvatar: p1Score > p2Score ? player1Avatar : player2Avatar,
          });
          return;
        case GamePhase.Final:
          drawFinalScreen(ctx, {
            winnerName: gameState.winnerName,
            winnerAvatar: gameState.winnerAvatar,
          });
          return;
        case GamePhase.Playing:
          break;
      }

      drawBackground();

      // New KEYS!
      const paSpeed = 0.008;

      if (keysPressed["d"])
        paddleProgress = Math.min(1, paddleProgress + paSpeed);
      if (keysPressed["a"])
        paddleProgress = Math.max(0, paddleProgress - paSpeed);
      if (keysPressed["ArrowRight"])
        paddle2Progress = Math.max(0, paddle2Progress - paSpeed);
      if (keysPressed["ArrowLeft"])
        paddle2Progress = Math.min(1, paddle2Progress + paSpeed);

      const {
        x,
        y,
        paddleWidth,
        paddleHeight,
        x2,
        y2,
        paddleWidth2,
        paddleHeight2,
      } = drawPaddles();

      ctx.drawImage(table, 0, 0, canvas.width, canvas.height);
      if (gameOptions.enableMadness) drawForgotten(ctx);
      drawBall();

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.y <= 0 || ball.y >= canvas.height) ball.dy *= -1;

      checkPaddleCollision(x, y, paddleWidth, paddleHeight, true);
      checkPaddleCollision(x2, y2, paddleWidth2, paddleHeight2, false);
      checkItemCollision();
      checkOutOfBounds();
      drawScore();
    };

    const update = () => {
      draw();
      animationId = requestAnimationFrame(update);
    };

    keydownHandler = (e: KeyboardEvent) => {
      keysPressed[e.key] = true;
      if (music && music.paused) {
        music.loop = true;
        music.volume = 0.6;
        music.play().catch((e) => console.log("Audio failed to play:", e));
      }

      if (e.code === "Space") {
        if (gameState.phase === GamePhase.Opening)
          gameState.phase = GamePhase.Playing;
        else if (gameState.phase === GamePhase.Ending) {
          if (p1Score > p2Score) p1Wins++;
          else if (p2Score > p1Score) p2Wins++;
          gameState.round++;

          if (gameState.round > 1 && gameOptions.enableMadness) {
            forgottenItemsInit(ctx, canvas);
            forgottenItemsInit(ctx, canvas);
            if (gameState.round > 2) {
              forgottenItemsInit(ctx, canvas);
              forgottenItemsInit(ctx, canvas);
            }
          }

          if (gameState.round > 3) {
            gameState.phase = GamePhase.Final;
            gameState.winnerName =
              p1Wins > p2Wins ? gameState.pl1Name : gameState.pl2Name;
            gameState.winnerAvatar =
              p1Wins > p2Wins ? player1Avatar : player2Avatar;
          } else gameState.phase = GamePhase.Opening;
          p1Score = 0;
          p2Score = 0;
        } else if (gameState.phase === GamePhase.Final) {
          saveGameResult({
            username: sessionData.user,
            guest_name: sessionData.guest,
            userAvatar: sessionData.userAvatar.name,
            guestAvatar: sessionData.guestAvatar.name,
            userWins: p1Wins,
            guestWins: p2Wins,
            gameName: "ping-pong",
          });
          gameState.phase = GamePhase.Opening;
          gameState.round = 1;
          p1Score = 0;
          p2Score = 0;
          p1Wins = 0;
          p2Wins = 0;
          clearForgottenItems();

          if (navigate) {
            if (navigate) {
              navigate("/game/game-end-page", {
                state: {
                  winnerName:
                    p1Wins > p2Wins ? sessionData.user : sessionData.guest,
                  winnerAvatar:
                    p1Wins > p2Wins
                      ? sessionData.userAvatar.name
                      : sessionData.guestAvatar.name,
                  loserName:
                    p1Wins > p2Wins ? sessionData.guest : sessionData.user,
                  loserAvatar:
                    p1Wins > p2Wins
                      ? sessionData.guestAvatar.name
                      : sessionData.userAvatar.name,
                },
              });
            }
          }

          //  window.location.href = "/game/game-end-page";
        }
      }
    };

    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", (e) => {
      keysPressed[e.key] = false;
    });
    update();
  });

  return () => {
    stopped = true;
    console.log("🧹 Cleaning up game loop and music");
    if (animationId) cancelAnimationFrame(animationId);
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
    clearForgottenItems();
  };
}
