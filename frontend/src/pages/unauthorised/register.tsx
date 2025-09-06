import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { appRegister } from "../../service";
import validator from "validator";

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError | undefined>(undefined);
  const [backendMessage, setBackendMessage] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateInput = (): string | undefined => {
    if (!validator.isAlphanumeric(username)) {
      return "Username must contain only letters and numbers.";
    }
    if (username.length < 3 || username.length > 16) {
      return "Username must be between 3 and 16 characters.";
    }
    if (!validator.isEmail(email)) {
      return "Invalid email format.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (/\s/.test(password)) {
      return "Password must not contain spaces.";
    }
    return undefined;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const validError = validateInput();
    if (validError) {
      setError({
        response: { data: { error: validError } },
      } as AxiosError);
      return;
    }
    setIsLoading(true);
    appRegister({ username, password, email })
      .then((response) => {
        setError(undefined);
        setBackendMessage(response.message);
      })
      .catch((err: AxiosError) => {
        setError(err);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex h-screen">
      {backendMessage ? (
        <div className="w-1/2 flex flex-col justify-center p-12 bg-white">
          <h5 className="text-4xl font-bold mb-6">{backendMessage}</h5>
          {error ? (
            <div className="text-red-500 mb-3 -mt-4">
              Error: {error?.response?.data?.error || "Something went wrong"}
            </div>
          ) : null}
          {/* {error ? <div>error: {error.response.data.error}</div> : null} */}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-500 text-white py-3 rounded mt-4"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="w-1/2 flex flex-col justify-center p-12 bg-white">
          <h2 className="text-4xl font-bold mb-6">
            Join the Ping Pong Championship!
          </h2>
          {error ? (
            <div className="text-red-500 mb-3 -mt-4">
              Error: {error?.response?.data?.error || "Something went wrong"}
            </div>
          ) : null}
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Username (letters and digits, 3 to 16 symbols)"
              className="w-full p-3 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (at least 6 symbols)"
              className="w-full p-3 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 rounded"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log In
            </span>
          </p>
        </div>
      )}

      {/* Right Section */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/background/login.png')" }}
      ></div>
    </div>
  );
};
