// server/server.js
import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()
app.use(cors())

app.get('/api/reverse', async (req, res) => {
  const { lat, lng } = req.query

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`

  try {
    const result = await fetch(url, {
      headers: { 'Accept-Language': 'ja' }
    })

    const text = await result.text()   // ★ JSON ではなく text として受け取る

    // ★ JSON かどうか判定する
    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      console.error('Nominatim returned non-JSON (likely 429):', text)
      return res.status(429).json({ error: 'Rate limit exceeded', raw: text })
    }

    res.json(data)

  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Failed to fetch address' })
  }
})

app.listen(3001, () => console.log('API server running on port 3001'))
