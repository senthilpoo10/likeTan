"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { gameLogic } from "./gameLogic";
import { gameLogicTournament } from "./gameLogicTournament";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { saveGameResult } from "./saveGameResult";
import { avatars } from "../general/avatar";
import { handleFinalKeyPress } from "./gameLogicTournament";


import {
  createMatchups,
  assignPoints,
  PlayerData,
  Matchup,
} from "./tournamentManager";

import { drawFinalScreen } from "./startAndEnding";

export default function PongGame() {
  //for button
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // import stuff
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const mode = searchParams.get("mode"); // duel vs tournament
  const sessionData = location.state; // contains user, avatars, guests, etc.

  const [currentMatch, setCurrentMatch] = useState<Matchup | null>(null);
  const [matchQue, setMatchQue] = useState<Matchup[]>([]);
  const [matchups, setMatchups] = useState<Matchup[]>([]);

  // FOR TOURNAMENT
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundWinners, setRoundWinners] = useState<PlayerData[]>([]);

  // player pictures
  const leftAvatarImage =
    mode === "tournament"
      ? currentMatch?.player1.avatar
      : sessionData?.userAvatar?.image;
  const rightAvatarImage =
    mode === "tournament"
      ? currentMatch?.player2?.avatar
      : sessionData?.guestAvatar?.image;
  //at the end

  const [tournamentResults, setTournamentResults] = useState<any[][]>([]);

  function showFinalScreen(winnerName: string, avatarUrl: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const finalAvatar = new Image();
    finalAvatar.src = avatarUrl;

    finalAvatar.onload = () => {
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawFinalScreen(ctx, { winnerName, winnerAvatar: finalAvatar })
      };

      draw();

      const spaceHandler = (e: KeyboardEvent) => {
        if (e.code === "Space") 
		{
        	document.removeEventListener("keydown", spaceHandler)
//			window.location.href = "/game/game-end-page"; // this should not be here!
			handleFinalKeyPress(navigate, sessionData)
		  
        }
      };

      document.addEventListener("keydown", spaceHandler);
    };
  }

  useEffect(() => {
    if (!canvasRef.current || !mode || !sessionData) return;

    if (mode === "duel") {
      const cleanup = gameLogic(canvasRef, "duel", sessionData, navigate);
      return () => cleanup?.();
    }

    if (mode === "tournament") {
      const players: PlayerData[] = [
        {
          username: sessionData.user,
          avatar: sessionData.userAvatar.image,
          score: 0,
          color: sessionData.userColor,
        },
        ...sessionData.guests.map((g: any) => ({
          username: g.username,
          avatar: g.avatar.image,
          score: 0,
          color: g.color,
        })),
      ];

      const allMatchups = createMatchups(players);
      setMatchups(allMatchups);
      setCurrentMatch(allMatchups[0]);
      setMatchQue(allMatchups.slice(1));

      console.log("Mode is:", mode);
      console.log("Session Data:", sessionData);
    }
  }, [mode, sessionData]);

  useEffect(() => {
    if (mode !== "tournament" || !currentMatch) return;

    const matchSession = {
      user: currentMatch.player1.username,
      guest: currentMatch.player2?.username,
      userAvatar: { image: currentMatch.player1.avatar },
      guestAvatar: currentMatch.player2
        ? { image: currentMatch.player2.avatar }
        : null,
      gameType: sessionData?.gameType,
      tournamentBracket: {
        round: currentRound,
        pairs: matchups.map((m) => [
          m.player1.username,
          m.player2?.username || "POP",
        ]) as [string, string][],
      },
      //			round: currentRound,
      userColor: currentMatch.player1.color,
      guestColor: currentMatch.player2?.color,
    };

    const onMatchEnd = (winnerUsername: string) => {
      console.log("Winner is:", winnerUsername);

      setPlayerScores((prevScores) => {
        const updated = { ...prevScores };
        assignPoints(updated, winnerUsername, currentRound);

        const winnerData = [currentMatch.player1, currentMatch.player2].find(
          (p) => p?.username === winnerUsername
        );

        const updateWinners = winnerData
          ? [...roundWinners, winnerData]
          : [...roundWinners];

        setRoundWinners(updateWinners);

        const avatar1 = avatars.find(
          (avatar) => avatar?.image === currentMatch.player1.avatar
        )?.name;
        const avatar2 = avatars.find(
          (avatar) => avatar?.image === currentMatch.player2?.avatar
        )?.name;
        const matchResult = [
          {
            p1_username: currentMatch.player1.username,
            p2_username: currentMatch.player2?.username || "POP",
            p1_avatar: avatar1,
            p2_avatar: avatar2 || "",
            p1_wins: winnerUsername === currentMatch.player1.username ? 1 : 0,
            p2_wins: winnerUsername === currentMatch.player2?.username ? 1 : 0,
          },
        ];

        setTournamentResults((prev) => [...prev, matchResult]);

        if (matchQue.length > 0) {
          setCurrentMatch(matchQue[0]);
          setMatchQue(matchQue.slice(1));
        } else {
          if (updateWinners.length > 1) {
            const newMatchups = createMatchups(updateWinners);
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            setMatchups(newMatchups);
            setCurrentMatch(newMatchups[0]);
            setMatchQue(newMatchups.slice(1));
            setRoundWinners([]);
          } else {
            const finalWinner = winnerUsername;
            console.log("Tournament winner is:", finalWinner);

            setMatchups([]);
            setMatchQue([]);
            setCurrentMatch(null);

            // Save tournament data
            saveGameResult({
              username: sessionData.user,
              guest_name: undefined,
              userAvatar: sessionData.userAvatar.image,
              guestAvatar: "", // Optional
              userWins: 0, // Not used in tournament
              guestWins: 0, // Not used in tournament
              gameName: "ping-pong",
              rounds_json: JSON.stringify(tournamentResults),
            });

            if (winnerData) if (winnerData) {
				const loserData = [currentMatch.player1, currentMatch.player2].find(
					(p) => p?.username !== finalWinner
				);
			
				// Find avatar names by image URL
				const winnerAvatarObj = avatars.find(a => a.image === winnerData.avatar);
				const loserAvatarObj = avatars.find(a => a.image === loserData?.avatar);
			
				// Store final winner/loser details
				import("./gameLogicTournament").then((mod) => {
					mod.setFinalResult(
						finalWinner,
						winnerAvatarObj?.name || "Unknown",
						loserData?.username || "Unknown",
						loserAvatarObj?.name || "Unknown"
					);
				});
			
				showFinalScreen(finalWinner, winnerData.avatar);
			}
			
          }
        }

        return updated;
      });
    };

    const cleanup = gameLogicTournament(canvasRef, matchSession, onMatchEnd, navigate);

    return () => cleanup?.();
  }, [mode, currentMatch]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "2rem",
          backgroundColor: "white",
        }}
      >
        <button
          onClick={() => navigate("/customization-tournament")}
          className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-2 py-1 text-sm rounded-md font-medium shadow"
        >
          🔙 {t("BACK_TO_MENU")}
        </button>
        {leftAvatarImage && (
          <img
            src={leftAvatarImage}
            alt="Left Avatar"
            style={{
              width: "150px",
              height: "350px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        )}

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-black"
          style={{ backgroundColor: "#87CEEB" }}
        />

        {rightAvatarImage && (
          <img
            src={rightAvatarImage}
            alt="Right Avatar"
            style={{
              width: "150px",
              height: "350px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        )}
      </div>
    </>
  );
}
