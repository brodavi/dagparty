const mongoose = require('mongoose')

function validate (string) {
  return true
}

const TermSchema = new mongoose.Schema({
  id: {type: String, required: true, validate: validate},
  name: {type: String, required: true, validate: validate},
  value: {type: String, required: true, validate: validate},
  depends: [{
    id: {type: mongoose.Schema.Types.ObjectId, required: false, validate: validate}
  }],
  cached: {type: String, required: false, validate: validate}
})

module.exports = mongoose.model('Term', TermSchema)
