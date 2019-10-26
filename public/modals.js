document.addEventListener("DOMContentLoaded", function() {
  let modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);
});
document.addEventListener("DOMContentLoaded", function() {
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
function unfollow(page) {
  $.ajax({
    url: "/unfollow",
    type: "delete",
    data: {
      page: page
    }
  });
}
function follow(page) {
  $.ajax({
    url: "/follow",
    type: "post",
    data: {
      page: page
    }
  });
}
