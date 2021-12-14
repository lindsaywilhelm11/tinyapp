const bcrypt = require('bcryptjs');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      hashedPassword: bcrypt.hashSync("123", 10)
    },
    "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      hashedPassword: bcrypt.hashSync("123", 10)
    }
  };

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};
  
const getUserByEmail = function(email) {
    const userValues = Object.values(users);
  for (const user of userValues) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
  
const urlsForUser = (id) => {
  let result = {};
  for (let shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if (urlObj.userID === id) {
        result[shortURL] = urlObj;
    }
  }
  return result;
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail };