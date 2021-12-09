const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { 
    longURL: "https://www.lighthouselabs.ca",
    userID: "1A"
    },
  "9sm5xK": { 
    longURL: "https://www.google.ca",
    userID: "2B"
        },
  "lnw11":  { 
    longURL: "http://www.lindsaynwilhelm.xyz",
    userID: "3C"
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
    },
    "user3RandomID": {
        id: "user3RandomID",
        email: "lindsaywilhelm11@gmail.com",
        password: "123"
    }
}

const findUserByEmail = (email) => {
    for (const user_id in users) {
        const user = users[user_id];
        if (user.email === email) {
            return user;
        }
    }
    return null;
}

const urlsForUser = (id, urlDatabase) => {
    let userURL = {};
    for (let url in urlDatabase) {
        if (urlDatabase[url].userID === id) {
            userURL[url] = urlDatabase[shortURL];
        } 
    }
    return userURL;
}

// GET REQUESTS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/login', (req, res) => {
    const templateVars = {
        user: users[req.cookies["user_id"]],
        email: req.body.email,
        password: req.body.password
    }

    res.render('urls_login', templateVars)
    res.redirect('/urls')
})

app.get("/register", (req, res) => {
    const templateVars = {
        user: users[req.cookies["user_id"]],
        email: req.body.email,
        password: req.body.password
    }
    res.render('urls_register', templateVars)
    res.redirect('/urls')
})

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlsForUser(req.cookies["user_id"], urlDatabase),
        user: users[req.cookies["user_id"]]
    }
    if (!users[req.cookies["user_id"]]) {
        res.send('please login or register before accessing this page')
        res.redirect('/login')
    } else if (urlDatabase[req.params.shortURL])
        res.render("urls_index", templateVars);
})

  app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.cookies.user_id]  }
    if (!req.cookies["user_id"]) {
        res.redirect('/login')
    }
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { 
        user: users[req.cookies["user_id"]],
        shortURL: generateRandomString(),
        longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
    
  });  

  app.get("/u/:shortURL", (req, res) => {   
    const longURL = urlDatabase[req.params.shortURL].longURL
          res.redirect(longURL);
  })

// POST REQUESTS

  app.post("/urls", (req, res) => {
    console.log(req.body);  
    res.redirect('/urls/:shortURL');         
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  })

  app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  })

  app.post("/login", (req, res) => {
    console.log('req.body', req.body)
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Invalid email or password!")
  }

  const user = findUserByEmail(email);
  console.log('user', user);
  
  if (!user) {
    return res.status(403).send("Email does not exist!")
  }

  if (user.password !== password ){
    return res.status(403).send('Invalid password!');
  }

    res.cookie('user_id', user.id)
    res.redirect("/urls")
  })

  app.post('/logout', (req, res) => {
      res.clearCookie('user_id');
      res.redirect('/login');
  })

  app.post('/register', (req, res) => {
    const newEmail = req.body.email;
    const newPassword = req.body.password  

    if (!newEmail || !newPassword) {
        return res.status(400).send('Invalid email or password')
    }

    const user = findUserByEmail(newEmail);

    if (user) {
        return res.status(400).send('User already exists')
    }

    const userRandomIDNew = generateRandomString();

        users[userRandomIDNew]= {
        id: userRandomIDNew,
        email: newEmail,
        password: newPassword
      }

      let templateVars = { user: users[req.cookies["user_id"]] };
      res.render('/urls_register', templateVars)
      res.redirect('/urls')
  })

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

function generateRandomString() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = ''
  const charLength = chars.length;

  for (let i = 0; i < 6 ; i++ ) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result
}