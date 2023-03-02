const express = require("express");
const app = express();
const PORT = 8080; // default port

//declaration below tells express.set module that HTML code will be rendered by ejs
app.set("view engine", "ejs")

//keep track of all URLs and shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//hello page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//hello world page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//this page displays to the client, the urlDatabase object in a very rough way
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

//Render urls_index file to the browser. displays urlDatabase object in a neat way as a list within tables
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//NOT SURE IF THIS IS CORRECT
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render("urls_show", templateVars);
});

//the method below sets the server to listen at predefined port 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});