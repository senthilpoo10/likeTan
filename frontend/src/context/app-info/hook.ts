import { useContext } from "react";
import { AppInfoContext } from "./context";
import { AppInfoIface } from "./interface";

export const useAppInfo = (): AppInfoIface => {
  const context = useContext(AppInfoContext);

  if (!context) {
    throw new Error("Unable to get app context");
  }

  return context;
};
