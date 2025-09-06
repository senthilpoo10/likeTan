import { useEffect, useRef } from "react";
import { appClient } from "./index";

export function useUserActivityTracker(shouldTrack: boolean) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!shouldTrack) return;

    const reportActivity = () => {
      const now = Date.now();
      const diff = now - lastActivityRef.current;

      // Only send update every 1 second(s) at most
      if (diff > 1000) {
        lastActivityRef.current = now;

        console.log("Send Activity Update from FrontEnd...");// Print statement

        appClient.post("/update-activity")
          .catch((err) => console.error("Failed to update activity", err));
      }
    };

    const handleActivity = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(reportActivity, 500); // debounce
    };

    // Events to listen to
    const events = ["mousemove", "keydown", "click"];
    events.forEach(e => window.addEventListener(e, handleActivity));

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [shouldTrack]);
}
