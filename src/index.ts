import dotenv from "dotenv";
import app from "./app";

dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`SIWE Github Verifier listening on ${process.env.PORT}`);
});
