const Term = require('./Term')
const User = require('./User')
const bcrypt = require('bcrypt')
const config = require('../config')

function init () {
  Term.findOne({name: 'main'}, function (err, term) {
    if (!term) {
      const mainterm = new Term({ name: 'main', value: 'welcome to {{orgname}}!', depends: [], cached: 'welcome to dagparty!'})
      const orgnameterm = new Term({ name: 'orgname', value: 'dagparty', depends: [], cached: 'dagparty'})
      mainterm.save(function (err, mainterm) {
        console.log('saved mainterm')
      })
      orgnameterm.save(function (err, orgnameterm) {
        console.log('saved orgnameterm')
      })
    }
  })

  User.model.findOne({email: 'demo@dagparty.com'}, function (err, user) {
    if (!user) {
      const email = config.demoEmail
      const password = config.demoPassword
      const name = config.demoName
      User.createUser(email, password, name)
    }
  })
}
module.exports = init
