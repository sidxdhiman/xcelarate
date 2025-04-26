"use strict";
var winston = require('winston');
var path = require('path');
var logPath = __dirname;
const tsFormat = () => (new Date().toISOString());
const errorLog = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, 'logger.log'),
            format: winston.format.combine(winston.format.timestamp({ format: tsFormat }), winston.format.json()),
            level: 'info'
        })
    ]
});
const accessLog = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, 'logger.log'),
            format: winston.format.combine(winston.format.timestamp({ format: tsFormat }), winston.format.json()),
            level: 'info'
        })
    ]
});
module.exports = {
    errorLog: errorLog,
    accessLog: accessLog
};
