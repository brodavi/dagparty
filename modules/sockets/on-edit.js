const Term = require('../Term')

function makeOnEditSocket (socket, handleError) {
  socket.on('edit', function (termName) {
    Term.findOne({name: termName}, function (err, term) {
      if (err) handleError(err)
      else {
        socket.emit('msg', {
          msgType: 'edit',
          data: term
        })
      }
    })
  })
}

module.exports = makeOnEditSocket
