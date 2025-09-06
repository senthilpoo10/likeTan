import { AppInfoIface } from "./interface";
import { createContext } from "react";

export const AppInfoContext = createContext<undefined | AppInfoIface>(
  undefined
);
