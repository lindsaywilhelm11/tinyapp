const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { generateRandomString, newUser, findUserByEmail, urlsForUser, findPassword } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

app.set("view engine", "ejs");

// Databases
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID" },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID" }
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

// Get Requests:

// Logged in users can see urls
app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Shows registration page
app.get("/register", (req,res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

// Shows login page
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Shows url page for user
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

// Logged in user can see create new URL form
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  if (!urlDatabase[templateVars.shortURL].userID === req.session.user_id) {
    res.status(403).send("403: Forbidden: You are not authorized to access this TinyURL!");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Post Requests:

// Register a new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('400 Bad Request: Invalid email or password!');
  } else if (findUserByEmail(email)) {
    res.status(400).send('400 Bad Request: A user has already registered under this email. Please use a different email or login.');
  } else {
    const userID = newUser(email, password);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Login authentication
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (!user) {
    res.status(404).send("404 Not Found: User not found!");
  } else if (!findPassword(users, password)) {
    res.status(400).send("400 Bad Request: Invalid password!");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});
  
// Logout / Delete cookie session
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

// Generates a shortURL and saves it to the logged in user
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

//  Deletes URL if user is logged in
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("403: Forbidden: You are not authorized to delete this!");
  }
});

//Logged in user can see and update URLs
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send("403 Forbidden: You are not authorized to edit this!");
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});