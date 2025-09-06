import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppInfoIface } from "./context/app-info/interface";
import { getAppInfo } from "./service";
import { AppInfoContext } from "./context/app-info/context";
import { authorised, unauthorised, general, tictactoe } from "./pages";
import { useUserActivityTracker } from "./service/useUserActivityTracker";

import GameEndingPage from "./pages/game/game-end-page";
import PongGame from "./pages/game/PongGame";

function App() {
  const [loading, setLoading] = useState(true);
  const [appInfo, setAppInfo] = useState<AppInfoIface | undefined>(undefined);

  useUserActivityTracker(!!appInfo); // Only track if user is logged in

  useEffect(() => {
    getAppInfo()
      .then(setAppInfo)
      .catch((err) => {
        if (err.response?.status !== 401) {
          console.error(err); // only log if not 401
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="w-full h-screen bg-white">
        {" "}
        {/* <p className="text-4xl font-bold mb-6">App is loading</p> */}
      </div>
    );

  return (
    <AppInfoContext.Provider value={appInfo}>
      <Router>
        <Routes>
          {appInfo ? (
            <>
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="/menu" element={<authorised.MenuPage />} />
              <Route path="/profile" element={<authorised.ProfilePage />} />
              <Route
                path="/connections"
                element={<authorised.ConnectionsPage />}
              />
              <Route
                path="/customization"
                element={<authorised.CustomazationPage />}
              />
              <Route
                path="/customization-tournament"
                element={<authorised.CustomazationTournamentPage />}
              />
              <Route path="/gamestats" element={<authorised.GameStats />} />
              <Route path="/avatar" element={<general.AvatarPage />} />
              <Route
                path="/user/:username"
                element={<general.UserProfilePage />}
              />
              <Route
                path="/tic-tac-toe-duel/:gameNumber"
                element={<tictactoe.TicTacToeDuel />}
              />
              <Route
                path="/tic-tac-toe-tournament/:gameNumber"
                element={<tictactoe.TournamentGamePage />}
              />
              <Route
                path="/duel-setup"
                element={<tictactoe.DuelSetup />}
              />
              <Route
                path="/tournament-setup"
                element={<tictactoe.TournamentSetupPage />}
              />
              <Route
                path="show_a_winner"
                element={<tictactoe.ShowAWinner />}
              />
              <Route
                path="show_a_tournament_winner"
                element={<tictactoe.ShowATournamentWinner />}
              />
              // "/game/play?mode=duel"
              <Route path="/game/play" element={<PongGame />} 
			  />
			  //PONG ending page
			  <Route path="/game/game-end-page" element={<GameEndingPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<unauthorised.LandingPage />} />
              <Route path="/login" element={<unauthorised.LogInPage />} />
              <Route path="/register" element={<unauthorised.RegisterPage />} />
              <Route
                path="/reset-password"
                element={<unauthorised.ResetPasswordPage />}
              />
              <Route
                path="/change-password"
                element={<unauthorised.ChangePasswordPage />}
              />
              <Route
                path="/auth/google/callback"
                element={<unauthorised.GoogleCallback />}
              />
            </>
          )}
        </Routes>
      </Router>
    </AppInfoContext.Provider>
  );
}

export default App;
