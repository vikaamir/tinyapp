
const express = require("express");
const app = express();
const cookie = require('cookie-session');
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const {getUserByEmail} = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie({
  name: 'session',
  keys: ['key1', 'key2']
}));

function generateRandomString() {
  // found the solution on stackOverFlow
  return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join('');
}
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    //"purple-monkey-dinosaur"
    password: "$2a$10$nf3aPq2C2ZmziTj6xpfrC.tZ8Q9nEXrJdbzDJfPZmM1FIp7UEyfqu",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    //"dishwasher-funk"
    password: "$2a$10$JGKzXs5vnrWylUocYd5AvuSeL4cR4xOOYl.11k81xYdrswn7h0bB6",
  },
};

function urlsForUser(userID) {
  // Filter the urlDatabase by comparing the userID with the specified id
  //Create an empty object to put matching items
  let filteredItems = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userID"] === userID) {
      filteredItems[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredItems;
}

app.get("/urls.json", (req, res) => {
  res.json(
  );
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("<h2>To see the URLs you need to log-in first!</h2>");
  } else {
    const templateVars = {
      user: users[userID],
      urls: urlsForUser(userID)
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("To create a short URL, please log-in first!");
  }
  let newID = generateRandomString();
  //add new key value to database
  urlDatabase[newID] = {
    longURL: req.body["longURL"], //Get longURL from response body
    userID: userID  //Get userID from cookie
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${newID}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[userID]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send(`please log in`);
  }
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`This page  is not in the database`);
  }// checks if the user id is the same userid of the shorURL
  if (urlDatabase[shortURL].userID === userID) {
    //req.params is a object with route parameter in it witch in this case id is in it
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id]["longURL"],
      user: users[userID]
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(404).send(`You do not have access`);
  }
});

//u:id redirect to the longURL page
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]["longURL"];//to get the correct longUrl access database with the id
  if (!longURL) {
    return res.status(403).send(`This page is not in the database`);
  } else {
    res.redirect(longURL);
  }
});
//can delete if id exists
app.post("/urls/:id/delete", (req, res) => {
  const deleteID = req.params.id;
  if (urlDatabase[deleteID]) {
    delete urlDatabase[deleteID];
    res.redirect("/urls");
  } else {
    return res.status(403).send(`This id is not exists`);
  }
});

app.post("/urls/:id/edit", (req, res) => {
  const editID = req.params.id;
  const longURL = req.body.longURL;// goes to the longUrl that we creat in urls_show
  if (req.params.id) {
    urlDatabase[editID]["longURL"] = longURL;
    res.redirect("/urls");
  } else {
    return res.status(403).send(`you can not edit this url`);
  }
});

app.get("/urls/:id/edit", (req, res) => {
  let shortUrl = req.params.id;
  let templateVars = {
    shortUrl: shortUrl,
    longURL: urlDatabase[shortUrl.longURL], // creating a object to dipined long and shotr urls
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// checks if the email and the password are macthing
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);// using the existed function for find the user
  if (!userID) {
    return res.status(403).send("E-mail is not found");
  } else {
    if (!bcrypt.compareSync(password, users[userID]["password"])) {
      return res.status(403).send("Password is not macthing");
    }
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  //add user cookie data to templateVars so that header can render correct state
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

//Clears the cookie specified by id.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

//creat an object for new regustered user and give user id
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const hashPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    email: req.body.email,
    password: hashPassword,
    id: newID
  };
  console.log("email:" + newUser.email)
  console.log("password:" + newUser.password)
  console.log(getUserByEmail(newUser.email, users));
  
  //if email or password empty return messege
  if (!newUser.email || !req.body.password) {
    return res.status(400).send("Please fill in email and password");
    // if email alredy exists
  } else if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email alredy exists");
  } else {
    users[newID] = newUser;
    req.session.user_id = newID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

