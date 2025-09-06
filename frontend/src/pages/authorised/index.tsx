import { useAppInfo } from "../../context";
export { MenuPage } from "./menu";
export { ProfilePage } from "./profile";
export { ConnectionsPage } from "./connections";
export { CustomazationPage } from "./customization";
export { CustomazationTournamentPage } from "./customization-tournament";
export { GameStats } from "./gamestats";

export const Dashboard = () => {
  const appInfo = useAppInfo();

  return (
    <div>
      This is dashboard {JSON.stringify(appInfo)}
      <button
        onClick={() => {
          localStorage.removeItem("ping-pong-jwt");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
};
