
exports.up = function(knex) {
    
        return knex.schema.raw(
            `ALTER TABLE users ADD following text `)
      
    }

exports.down = function(knex) {
    return knex.schema.raw(
        `ALTER TABLE users DROP COLUMN following`
    )
  
}

