import express, { Router } from "express";
import { connection } from "./database/index";
import bodyParser from "./middleware/middleware";
import routers from "./routes/router";
const cors = require('cors');

const app = express();
connection
    .then(() => console.log("Connected to MongoDB"))
    .catch((error:Error) => console.error('Error connecting to MongoDB', (error)));


app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    // allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(routers);

export default app;
