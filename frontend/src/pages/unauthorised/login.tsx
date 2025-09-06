import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { appLogin, appLoginCode } from "../../service";
import validator from "validator";

export const LogInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError | undefined>(undefined);
  const [backendMessage, setBackendMessage] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validator.isAlphanumeric(username)) {
      setError({
        response: { data: { error: "Invalid username format" } },
      } as AxiosError);
      return;
    }
    setIsLoading(true);
    appLogin({ username, password })
      .then((response) => {
        setError(undefined);
        setBackendMessage(response.message);
      })
      .catch((err: AxiosError) => {
        setError(err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    appLoginCode({ username, code })
      .then((response) => {
        localStorage.setItem("ping-pong-jwt", response.token);
        navigate("/");
        window.location.reload();
      })
      .catch((err: AxiosError) => {
        setError(err);
      })
      .finally(() => setIsLoading(false));
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Add your Client ID here
  const redirectUri = "https://gang-gang-gang.serveo.net/auth/google/callback"; // The redirect URI you defined in your backend
  // Google OAuth Client ID
  const googleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      include_granted_scopes: "true",
      access_type: "offline",
      prompt: "consent",
    });

    console.debug("in google login redirect to google page");
    console.debug("VITE_GOOGLE_CLIENT_ID: ", clientId);

    window.location.href = `${baseUrl}?${params.toString()}`;
  };

  // console.log(error); // check if we need this

  return (
    <div className="flex h-screen bg-white">
      {backendMessage ? (
        <>
          <div className="w-5/13 flex flex-col justify-center p-12 bg-white max-w-2xl min-w-md mx-auto">
            <h5 className="text-4xl font-bold mb-6">{backendMessage}</h5>
            {error ? (
              <div className="text-red-500 mb-3 -mt-4">
                Error: {error?.response?.data?.error}
              </div>
            ) : null}
            <form onSubmit={handleCode} className="space-y-4">
              <input
                type="text"
                placeholder="Code"
                className="w-full p-3 border rounded"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded"
              >
                Verify
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="w-5/13 flex flex-col justify-center p-12 bg-white max-w-2xl min-w-md mx-auto">
            <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
            {error ? (
              <div className="text-red-500 mb-3 -mt-4">
                Error: {error?.response?.data?.error}
              </div>
            ) : null}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 rounded cursor-pointer"
              >
                Log In
              </button>
            </form>

            {/* Google Auth */}
            <button
              className="w-full bg-green-500 mt-2 text-white py-3 rounded flex items-center justify-center gap-3 cursor-pointer"
              onClick={googleLogin}
            >
              Sign in with Google
              <img
                src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
                className="h-6 w-6"
              />
            </button>

            <p className="mt-4 text-sm">
              Don't have an account?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </span>
            </p>
            <p
              className="mt-2 text-sm text-gray-500 cursor-pointer"
              onClick={() => navigate("/reset-password")}
            >
              Forgot Password?
            </p>
          </div>
        </>
      )}

      {/* Right Section */}
      <div
        className="w-8/13 bg-cover bg-center"
        style={{ backgroundImage: "url('background/login.png')" }}
      ></div>
    </div>
  );
};
