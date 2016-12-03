function makeOnMsgSocket (socket, handleError) {
  socket.on('msg', function (data) {
    socket.emit('msg', {
      msgType: 'msg',
      data: 'you are connected'
    })
  })
}

module.exports = makeOnMsgSocket
