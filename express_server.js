const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

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
    hashedPassword: bcrypt.hashSync("123", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("123", 10)
  }
};

// Get Requests:

// Logged in users can see urls
app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.redirect('/login');
  }
  res.redirect('/urls');
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
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    res.status(403).send('401: Unauthorized: Please <a href="/login">login</a> or <a href="/register">register</a> to view these URLs!')
  }

  const urls = urlsForUser(id);
  let templateVars = { user, urls };
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
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL,
    user: users[req.session.user_id],
    longURL: urlDatabase[shortURL].longURL
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
    return res.status(400).send('400 Bad Request: Invalid email or password!');
  } 

  if (getUserByEmail(email)) {
    return res.status(400).send('400 Bad Request: A user has already registered under this email. Please Please <a href="/login">login</a> or <a href="/register">register</a> with a different one!');
  } 

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id,
    email,
    hashedPassword
  }
  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

// Login authentication
app.post("/login", (req,res) => {
const email = req.body.email;
const password = req.body.password;
const user = getUserByEmail(email);

if (!email || !password) {
    return res.status(400).send('400 Bad Request: Please fill out email or password inputs correctly!');
}

if (!user) {
  return res.status(404).send('404 Unauthorized: User not found!')
}

if (!bcrypt.compareSync(password, user.hashedPassword)) {
  return res.status(401).send('401 Unauthorized: User cannot be authenticated!')
}

req.session.user_id = user.id;
res.redirect('/urls');
});
  
// Logout / Delete cookie session
app.post("/logout", (req, res) => {
  delete req.session.user_id;
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
  const shortUrl  = req.params.shortURL;
  const user_id = req.session.user_id
  if (!urlDatabase[shortUrl]) {
    res.status(404).send('404 Not Found: Cannot find URL!');
      return;
    }
  if (user_id !== urlDatabase[shortUrl].user_id) {
    res.status(403).send('403 Forbidden: You are not authorized to delete this URL!' );    
    return;
    }
  urlDatabase[shortUrl].longUrl = req.body.longUrl;
  res.redirect(`/urls`)
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