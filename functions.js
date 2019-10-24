function addUser(username, password) {
    return db("users").insert({ username: username, password: password });
  }

module.exports = {addUser}