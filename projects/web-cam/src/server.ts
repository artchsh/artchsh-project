import express from 'express'
import https from 'https'
import selfsigned from 'selfsigned'
import path from 'path'

const pems = selfsigned.generate()
const app = express()
app.use(express.static(path.join(__dirname, '../', 'public')))

https.createServer({
    key: pems.private,
    cert: pems.cert,
}, app).listen(3000, () => {
    console.log('Listening on https://localhost:3000')
})
