import express, { Router } from "express";
import { connection } from "./database/index";
import bodyParser from "./middleware/middleware";
import routers from "./routes/router";
const cors = require('cors');

const app = express();
connection
    .then(() => console.log("Connected to MongoDB"))
    .catch((error:Error) => console.error('Error connecting to MongoDB', (error)));


// app.use(cors({
//     origin: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
// }));

// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://192.168.1.6:8081',
    'http://192.168.1.6:8082', 
  ],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(routers);

export default app;
