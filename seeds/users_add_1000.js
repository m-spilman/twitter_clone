
const users = require('./users_1000.json')
exports.seed = function(knex) {
  
      return knex("users").insert(users)

    
}

