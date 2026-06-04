/**
 * 本地开发入口
 * 使用 @hono/node-server 在 Node.js 环境运行
 */
import { serve } from '@hono/node-server'
import app from './index'

const port = 8787

console.log(`BFF server running at http://localhost:${port}`)
serve({ fetch: app.fetch, port })
