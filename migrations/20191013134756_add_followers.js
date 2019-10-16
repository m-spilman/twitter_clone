
exports.up = function(knex) {
    return knex.schema.raw(
        `UPDATE users set following = 'admin'
        `)
    
  
}



exports.down = function(knex) {
    
        return knex.schema.raw(
            `UPDATE users set following = 'null'
            `)
        
      
  
}
