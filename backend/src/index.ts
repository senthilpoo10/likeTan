import { app } from "./app";
import { Env } from "./env";

export const start = async () => {
  try {
    await app.listen({ port: Env.Port, host: Env.Host });
    // console.log(`Server running on http://${Env.Host}:${Env.Port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
