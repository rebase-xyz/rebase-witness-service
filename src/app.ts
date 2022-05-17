import express from "express";
import cors from "cors";
import issue from "./routes/issue";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/issue", issue);

export default app;
