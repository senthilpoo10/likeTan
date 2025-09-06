import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getUserProfile,
  getGamestatsProfile,
  getUserGames,
} from "../../service/userService";
import { UserProfile, Game, Match } from "../../service/interface";
import GameStatsChart from "../../components/GameStatsCharts";
import { avatars } from "../general/avatar";

export const GameStats: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [chartButton, setChartButton] = useState<string>("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProfile, fetchedProfiles] = await Promise.all([
          getUserProfile(),
          getGamestatsProfile(),
        ]);

        setProfile(fetchedProfile);
        setProfiles(fetchedProfiles);

        console.debug(fetchedProfiles);

        const fetchedGames = await getUserGames(fetchedProfile.username);
        const parsedGames = fetchedGames.map((game) => ({
          ...game,
          rounds_json:
            typeof game.rounds_json === "string"
              ? JSON.parse(game.rounds_json)
              : game.rounds_json,
        }));
        setUserGames(parsedGames);
      } catch (err) {
        console.error("Error during data fetching:", err);
        setError(t("FAILED_TO_LOAD_PROFILE"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    localStorage.removeItem("userAvatar");
    localStorage.removeItem("guestAvatar");
    localStorage.removeItem("guestName");
    localStorage.removeItem("guests");
    localStorage.removeItem("guestCount");
  }, []);

  const findAvatar = (match_avatar: string) => {
    const avatar = avatars.find((avatar) => avatar?.name === match_avatar);
    return avatar ? avatar.image : "/profile-pics/default-profile.jpg";
  };

  const renderTournamentBracket = (rounds_json: Match[][]) => {
    return (
      <div className="tournament-bracket grid grid-cols-4 gap-4">
        {rounds_json.map((round, index) => (
          <div key={index} className="round bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white text-center mb-2">
              {t("ROUND")} {index + 1}
            </h3>
            {round.map((match, matchIndex) => (
              <div
                key={matchIndex}
                className="match bg-gray-700 p-2 rounded-lg mb-2"
              >
                <div className="player flex items-center mb-2">
                  <img
                    src={findAvatar(match.p1_avatar)}
                    alt={match.p1_username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="text-white">
                    {match.p1_username} {match.p1_wins || 0}
                  </span>
                </div>
                <div className="player flex items-center">
                  <img
                    src={findAvatar(match.p2_avatar)}
                    alt={match.p2_username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="text-white">
                    {match.p2_username} {match.p2_wins || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading || !profile) {
    return <div></div>;
  }

  const toggleGameDetails = (id: number) => {
    setExpandedGameId(expandedGameId === id ? null : id);
  };

  const sortedPlayers = profiles.sort((a, b) => {
    if (b.wins === a.wins) return a.losses - b.losses;
    return b.wins - a.wins;
  });

  const adjustToTimezonePlus3 = (dateString: string): string => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Add 3 hours

    // Format the date manually to ensure the timezone adjustment is reflected
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Format as "YYYY-MM-DD HH:mm:ss"
  };

  return (
    <div
      className="w-full h-full min-h-screen text-black min-w-700px  relative p-8"
      style={{
        minWidth: "900px", // Adjust the value as needed
      }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <div className="bg-stone-200 flex flex-col items-center bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center border-b-2 border-gray-400 pb-4 w-full">
          {t("GAME_STATS")}
        </h1>

        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="text-center">
            <img
              src={profile.profilePic || "/profile-pics/default-profile.jpg"}
              alt="avatar"
              className="w-45 h-45 rounded-full border-4 border-white object-cover mx-auto"
            />
          </div>
          <div className="text-left">
            <p className="text-xl">
              <strong>{t("USERNAME")}:</strong> {profile.username}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("EMAIL")}:</strong> {profile.email}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("WINS")}:</strong> {profile.wins}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("LOSSES")}:</strong> {profile.losses}
            </p>
          </div>
        </div>

        <div className="flex p-10 gap-10">
          <GameStatsChart
            key={`wins-chart-${profile.username}`}
            labels={sortedPlayers.map((p) => p.username)}
            data={sortedPlayers.map((p) => p.wins)}
            title={t("WINS")}
            type={chartButton}
          />
          <GameStatsChart
            key={`losses-chart-${profile.username}`}
            labels={sortedPlayers.map((p) => p.username)}
            data={sortedPlayers.map((p) => p.losses)}
            title={t("LOSSES")}
            type={chartButton}
          />
        </div>

        <button
          className="w-30 text-center bg-[#56c2c2] rounded-xl p-2 text-gray-100"
          onClick={() =>
            setChartButton((prev) => (prev === "bar" ? "pie" : "bar"))
          }
        >
          {t("SWITCH_CHART_STYLE") || "Switch Chart Style"}
        </button>

        <hr className="my-6 border-gray-600 w-full" />

        <div className="bg-stone-900 bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-2xl text-white">
          <h1 className="text-3xl font-semibold mb-4 text-center">
            {t("GAME_LEADERBOARD")}
          </h1>
          <table className="w-full text-left border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-600 px-4 py-2">
                  {t("RANK")}
                </th>
                <th className="border border-gray-600 px-4 py-2">
                  {t("PLAYER")}
                </th>
                <th className="border border-gray-600 px-4 py-2">
                  {t("WINS")}
                </th>
                <th className="border border-gray-600 px-4 py-2">
                  {t("LOSSES")}
                </th>
                <th className="border border-gray-600 px-4 py-2">
                  {t("POINTS")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr key={player.username} className="hover:bg-gray-700">
                  <td className="border border-gray-600 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {player.username}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {player.wins}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {player.losses}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {player.wins + player.losses / 2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="my-6 border-gray-600 w-full" />

        <div className="bg-stone-900 w-7/8 bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-2xl text-white">
          <h1 className="text-3xl font-semibold mb-4 text-center">
            {t("GAME_HISTORY")}
          </h1>
          {userGames.map((game) => (
            <div key={game.id_game} className="mb-4">
              <button
                onClick={() => toggleGameDetails(game.id_game)}
                className="w-full text-left bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {adjustToTimezonePlus3(game.date)} - {game.game_name}
              </button>
              {expandedGameId === game.id_game && (
                <div className="bg-gray-700 text-white p-4 mt-2 rounded-lg">
                  <h2 className="text-xl font-bold mb-2">
                    {t("GAME_DETAILS")}
                  </h2>
                  {renderTournamentBracket(game.rounds_json)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameStats;
