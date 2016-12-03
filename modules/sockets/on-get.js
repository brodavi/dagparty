const Term = require('../Term')

function makeOnGetSocket (socket, handleError) {
  socket.on('get', function (termName) {
    Term.findOne({name: termName}, function (err, term) {
      if (err) handleError(err)
      else {
        socket.emit('msg', {
          msgType: 'term',
          data: term
        })
      }
    })
  })
}

module.exports = makeOnGetSocket
