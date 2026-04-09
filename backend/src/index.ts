import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/authRoutes'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono from Docker!' })
})

app.route('/api/users',authRoutes);

const port = 5000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
})