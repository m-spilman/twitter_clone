# Tweeter - Twitter clone

https://calm-earth-94528.herokuapp.com/

This is a twitter clone. Users can create a username, then tweet their thoughts to the world. There is no character cap. This program only completes the basic functions you would expect. Everything is 100% backend.
# Core
Node, Express, Boostrap, PostgresSQL, mustache (templates), bcrypt (password hashing)

# Development
Nothing too special here. This was a backend project using Bootsrap for styling and Node / Express for the backend. All data is stored in a PostgresSQL database, all passwords are hashed.
As all the various pages are similiar - Joe's tweets page is the same as Suzies page (other than the actual content) so
mustache was used as the template system. I did add a search feature to make the application more usable. The thought process here was -
'What if someone is thinking about using this and wants to see what it's all about. If they can't search for random users to see
what their pages look like, how can they explore the app before signing up?'. A search funtion was added to the homepage. This uses trigrams to complete
searches in real time. I created a database with over 1,000 users and there are 0 performance issues. I did not limit the # of results returned
as I wanted to demonstrate the function.
  The search simply uses an ajax request to the backend to return results from the database query.
  
  ```document.addEventListener("DOMContentLoaded", function() {
  const searchBar = document.forms["search_users"].querySelector("input");
  searchBar.addEventListener("keyup", function(e) {
    let term = e.target.value;
    if (term === "") {
      return;
    } else {
      $.ajax({
        url: "/data",
        type: "get",
        data: {
          query: term
        }
      }).then(extractInfo);
      function extractInfo(theInfo) {
        vomUsers = theInfo.map(function(usernames) {
          return `<a href=/user/${usernames.username} class = 'collection-item'>${usernames.username}</a>`;
        });
        document.getElementById("resultsContainer").innerHTML = vomUsers.join("");
      }
    }
  });
});
```


* I orignally called this application Word Vomit while in development, hence the 'vomUsers'

You can read about trigrams here - https://www.postgresql.org/docs/9.6/pgtrgm.html









