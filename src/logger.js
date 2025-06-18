const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'api-server' },
  transports: [
    new transports.File({ filename: 'log/combined.log' }),
    new transports.File({ filename: 'log/error.log', level: 'error' })
  ]
})

const httpLogFilter = format((info) => (info.type === 'http' ? info : false))

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
}

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

module.exports = { requestLogger }
