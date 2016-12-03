const mongoose = require('mongoose')
const crypto = require('crypto')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
  email: {type: String, required: true, validate: validate},
  password: {type: String, required: true, validate: validate},
  name: {type: String, required: true, validate: validate},
  lastNote: {type: String, required: false, validate: validate},
  token: {type: String, required: false, validate: validate}
})

const User = mongoose.model('User', UserSchema)

function createUser (email, password, name, req, res) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      const user = new User({
        email: email,
        password: hash,
        name: name
      })

      user.save(function (err) {
        if (err) {
          if (req) {
            res.status(500).send(err)
          }
        }
        else {
          if (req) {
            res.status(200).send()
          }
        }
      })
    })
  })
}

function validate (string) {
  return true
}

module.exports = {
  createUser: createUser,
  model: User
}
