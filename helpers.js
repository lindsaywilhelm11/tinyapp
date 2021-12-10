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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
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

const newUser = (email, password) => {
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  return id;
};

const findUserByEmail = email => {
  return Object.values(users).find(user => user.email === email);
};
  
const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};
  
const urlsForUser = (id) => {
  let obj = {};
  for (let url of Object.keys(urlDatabase)) {
    if (urlDatabase[url].userID === id) {
      obj[url] = urlDatabase[url];
    }
  }
  return obj;
};
  
const findPassword = function(data, input) {
  for (let key in data) {
    if (bcrypt.compareSync(data[key].password, bcrypt.hashSync(input, 10))) {
      return true;
    }
  }
  return false;
};

module.exports = { generateRandomString, newUser, findUserByEmail, urlsForUser, findPassword, getUserByEmail };