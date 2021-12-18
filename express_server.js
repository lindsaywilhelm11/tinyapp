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
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

// Shows url page for user
app.get("/urls", (req, res) => {
    const userID = req.session.user_id;
    const user = users[userID];
    const urls = urlsForUser(userID, urlDatabase);
  
    if (!userID || !user) {
      return res.status(403).send('401: Unauthorized: Please <a href="/login">login</a> or <a href="/register">register</a> to view these URLs!')
    }
  
    let templateVars = { 
        user, 
        urls 
      };
    res.render("urls_index", templateVars);
  });

// Generates a shortURL and saves it to the logged in user
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.user_id;
  
    if (!userID) {
      res.status(401).send('403 Unauthorized: Please <a href="/login">login</a> or <a href="/register">register</a>');
      return;
    }
  
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    res.redirect(`/urls/${shortURL}`);
  });

// Shows registration page
app.get("/register", (req,res) => {
  const userID = req.session.user_id;
      let templateVars = {
          user: userID
      };
      res.render('urls_register', templateVars)
});

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

// Shows login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
    let templateVars = { 
        user: userID 
    };
  res.render("urls_login", templateVars);
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
      res.status(404).send('404 Unauthorized: User not found!')
      return;
    }
    
    if (!bcrypt.compareSync(password, user.hashedPassword)) {
      res.status(401).send('401 Unauthorized: User cannot be authenticated!')
      return;
    }
    
    req.session.user_id = user.id;
    res.redirect('/urls');
    });
      
// Logout / Delete cookie session
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

// Logged in user can see create new URL form
app.get("/urls/new", (req, res) => {
const userID = req.session.user_id;
const user = users[userID];
  if (!userID) {
    res.status(401).send('403: Unauthorized: Please <a href="/login">login</a> or <a href="/register">register</a>');
    return;
  }

  if (!user) {
    res.redirect(`/login`);
    return;
  }

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
    const shortURL = req.params.shortURL;
    const url = urlDatabase[shortURL]
    const longURL = url.longURL;

    if (!urlDatabase[shortURL]) {
        res.status(404).send('404 Not Found: This short URL does not exist!');
      return;
    }
    
    res.redirect(longURL);
  });

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[shortURL];
  
  if (!user) {
    res.status(401).send('403 Unauthorized: Please <a href="/login">login</a> or <a href="/register">register</a>');
    return;
  }

  if (!url) {
    res.status(404).send('404 Not Found: This short URL does not exist!');
    return;
  }

  if (url.userID !== userID) {
    res.status(403).send("403: Forbidden: You are not authorized to access this TinyURL!");
    return;
  } 

    const templateVars = { 
        user,
        shortURL, 
        longURL: url.longURL
    };
    res.render("urls_show", templateVars);
});

//Logged in user can see and update URLs
app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const userID = req.session.user_id;
    let url = urlDatabase[shortURL];


    if (!userID) {
        res.status(401).send('403 Unauthorized: Please <a href="/login">login</a> or <a href="/register">register</a>');
        return;
      }

    if (!url) {
        res.status(404).send('404 Not Found: This short URL does not exist!');
        return;
    }

    if (url.userID !== userID) {
      res.status(403).send('403 Forbidden: You are not authorized to edit this URL!');
      return;
    }

    url.longURL = req.body.longURL;
    res.redirect('/urls')
  });

//  Deletes URL if user is logged in
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL  = req.params.shortURL;
  const userID = req.session.user_id
  const url = urlDatabase[shortURL]
  
  if (userID !== url.userID) {
    res.status(403).send('403 Forbidden: You are not authorized to delete this URL!' );    
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)   
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

