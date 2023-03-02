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

//Set the file for ejs to render from
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//this shows to the client the urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//the method below sets the server to listen at predefined port 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});