const renderTerm = require('../render')

function sendRenderTerm(termName, socket, handleError) {
  renderTerm(termName, handleError, function (term) {
    socket.emit('msg', {
      msgType: 'render',
      data: term
    })
  })
}

function makeOnRenderSocket (socket, handleError) {
  socket.on('render', function (msg) {
    renderTerm(msg, handleError, function (term) {
      socket.emit('msg', {
        msgType: 'render',
        data: term
      })
    })
  })
}

module.exports = {
  renderTerm: renderTerm,
  sendRenderTerm: sendRenderTerm,
  makeOnRenderSocket: makeOnRenderSocket
}
