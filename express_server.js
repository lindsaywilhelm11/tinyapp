const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "lnw11": "http://www.lindsaynwilhelm.xyz/"
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

// GET REQUESTS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
    const templateVars = { 
        user: users[req.cookies["user_id"]], 
        urls: urlDatabase };
    res.render("urls_index", templateVars);
})

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });  

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { 
        user: users[req.cookies.user_id],
        shortURL: generateRandomString(),
        longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
    
  });  

  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(urlDatabase[longURL])
  })

  app.get("/register", (req, res) => {
    const templateVars = {
        user: users[req.cookies["user_id"]],
        email: req.body.email,
        password: req.body.password
    }
    res.render('urls_register', templateVars)
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
    const shortURL = req.params.id;
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  })

  app.post("/login", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]] }
    res.cookie('user_id', templateVars)
    res.redirect("/urls")
  })

  app.post('/logout', (req, res) => {
      res.clearCookie('user_id');
      res.redirect('/urls');
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