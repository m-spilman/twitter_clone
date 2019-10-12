
exports.up = function(knex) {
        return knex.schema.raw(
            `CREATE TABLE tweets (tweet_id SERIAL NOT NULL PRIMARY KEY, tweet text, username text NOT NULL REFERENCES users(username), tweet_to text)`
        )
        
}


exports.down = function(knex) {
  
  
}
