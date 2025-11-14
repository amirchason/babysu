const winston = require('winston');

// Serverless-friendly logger (console only, no file writes)
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
          msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
      })
    )
  })
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'babysu-backend' },
  transports
});

module.exports = logger;
