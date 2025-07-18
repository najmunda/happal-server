const { createLogger, format, transports } = require('winston')
const path = require('node:path')

const logDir = 'log'

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'api-server' },
  transports: [
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejections.log') })
  ]
})

function requestLogger(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    const durationMs = Date.now() - start
    logger.log({
      level: 'info',
      type: 'http',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null,
      userId: req.user?.id || null
    })
  })
  next()
}

function errorLogger(error, req, res, next) {
  logger.log({
    level: 'error',
    type: 'error',
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || null
  })

  return res
    .status(500)
    .json({ status: 'error', message: 'Internal Server Error' })
}

const httpLogFilter = format((info) => (info.type === 'http' ? info : false))
const errorLogFilter = format((info) => (info.type === 'error' ? info : false))

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        httpLogFilter(),
        format.printf(
          (info) =>
            `${info.method} ${info.url} ${info.status} ${info.durationMs}`
        )
      )
    })
  )
  logger.add(
    new transports.Console({
      format: format.combine(
        errorLogFilter(),
        format.printf(
          (info) => `${info.method} ${info.url} ${info.message} ${info.stack}`
        )
      )
    })
  )
}

module.exports = { requestLogger, errorLogger }
