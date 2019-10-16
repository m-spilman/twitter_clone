
exports.up = function(knex) {
    return knex.schema.raw(
        `ALTER TABLE tweets DROP CONSTRAINT tweets_username_fkey `).then(function(){
            return knex.schema.raw(
                `ALTER TABLE tweets ADD CONSTRAINT FOREIGN KEY (username) REFERENCES users (username) `
            )
        })
  
}

exports.down = function(knex) {
  
};
