
exports.up = function(knex) {
    return knex.schema.raw(
        `CREATE TABLE users (username text NOT NULL PRIMARY KEY, password text)`
    )
    }
exports.down = function(knex) {
   
}
