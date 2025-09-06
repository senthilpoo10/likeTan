import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { appResetPass } from "../../service";

export const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState("");
  const [error, setError] = useState<AxiosError | undefined>(undefined);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    appResetPass({ email })
      .then((response) => {
        setError(undefined);
        setBackendMessage(response.message);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex h-screen">
      {backendMessage ? (
        <div className="w-1/2 flex flex-col justify-center p-12 bg-white">
          <h5 className="text-4xl font-bold mb-6">{backendMessage}</h5>
          {error && <div className="text-red-500">Error: {error}</div>}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-500 text-white py-3 rounded mt-4"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="w-1/2 flex flex-col justify-center p-12 bg-white">
          <h2 className="text-4xl font-bold mb-6">Forgot Password?</h2>
          <p className="text-gray-600 mb-4">
            Enter your email to receive a reset link.
          </p>

          {error && (
            <div className="text-red-500 mb-4">
              Error: {error.response.data.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-4 text-sm">
            Remember your password?{" "}
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
