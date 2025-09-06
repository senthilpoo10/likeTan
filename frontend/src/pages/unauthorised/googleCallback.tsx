import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleLoginAuth } from "../../service"; // Backend API call

export const GoogleCallback = () => {
  const navigate = useNavigate();

  //this is to prevent double calls in Strict Mode
  //this works because StrictMode doesn’t reset module-level variables between renders
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          // Send the code to your backend to exchange for tokens
          const response = await googleLoginAuth(code);
          localStorage.setItem("ping-pong-jwt", response.token); // Save the JWT
          // navigate("/menu"); // Redirect to the home page or dashboard
          window.location.href = "/menu";
        } catch (error) {
          navigate("/login"); // Redirect back to login on failure
        }
      } else {
        console.error("No code found in the URL");
        navigate("/login"); // Redirect back to login if no code is found
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex relative min-h-200 min-w-150 bg-white">
      Processing Google Login...
    </div>
  );
};

export default GoogleCallback;
