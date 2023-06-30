const { name } = require("ejs");
const express = require("express");
const app = express();
const cookie = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie());

function generateRandomString() {
  // found the solution on stackOverFlow
  return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join('');
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
// helper function to find the email
function emailExists(email) {
  return Object.values(users).find(user => user.email === email);
}
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls.json", (req, res) => {
  res.json(
  );
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user:users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  //req.params is a object with route parameter in it witch in this case id is in it
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user:users[req.cookies.user_id]
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //To be able to get id use req.params
  const longURL = urlDatabase[req.params.id];//to get the correct longUrl access database with the id
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let newID = generateRandomString();
  urlDatabase[newID] = req.body["longURL"];//add new key value to database
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const deleteID = req.params.id;
  if (urlDatabase[deleteID]) {
    delete urlDatabase[deleteID];
  }
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const editID = req.params.id;
  const longURL = req.body.longURL;// goes to the longUrl that we creat in urls_show
  urlDatabase[editID] = longURL;
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  let shortUrl = req.params.id;
  let templateVars = {
    shortUrl: shortUrl,
    longURL: urlDatabase[shortUrl.longURL], // creating a object to dipined long and shotr urls
    user:users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// checks if the email and the password are macthing
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailExists(email);// using the existed function for find the user
  if (!user) {
    return res.status(403).send("E-mail is not found");
  } else {
    if (user["password"] !== password) {
      return res.status(403).send("Password is not macthing");
    }
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  //add user cookie data to templateVars so that header can render correct state
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

//Clears the cookie specified by id.
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user:users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

//creat an object for new regustered user and give user id
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    id: newID
  };
  // find if email or password alredy exists
  if (!req.body.email || !req.body.password || emailExists(req.body.email)) {
    return res.status(400).send("Email or password alredy exists");
  } else {
    users[newID] = newUser;
    res.cookie("user_id", newID);
    res.redirect("/urls");

  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

