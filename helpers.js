

// helper function to find the email
function emailExists(email, userDB) {
  return Object.values(userDB).find(user => user.email === email);
};



module.exports = {
  emailExists,
}