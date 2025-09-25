import express from "express";
import { connection } from "./database/index";
import bodyParser from "./middleware/middleware";
import routers from "./routes/router";
import cors from "cors";

const app = express();

connection
  .then(() => console.log("Connected to MongoDB"))
  .catch((error: Error) =>
    console.error("Error connecting to MongoDB", error)
  );

// ✅ Correct CORS setup

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://192.168.1.6:8081',
    'http://192.168.1.6:8082',
    'https://nonwoven-adan-drivingly.ngrok-free.dev'
  ],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(routers);

export default app;

