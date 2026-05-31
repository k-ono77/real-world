import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import articleRoutes from './routes/articleRoutes'
import profilesRoutes from './routes/profilesRoutes'
import popularAuthorsRoutes from './routes/popularAuthorsRoutes'
import tagsRoute from './routes/tagsRoutes'

const app = new Hono()

app.route('/api/users',authRoutes)

app.route('/api/user',userRoutes)

app.route('/api/articles',articleRoutes)

app.route('/api/profiles',profilesRoutes)

app.route('/api/popular-authors',popularAuthorsRoutes)

app.route('/api/tags',tagsRoute)

const port = 5000

console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
})