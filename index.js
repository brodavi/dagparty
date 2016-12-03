const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const async = require('async')
const init = require('./modules/init.js')
const webtoken = require('./modules/jwt.js')(app)
const config = require('./config')

const serveStatic = require('serve-static')
app.use(serveStatic('public', {'index': ['login.html']}))

const handleError = require('./modules/handleError')(io)

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/dagparty')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', function() {
  console.log('database open')
  init()
})

const OnRender = require('./modules/sockets/on-render.js')
const OnGetAll = require('./modules/sockets/on-get-all.js')

const makeOnMsgSocket = require('./modules/sockets/on-msg.js')
const makeOnPutSocket = require('./modules/sockets/on-put.js')
const makeOnGetSocket = require('./modules/sockets/on-get.js')
const makeOnEditSocket = require('./modules/sockets/on-edit.js')

io.on('disconnect', function () {
  console.log('got disconnect')
})

// token stuff

const jwt = require('jsonwebtoken')

io.on('connection', function (socket) {
  socket.on('authenticate', function (token) {
    const verified = jwt.verify(token, config.jwtSecret, function (err, decoded) {
      if (err) {
        console.log('error ', err)
        socket.emit('msg', {
          msgType: 'error',
          data: {
            message: 'you are not authorized',
            errors: {
              type: {
                message: 'token expired or something'
              }
            }
          }
        })
      } else {
        socket.emit('msg', {
          msgType: 'authenticated',
          data: 'you are authenticated'
        })

        OnRender.sendRenderTerm('main', socket, handleError)

        OnRender.makeOnRenderSocket(socket, handleError)
        OnGetAll.makeOnGetAllSocket(socket, handleError)

        makeOnMsgSocket(socket, handleError)
        makeOnPutSocket(socket, io, handleError)
        makeOnGetSocket(socket, handleError)
        makeOnEditSocket(socket, handleError)
      }
    })
  })
})

http.listen(9000, function () {
  console.log('listening on http://localhost:9000')
})
