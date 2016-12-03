const Term = require('./Term')
const async = require('async')

function flattenArrayOfArrays (a, r) {
  if (!r) { r = [] }
  for (var i = 0; i < a.length; i++) {
    if (a[i].constructor == Array) {
      flattenArrayOfArrays(a[i], r)
    } else {
      r.push(a[i])
    }
  }
  return r
}

function isMathSymbol (t) {
  return t.match(/^\*$|^\+$|^\-$|^\/$/g)
}

function isLogicSymbol (t) {
  return t.match(/\||\&|\!|\=|\<|\>/g)
}

function isWhiteSpace (t) {
  return t.match(/\ +/g)
}

function isNewLine (t) {
  return t.match(/\n/g)
}

function renderTerm (termName, handleError, cbprime) {

  function iterate (termName, next) {
    Term.findOne({name: termName}, function (err, term) {
      if (err) handleError(err)

      if (!term) {
        return next([{
          type: 'undefined',
          value: termName
        }])
      }

      const allterms = term.value
        .split(/(\{{2}[a-z0-9.]+\}{2})|(\<{2}[a-z0-9.]+\>{2})|(\s)/g)
        .filter(function (t) {
          return t && t !== ''
        })

      const ast = allterms.map(function (t, i) {
        if (t.match(/\{{2}.+\}{2}/)) {
          return {
            type: 'recurse',
            value: t.replace(/\{|\}/g, '')
          }
        }
        else if (t.match(/\<{2}.+\>{2}/)) {
          return {
            type: 'link',
            value: t.replace(/\<|\>/g, '')
          }
        } else {
          const parsed = parseFloat(t, 10)
          if (isNaN(parsed)) {
            if (isMathSymbol(t)) {
              return {
                type: 'mathsymbol',
                value: t
              }
            } else if (isLogicSymbol(t)) {
              return {
                type: 'logicsymbol',
                value: t
              }
            } else if (isWhiteSpace(t)) {
              return {
                type: 'whitespace',
                value: t
              }
            } else if (isNewLine(t)) {
              return {
                type: 'newline',
                value: t
              }
            } else {
              return {
                type: 'string',
                value: t
              }
            }
          } else { // we have a potential real number.. but let's check previous...
            if (allterms[i - 1] &&
               !isMathSymbol(allterms[i - 1]) && // previous is not a math symbol
               !isLogicSymbol(allterms[i - 1]) && // nor a logic symbol
                 (
                   isWhiteSpace(allterms[i - 1]) &&  // nor string -> whitespace
                   allterms[i - 2] &&                 // nor string -> whitespace
                   !isMathSymbol(allterms[i - 2]) &&  // nor string -> whitespace
                   !isLogicSymbol(allterms[i - 2]) && // nor string -> whitespace
                   !isWhiteSpace(allterms[i - 2])     // nor string -> whitespace
                 )
               ) {
              // previous is a string, so this 'number', is actually a string too
              return {
                type: 'string',
                value: t
              }
            } else {
              // else it is really a number
              return {
                type: 'number',
                value: t
              }
            }
          }
        }
      })

      let parsed = []

      async.eachOfSeries(ast, function (term, i, cb) {
        if (term.type === 'recurse') {
          iterate(term.value, function (iterated) {
            parsed.push(iterated)
            cb()
          })
        } else {
          parsed.push(term)
          cb()
        }
      }, function (err) {
        if (err) {
          // something produced an error, all processing will now stop.
          console.log('something failed')
          return socket.emit('error', err)
        }

        const flat = flattenArrayOfArrays(parsed)

        const math = flat
          .every(function (t) {
            return t.type === 'number' ||
              t.type === 'mathsymbol' ||
              t.type === 'logicsymbol' ||
              t.type === 'whitespace'
          })

        if (math) {
          const joined = flat.map(function (x) {
            return x.value
          }).join('')

          const evald = eval(joined)

          if (evald === true || evald === false) next([{
            type: 'bool',
            value: evald
          }])
          else next([{
            type: 'number',
            value: evald
          }])
        } else {

          let concatted = []

          function goodtomerge (term) {
            return term
              && term.type !== 'link'
              && term.type !== 'number'
              && term.type !== 'bool'
              && term.type !== 'undefined'
              && term.type !== 'newline'
          }

          for (var x = 0; x < flat.length; x++) {
            let term = flat[x]

            if (goodtomerge(term)) { // if this one
              if (goodtomerge(flat[x-1])) { // and the last one
                let previous = concatted[concatted.length - 1]
                // can be merged, then merge them
                previous.value = previous.value + term.value
                previous.type = 'string'
              } else {
                concatted.push(term)
              }
            } else {
              concatted.push(term)
            }
          }

          next(concatted)
        }

      })
    })
  }

  iterate(termName, function (rendered) {
    cbprime({
      name: termName,
      value: rendered
    })
  })
}

module.exports = renderTerm
