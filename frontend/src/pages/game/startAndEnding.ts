import { t } from "i18next";

export interface ScreenInfo {
  round: number;
  pl1Name: string;
  pl2Name: string;
  pl1Avatar: HTMLImageElement;
  pl2Avatar: HTMLImageElement;
  winnerName?: string;
  winnerAvatar: HTMLImageElement;
}

export function drawOpening(ctx: CanvasRenderingContext2D, info: Screen) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.font = "48px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(`${t("ROUND")} ${info.round}`, ctx.canvas.width / 2, 100);

	const avatarSize = 120
	const avatarY = ctx.canvas.height / 2 - 150;
	ctx.drawImage(info.pl1Avatar, 100, avatarY, avatarSize, avatarSize)
	ctx.drawImage(info.pl2Avatar, ctx.canvas.width - 200,  avatarY, avatarSize, avatarSize)

	ctx.font = "32px Arial";
	ctx.fillText(info.pl1Name, 150, avatarY + avatarSize + 70);
	ctx.fillText("vs", ctx.canvas.width / 2, avatarY + avatarSize / 2);
	ctx.fillText(info.pl2Name, ctx.canvas.width - 150, avatarY + avatarSize + 70);

	ctx.font = "24px Arial"
  ctx.fillText(t("MOVE_KEYS_INFO"), ctx.canvas.width / 2, avatarY + avatarSize + 140);
  
	// Press space
	ctx.font = "28px Arial"
	ctx.fillText(t("PRESS_SPACE_TO_START"), ctx.canvas.width / 2, ctx.canvas.height - 100);
}

export function drawEnding(ctx: CanvasRenderingContext2D, info: ScreenInfo) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.font = "48px Arial";
  ctx.fillStyle = "gold";
  ctx.textAlign = "center";
  ctx.fillText(
    t("WINS_THE_ROUND", { winner: info.winnerName || t("SOMEONE") }),
    ctx.canvas.width / 2,
    ctx.canvas.height / 2 - 50
  );

  ctx.font = "28px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(
    t("PRESS_SPACE_TO_CONTINUE"),
    ctx.canvas.width / 2,
    ctx.canvas.height / 2 + 50
  );
}

export function drawFinalScreen(
  ctx: CanvasRenderingContext2D,
  info: FinalScreenInfo
) {
  const canvas = ctx.canvas;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Background: off-white
  ctx.fillStyle = "#fefcf9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // "WINNER!" title
  ctx.font = "64px Impact";
  ctx.fillStyle = "#d4af37"; // soft gold
  ctx.textAlign = "center";
  ctx.fillText(t("WINNER_TITLE"), centerX, 90);

  // Avatar
  const avatarWidth = 240;
  const avatarHeight = 320;
  ctx.drawImage(
    info.winnerAvatar,
    centerX - avatarWidth / 2,
    centerY - avatarHeight / 2,
    avatarWidth,
    avatarHeight
  );

  // Winner's name
  ctx.font = "42px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText(info.winnerName, centerX, centerY + avatarHeight / 2 + 40);

  // Spacebar prompt
  ctx.font = "18px Arial";
  ctx.fillStyle = "#888";
  ctx.fillText(t("PRESS_SPACE_TO_CONTINUE"), centerX, canvas.height - 40);
}

export function drawTournamentScreen(
  ctx: CanvasRenderingContext2D,
  matchups: { round: number; pairs: [string, string][] }
) {
  ctx.fillStyle = "#C8F7F0";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = "black";
  ctx.font = "24px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${t("ROUND")} ${matchups.round}`, ctx.canvas.width / 2, 50);

  matchups.pairs.forEach((pair, index) => {
    const boxWidth = 200;
    const boxHeight = 60;
    const gap = 30;
    const y = 100 + index * (boxHeight + gap);

    const x1 = ctx.canvas.width / 2 - boxWidth - 10;
    const x2 = ctx.canvas.width / 2 + 10;

    const nextPlayers = index === 0;

    // Left player box
    ctx.fillStyle = nextPlayers ? "#FFD580" : "white"; // highlight current
    ctx.fillRect(x1, y, boxWidth, boxHeight);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y, boxWidth, boxHeight);
    ctx.fillStyle = "black";
    ctx.fillText(pair[0], x1 + boxWidth / 2, y + boxHeight / 2 + 8);

    // Right player box
    ctx.fillStyle = nextPlayers ? "#FFD580" : "white";
    ctx.fillRect(x2, y, boxWidth, boxHeight);
    ctx.strokeRect(x2, y, boxWidth, boxHeight);
    ctx.fillStyle = "black";
    ctx.fillText(pair[1], x2 + boxWidth / 2, y + boxHeight / 2 + 8);
  });
}
