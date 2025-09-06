import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { startGame } from "../../service";
import validator from "validator";

interface AvatarInfo {
  name: string;
  image: string;
}

interface Guest {
  username: string;
  avatar: AvatarInfo | null;
  color: string | null;
}

export const CustomazationTournamentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [guestCount, setGuestCount] = useState<number>(() => {
    const stored = localStorage.getItem("guestCount");
    return stored ? parseInt(stored) : 3;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const stored = localStorage.getItem("tournamentGuests");
    return stored ? JSON.parse(stored) : [];
  });

  const [userAvatar, setUserAvatar] = useState<AvatarInfo | null>(() => {
    const saved = localStorage.getItem("userAvatar");
    return saved ? JSON.parse(saved) : null;
  });

  const [userColor, setUserColor] = useState<string | null>(() => {
    const savedColor = localStorage.getItem("userColor");
    return savedColor ? savedColor : null;
  });

  const [loggedInUsername, setLoggedInUsername] = useState("");

  const [tournamentData, setTournamentData] = useState<any>(null); //ADDED

  const [gameType, setGameType] = useState<string>(() => {
    const savedGameType = localStorage.getItem("gameType");
    return savedGameType ? savedGameType : "boring";
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false); // for user
  const [guestColorPickerOpen, setGuestColorPickerOpen] = useState<boolean[]>(
    []
  ); // for guests

  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setLoggedInUsername(payload.username);
    }
  }, []);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fromAvatar = location.state?.fromAvatar;

    if (!fromAvatar && !initialized) {
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("tournamentGuests");
      localStorage.removeItem("guestCount");
      localStorage.removeItem("userColor");
      localStorage.removeItem("gameType");
      localStorage.removeItem("tournamentData");
      localStorage.removeItem("currentCircle");

      localStorage.removeItem("guestAvatar"); // cleaning duel data
      localStorage.removeItem("guestName");

      setUserAvatar(null);
      setGuests([]);
      setGuestCount(3);
      setGameType("boring");

      setTournamentData(null); //ADDED
      
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    setGuests((prev) => {
      const updated = [...prev];
      while (updated.length < guestCount)
        updated.push({ username: "", avatar: null, color: null });
      while (updated.length > guestCount) updated.pop();
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem("guestCount", guestCount.toString());
  }, [guestCount]);

  const takenColors = [
    ...(userColor ? [userColor] : []),
    ...guests.filter((g) => g.color).map((g) => g.color!),
  ];

  const handleColorChange = (index: number, color: string) => {
    setGuests((prev) => {
      const updated = [...prev];
      updated[index].color = color;
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
  };

  const chooseAvatar = (target: "user" | "guest", guestIndex?: number) => {
    navigate("/avatar", {
      state: {
        target,
        guestIndex,
        returnTo: "/customization-tournament",
        fromAvatar: true,
      },
    });
  };

  const updateGuestUsername = (index: number, name: string) => {
    setGuests((prev) => {
      const updated = [...prev];
      updated[index].username = name;
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
  };

  const takenAvatars = [
    ...(userAvatar ? [userAvatar.name] : []),
    ...guests.filter((g) => g.avatar).map((g) => g.avatar!.name),
  ];

  useEffect(() => {
    const state = location.state as {
      selectedAvatar: AvatarInfo;
      target: "user" | "guest";
      guestIndex: number;
    };

    if (state?.selectedAvatar) {
      if (state.target === "user") {
        setUserAvatar(state.selectedAvatar);
        localStorage.setItem(
          "userAvatar",
          JSON.stringify(state.selectedAvatar)
        );
      } else if (
        state.target === "guest" &&
        typeof state.guestIndex === "number"
      ) {
        setGuests((prev) => {
          const updated = [...prev];
          updated[state.guestIndex].avatar = state.selectedAvatar;
          localStorage.setItem("tournamentGuests", JSON.stringify(updated));
          return updated;
        });
      }

      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const startGameHandler = (targetRoute: string) => {
    const guestNames = guests.map((g) => g.username.trim().toLowerCase());

    for (const name of guestNames) {
      if (!validator.isAlphanumeric(name)) {
        return alert(t("GUEST_MUST_SELECT_USERNAME"));
      }
    }

    const hasDuplicates = new Set(guestNames).size !== guestNames.length;
    if (hasDuplicates) {
      return alert(t("GUEST_NAMES_MUST_BE_UNIQUE"));
    }
    if (guests.some((g) => g.username === loggedInUsername)) {
      return alert(t("GUEST_AND_USERNAME_CAN'T_BE_THE_SAME"));
    }

    if (!userAvatar || guests.some((g) => !g.avatar)) {
      return alert(t("ALL_PLAYERS_MUST_SELECT_AVATAR"));
    }

    if (guests.some((g) => !g.username)) {
      return alert(t("GUEST_MUST_SELECT_USERNAME"));
    }

    if ((!userColor || guests.some((g) => !g.color)) && gameType !== "boring") {
      return alert(t("ALL_PLAYERS_MUST_SELECT_COLOR"));
    }

    const payload = {
      user: loggedInUsername,
      userAvatar: userAvatar.name,
      userColor: userColor,
      gameType,
      guests: guests.map((g) => ({
        username: g.username,
        avatar: g.avatar!.name,
        color: g.color,
      })),
    };

    startGame(payload)
      .then(() => {
        navigate(targetRoute, {
          state: {
            user: loggedInUsername,
            userAvatar,
            userColor,
            gameType,
            guests,
          },
        });
      })
      .catch((err) => alert(t("START_GAME_FAILED") + ": " + err.message));
  };

  const getButtonColor = (color: string | null) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "yellow":
        return "bg-yellow-500";
      case "purple":
        return "bg-purple-500";
      case "orange":
        return "bg-orange-500";
      case "gray":
        return "bg-gray-500";
      case "pink":
        return "bg-pink-500";

      default:
        return "bg-gray-300";
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-6">
        🎭 {t("CHOOSE_AVATARS")}
      </h1>

      {/* Game Customization */}
      <div className="mt-3 mb-6">
        <h2 className="text-2xl font-bold mb-2">{t("GAME_CUSTOMIZATION")}</h2>
        <div className="flex items-center gap-4">
          <div>
            <input
              type="radio"
              id="boring"
              name="gameType"
              value="boring"
              checked={gameType === "boring"}
              onChange={() => {
                setGameType("boring");
                localStorage.setItem("gameType", "boring");
              }}
            />
            <label htmlFor="boring" className="ml-2">
              {t("BORING_GAME")}
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="madness"
              name="gameType"
              value="madness"
              checked={gameType === "madness"}
              onChange={() => {
                setGameType("madness");
                localStorage.setItem("gameType", "madness");
              }}
            />
            <label htmlFor="madness" className="ml-2">
              {t("MADNESS")}
            </label>
          </div>
        </div>
      </div>

      {/* Guest Count */}
      <div className="mb-8">
        <label className="text-lg mr-2">{t("NUMBER_OF_GUESTS")}:</label>
        <select
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="text-black p-2 rounded"
        >
          {[3, 7].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Player */}
      <div className="bg-gray-800 p-6 mb-8 w-full max-w-md rounded-xl shadow-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">👤 {t("PLAYER")} 1</h2>
        <p className="mb-4 text-lg">
          {t("USERNAME")}: <strong>{loggedInUsername}</strong>
        </p>

        {userAvatar ? (
          <>
            <img
              src={userAvatar.image}
              alt={userAvatar.name}
              className="w-48 h-48 rounded-full border-4 border-blue-400 mb-2 object-contain"
            />
            <p className="capitalize mb-4">{userAvatar.name}</p>
          </>
        ) : (
          <p className="mb-4 italic text-gray-400">{t("NO_AVATAR_SELECTED")}</p>
        )}

        <button
          onClick={() => chooseAvatar("user")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          {t("CHOOSE_AVATAR")}
        </button>

        {/* Color selection */}
        <button
          onClick={() => setColorPickerOpen(!colorPickerOpen)}
          className={`mt-4 ${getButtonColor(
            userColor
          )} px-4 py-2 rounded-lg font-semibold`}
          disabled={gameType === "boring"}
        >
          {gameType === "boring" ? t("DEFAULT") : t("CHOOSE_COLOR")}
        </button>
        {colorPickerOpen && (
          <div className="mt-4">
            <select
              id="userColor"
              value={userColor || ""}
              onChange={(e) => {
                const selectedColor = e.target.value;
                setUserColor(selectedColor);
                localStorage.setItem("userColor", selectedColor);
              }}
              className="p-2 rounded text-white"
            >
              <option value="">{t("NONE")}</option>
              {[
                "red",
                "green",
                "blue",
                "yellow",
                "purple",
                "orange",
                "gray",
                "pink",
              ].map((color) => (
                <option
                  key={color}
                  value={color}
                  disabled={takenColors.includes(color)}
                  className="text-black"
                >
                  {t(`COLOR_${color.toUpperCase()}`)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Guest Players */}
      {guests.map((guest, index) => (
        <div
          key={index}
          className="bg-gray-800 p-6 mb-8 w-full max-w-md rounded-xl shadow-lg flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold mb-2">
            👥 {t("GUEST")} {index + 1}
          </h2>

          <input
            type="text"
            placeholder={t("ENTER_GUEST_USERNAME")}
            value={guest.username}
            onChange={(e) => updateGuestUsername(index, e.target.value)}
            className="mb-4 px-4 py-2 rounded text-pink-400 font-bold w-full max-w-sm text-center"
          />

          {guest.avatar ? (
            <>
              <img
                src={guest.avatar.image}
                alt={guest.avatar.name}
                className="w-48 h-48 rounded-full border-4 border-pink-400 mb-2 object-contain"
              />
              <p className="capitalize mb-4">{guest.avatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">
              {t("NO_AVATAR_SELECTED")}
            </p>
          )}

          <button
            onClick={() => chooseAvatar("guest", index)}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold"
            disabled={takenAvatars.includes(guest.avatar?.name || "")}
          >
            {t("CHOOSE_AVATAR")}
          </button>

          {/* Guest color selection */}
          <button
            onClick={() =>
              setGuestColorPickerOpen((prev) => {
                const updated = [...prev];
                updated[index] = !updated[index];
                return updated;
              })
            }
            className={`mt-4 ${getButtonColor(
              guest.color
            )} px-4 py-2 rounded-lg font-semibold`}
            disabled={gameType === "boring"}
          >
            {gameType === "boring" ? t("DEFAULT") : t("CHOOSE_COLOR")}
          </button>
          {guestColorPickerOpen[index] && (
            <div className="mt-4">
              <select
                id={`guestColor-${index}`}
                value={guest.color || ""}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="p-2 rounded text-white"
              >
                <option value="">{t("NONE")}</option>
                {[
                  "red",
                  "green",
                  "blue",
                  "yellow",
                  "purple",
                  "orange",
                  "gray",
                  "pink",
                ].map((color) => (
                  <option
                    key={color}
                    value={color}
                    disabled={takenColors.includes(color)}
                    className="text-black"
                  >
                    {t(`COLOR_${color.toUpperCase()}`)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}

      {/* Start Game Buttons */}
      <div className="flex flex-col gap-6">
        <button
          onClick={() => startGameHandler("/game/play?mode=tournament")}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
        >
          {t("START_PING_PONG")}
        </button>

        <button
          onClick={() => startGameHandler("/tournament-setup")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
        >
          {t("START_TIC_TAC_TOE")}
        </button>
      </div>
    </div>
  );
};

export default CustomazationTournamentPage;
