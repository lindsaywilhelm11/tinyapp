const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "lnw11": "http://www.lindsaynwilhelm.xyz/"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
})

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });  

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: generateRandomString(), longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
    
  });  

  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(urlDatabase[longURL])
  })

  app.post("/urls", (req, res) => {
    console.log(req.body);  
    res.redirect('/urls/:shortURL');         
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL];
    res.redirect("/urls");
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