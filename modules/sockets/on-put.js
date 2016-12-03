const Term = require('../Term')
const OnGetAll = require('./on-get-all.js')
const renderTerm = require('../render')

function makeOnPutSocket (socket, io, handleError) {
  const opts = {
    socket: socket,
    io: io,
    handleError: handleError,
    sendTo: 'everyone',
    sendType: 'update'
  }

  function afterSave (err, term) {
    if (err) handleError(err)
    else {
      renderTerm(term.name, handleError, function (term) {
        socket.emit('msg', {
          msgType: 'putsuccess',
          data: term
        })
      })
      OnGetAll.sendTerms(opts)
    }
  }

  socket.on('put', function (term) {
    Term.findOne({name: term.name}, function (err, foundterm) {
      if (err) handleError(err)
      if (foundterm) {
        foundterm.value = term.value
        foundterm.type = term.type
        foundterm.name = term.name
        foundterm.save(afterSave)
      } else {
        const newterm = new Term(term)
console.log('newterm: ', newterm);
        // in lieu of md5 hash, just give it the db hash for now
        newterm.id = newterm._id
        newterm.save(afterSave)
      }
    })
  })
}

module.exports = makeOnPutSocket
