import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono from Docker!' })
})

// siginup, login
app.route('/api/users',authRoutes);

// setting, 
app.route('/api/user',userRoutes)

const port = 5000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
})