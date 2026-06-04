import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { metalsRoutes } from './routes/metals'
import { fundsRoutes } from './routes/funds'
import { exchangeRoutes } from './routes/exchange'

const app = new Hono()

// CORS 中间件
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://fund-monitor.pages.dev'],
    allowMethods: ['GET'],
    allowHeaders: ['Content-Type', 'X-TwelveData-Key'],
    maxAge: 86400,
  })
)

// 健康检查
app.get('/', (c) => c.json({ status: 'ok', service: 'fund-monitor-bff' }))

// 路由
app.route('/api/metals', metalsRoutes)
app.route('/api/funds', fundsRoutes)
app.route('/api', exchangeRoutes)

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// 错误处理
app.onError((err, c) => {
  console.error('BFF Error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
