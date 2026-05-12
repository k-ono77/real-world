import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import articleRoutes from './routes/articleRoutes'
import profilesRoutes from './routes/profilesRoutes'
import popularAuthorsRoutes from './routes/popularAuthorsRoutes'


const app = new Hono()

// siginup, login
app.route('/api/users',authRoutes)

// setting
app.route('/api/user',userRoutes)

// articles ,favorite
app.route('/api/articles',articleRoutes)

// profiles
app.route('/api/profiles',profilesRoutes)

// popular-authors
app.route('/api/popular-authors',popularAuthorsRoutes)

const port = 5000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
})