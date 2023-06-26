const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  // found the solution on stackOverFlow
  return Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36)).join(''); 
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(
  );
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
   const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  //req.params is a object with route parameter in it witch in this case id is in it 
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //To be able to get id use req.params
  const longURL = urlDatabase[req.params.id]//to get the correct longUrl access database with the id
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let newID = generateRandomString()
  urlDatabase[newID] = req.body["longURL"]//add new key value to database 
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const deleteID = req.params.id;
  if (urlDatabase[deleteID]) {
    delete urlDatabase[deleteID];
  }
  res.redirect("/urls");
});
   

 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

