const tweets = require('./tweets.json')
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('tweets').del()
    .then(function () {
      // Inserts seed entries
      return knex("tweets").insert(tweets)

    });
};
