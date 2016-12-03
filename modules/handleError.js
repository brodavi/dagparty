function makeHandleError (io) {
  return function handleError (err) {
    io.emit('error', err)
    return console.error(err)
  }
}

module.exports = makeHandleError
