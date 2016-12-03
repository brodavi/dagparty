const jwt = require('jsonwebtoken')
const cors = require('cors')
const bodyParse = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('./User')
const config = require('../config')

function webtoken (app) {
  app.use(cors())
  app.use(bodyParse.json())

  app.post('/login', function (req, res) {
    const email = req.body.email || null;
    const password = req.body.password || null;

    User.model.findOne({email: email}, function (err, user) {
      if (err) {
        return res.status(500).send(err);
      }

      if (user) {
        bcrypt.compare(password, user.password, function (err, data) {
          if (err) {
            return res.status(500).send(err)
          }

          if (data) {
            // create a jwt for this user
            const token = jwt.sign(user, config.jwtSecret, { expiresIn: '2 days' })

            // assign this temporary token to this user for verification and identification
            user.token = token

            res.json({token: token})
          } else {
            res.status(401).send('Not authorized.')
          }
        })
      } else {
        return res.status(401).send('Not authorized.')
      }
    })
  })

  app.post('/user', function (req, res) {
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name

    User.createUser(email, password, name, req, res)
  })
}

module.exports = webtoken
