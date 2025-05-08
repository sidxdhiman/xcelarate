"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./database/index");
const middleware_1 = __importDefault(require("./middleware/middleware"));
const router_1 = __importDefault(require("./routes/router"));
const cors = require('cors');
const app = (0, express_1.default)();
index_1.connection
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error('Error connecting to MongoDB', (error)));
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(middleware_1.default.json());
app.use(router_1.default);
exports.default = app;
