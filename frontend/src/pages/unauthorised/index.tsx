import { useNavigate } from "react-router-dom";
export { LogInPage } from "./login";
export { RegisterPage } from "./register";
export { ResetPasswordPage } from "./reset-password";
export { ChangePasswordPage } from "./change-password";
export { GoogleCallback } from "./googleCallback";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-screen bg-cover bg-center animate-bgMove"
      style={{
        backgroundImage: "url(/background/front_page.jpg)",
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      <div className="relative h-screen w-full flex flex-col items-center justify-center text-gray-900">
        <div className="relative z-10 text-center px-6 bg-white bg-opacity-50 backdrop-blur-md rounded-xl p-6 shadow-2xl flex flex-col justify-center items-center">
          <h1 className="text-5xl md:text-5xl text-orange-600 text-center font-extrabold mb-4 drop-shadow-lg">
              🏓 Smash, Spin, Win <br />
              - Gang Gang Gang Style! 🏓
          </h1>
          <p className="text-lg md:text-lg max-w-2xl mx-auto mb-6 text-gray-800 font-medium">
            Test your reflexes and skills 💪
            <br />
            in the ultimate Ping Pong showdown! 🔥
            <br />
            Join the competition, 🏅
            <br />
            rise through the ranks, ⬆️
            <br />
            and become the ultimate champion. 🏆
            <br />
            Enter the Ping-Pocalypse 🏓
            <br />
            and show them who’s the boss! 👑
            <br />
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition shadow-lg"
              aria-label="Log in"
            >
              🎟 Join the Gang Gang Gang!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
