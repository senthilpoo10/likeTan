import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { startDuelGame } from "../../service";
import validator from "validator";

export const CustomazationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Initialize guestName from localStorage if available
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem("guestName") || "";
  });

  const [userAvatar, setUserAvatar] = useState<{
    name: string;
    image: string;
  } | null>(() => {
    const saved = localStorage.getItem("userAvatar");
    return saved ? JSON.parse(saved) : null;
  });

  const [guestAvatar, setGuestAvatar] = useState<{
    name: string;
    image: string;
  } | null>(() => {
    const saved = localStorage.getItem("guestAvatar");
    return saved ? JSON.parse(saved) : null;
  });

  // Save guestName to localStorage whenever it changes
  useEffect(() => {
    if (guestName) {
      localStorage.setItem("guestName", guestName);
    }
  }, [guestName]);

  const [loggedInUsername, setLoggedInUsername] = useState("");

  const [userColor, setUserColor] = useState<string | null>(() => {
    const savedColor = localStorage.getItem("userColor");
    return savedColor ? savedColor : "";
  });

  const [guestColor, setGuestColor] = useState<string | null>(() => {
    const savedColor = localStorage.getItem("guestColor");
    return savedColor ? savedColor : "";
  });

  const [gameType, setGameType] = useState<string>(() => {
    const savedGameType = localStorage.getItem("gameType");
    return savedGameType ? savedGameType : "boring";
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [guestColorPickerOpen, setGuestColorPickerOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setLoggedInUsername(payload.username);
    }
  }, []);

  useEffect(() => {
    const fromAvatar = location.state?.fromAvatar === true;

    if (!fromAvatar) {
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("guestAvatar");
      localStorage.removeItem("guestName");
      localStorage.removeItem("userColor");
      localStorage.removeItem("guestColor");
      localStorage.removeItem("points1");
      localStorage.removeItem("points2");
      localStorage.removeItem("points3");

      localStorage.removeItem("tournamentGuests"); // cleaning tournament data
      localStorage.removeItem("guestCount");

      setUserAvatar(null);
      setGuestAvatar(null);
      setGuestName("");
      setGameType("boring");
      setUserColor("NONE");
      setGuestColor("NONE");
    }
  }, []);

  useEffect(() => {
    const state = location.state as {
      selectedAvatar?: { name: string; image: string };
      target?: "user" | "guest";
    };

    if (state?.selectedAvatar && state.target) {
      if (state.target === "user") {
        setUserAvatar(state.selectedAvatar);
        localStorage.setItem(
          "userAvatar",
          JSON.stringify(state.selectedAvatar)
        );
      } else {
        setGuestAvatar(state.selectedAvatar);
        localStorage.setItem(
          "guestAvatar",
          JSON.stringify(state.selectedAvatar)
        );
      }
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem("guestName", guestName);
  }, [guestName]);

  const chooseAvatar = (target: "user" | "guest") => {
    navigate("/avatar", {
      state: { target, returnTo: "/customization" },
      replace: false,
    });
  };

  const startGameHandler = (targetRoute: string) => {
    if (!validator.isAlphanumeric(guestName)) {
      return alert(t("GUEST_MUST_SELECT_USERNAME"));
    }

    if (!userAvatar || !guestAvatar) {
      return alert(t("ALL_PLAYERS_MUST_SELECT_AVATAR"));
    }

    if (!guestName) {
      return alert(t("GUEST_MUST_SELECT_USERNAME"));
    }

    if ((!userColor || !guestColor) && gameType !== "boring") {
      return alert(t("ALL_PLAYERS_MUST_SELECT_COLOR"));
    }

    if (guestName === loggedInUsername) {
      return alert(t("GUEST_AND_USERNAME_CAN'T_BE_THE_SAME"));
    }

    startDuelGame({
      user: loggedInUsername,
      userAvatar: userAvatar.name,
      guest: guestName,
      guestAvatar: guestAvatar.name,
      userColor,
      guestColor,
      gameType,
    })
      .then(() => {
        navigate(targetRoute, {
          state: {
            user: loggedInUsername,
            guest: guestName,
            userAvatar,
            guestAvatar,
            userColor,
            guestColor,
            gameType,
          },
        });
      })
      .catch((err) => alert(`${t("FAILED_TO_START_GAME")}: ${err.message}`));
  };

  const takenColors = [userColor, guestColor];

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
      default:
        return "bg-gray-300"; // Default to gray when no color selected
    }
  };

  return (
    <div className="w-full min-h-screen text-white p-8 flex flex-col items-center">
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-6">
        🧑‍🤝‍🧑 {t("CHOOSE_AVATARS")}
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

      <div className="w-full max-w-2xl flex flex-col gap-8 items-center">
        {/* Player 1 */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👤 {t("PLAYER")} 1</h2>
          <p className="mb-4 text-lg">
            {t("USERNAME")}: <strong>{loggedInUsername}</strong>
          </p>

          {userAvatar ? (
            <>
              <img
                src={userAvatar.image}
                alt={userAvatar.name}
                className="w-32 h-32 rounded-full border-4 border-blue-400 mb-2 object-cover"
              />
              <p className="capitalize mb-4">{userAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">
              {t("NO_AVATAR_SELECTED")}
            </p>
          )}

          <button
            onClick={() => chooseAvatar("user")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            {t("CHOOSE_AVATAR")}
          </button>

          {/* Color selection button */}
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
                  localStorage.setItem("userColor", selectedColor); // Save color in localStorage
                }}
                className="p-2 rounded text-white"
              >
                <option value="">{t("NONE")}</option>
                {["red", "green", "blue", "yellow", "purple", "orange", "gray", "pink"].map(
                  (color) => (
                    <option
                      key={color}
                      value={color}
                      disabled={takenColors.includes(color)}
                      className="text-black" // makes option text visible when open
                    >
                      {t(`COLOR_${color.toUpperCase()}`)}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>

        {/* Guest Player */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-2">👥 {t("GUEST_PLAYER")}</h2>

          <input
            type="text"
            placeholder={t("ENTER_GUEST_USERNAME")}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mb-4 px-4 py-2 rounded text-pink-400 font-bold w-full max-w-sm text-center"
          />

          {guestAvatar ? (
            <>
              <img
                src={guestAvatar.image}
                alt={guestAvatar.name}
                className="w-32 h-32 rounded-full border-4 border-pink-400 mb-2 object-cover"
              />
              <p className="capitalize mb-4">{guestAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">
              {t("NO_AVATAR_SELECTED")}
            </p>
          )}

          <button
            onClick={() => chooseAvatar("guest")}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold"
          >
            {t("CHOOSE_AVATAR")}
          </button>

          {/* Guest Color selection button */}
          <button
            onClick={() => setGuestColorPickerOpen(!guestColorPickerOpen)}
            className={`mt-4 ${getButtonColor(
              guestColor
            )} px-4 py-2 rounded-lg font-semibold`}
            disabled={gameType === "boring"}
          >
            {gameType === "boring" ? t("DEFAULT") : t("CHOOSE_COLOR")}
          </button>
          {guestColorPickerOpen && (
            <div className="mt-4">
              <select
                id="guestColor"
                value={guestColor || ""}
                onChange={(e) => {
                  const selectedColor = e.target.value;
                  setGuestColor(selectedColor);
                  localStorage.setItem("guestColor", selectedColor); // Save color in localStorage
                }}
                className="p-2 rounded text-white"
              >
                <option value="">{t("NONE")}</option>
                {["red", "green", "blue", "yellow", "purple", "orange", "gray", "pink"].map(
                  (color) => (
                    <option
                      key={color}
                      value={color}
                      disabled={takenColors.includes(color)}
                      className="text-black" // makes option text visible when open
                    >
                      {t(`COLOR_${color.toUpperCase()}`)}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>

        {/* Start Game Buttons */}
        <button
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
          onClick={() => startGameHandler("/game/play?mode=duel")}
        >
          {t("START_PING_PONG")}
        </button>

        <button
          onClick={() => startGameHandler("/duel-setup")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
        >
          {t("START_TIC_TAC_TOE")}
        </button>
      </div>
    </div>
  );
};

export default CustomazationPage;
