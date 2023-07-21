const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')
const url = require('url')

const app = express()

app.use(cors())

app.get('/api/uno', (req, res) => {
    res.json({ message: 'UnoGame API' })
})

const server = http.createServer(app)

server.listen(3000, () => {
    console.log('Server listening on port 3000')
})

const wss = new WebSocket.Server({ noServer: true })

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname

    if (pathname === '/ws/uno') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request)
        })
    } else {
        socket.destroy()
    }
})

wss.on('connection', (ws) => {
    console.log('New client connected')

    ws.on('message', (message) => {
        console.log('Received: ' + message)
        let i = 0
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
            if (message.type === 'start' && i < 1 && client !== ws) {
                client.send({ action: 'start' })
            }
        })
    })

    ws.on('close', (e) => {
        console.log('Client disconnected')
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(new Buffer.from(JSON.stringify({ type: 'stop' })))
            }
        })
        i = 0
    })
})
