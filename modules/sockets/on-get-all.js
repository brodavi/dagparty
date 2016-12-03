const Term = require('../Term')

function sendTerms (options) {
  const socket = options.socket
  const io = options.io
  const handleError = options.handleError
  const sendTo = options.sendTo
  const sendType = options.sendType

  Term.find(function (err, terms) {
    if (err) handleError(err)
    else {
      if (sendTo === 'everyone') {
        if (sendType === 'terms') {
          console.log('sending all terms to everyone')
          io.emit('msg', {
            msgType: 'terms',
            data: terms
          })
        }
        else if (sendType === 'update') {
          console.log('updating all terms to everyone')
          io.emit('msg', {
            msgType: 'updateterms',
            data: terms
          })
        }
      } else if (sendTo === 'one') {
        if (sendType === 'terms') {
          console.log('sending all terms to one')
          socket.emit('msg', {
            msgType: 'terms',
            data: terms
          })
        }
        else if (sendType === 'update') {
          console.log('updating all terms to one')
          socket.emit('msg', {
            msgType: 'updateterms',
            data: terms
          })
        }
      }
    }
  })
}

function makeOnGetAllSocket (socket, handleError) {
  socket.on('getAll', function () {
    const opts = {
      socket: socket,
      io: null,
      handleError: handleError,
      sendTo: 'one',
      sendType: 'terms'
    }

    sendTerms(opts)
  })
}

module.exports = {
  sendTerms: sendTerms,
  makeOnGetAllSocket: makeOnGetAllSocket
}
