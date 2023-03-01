const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});//access: http://localhost:8080/

//this shows to the client the urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});//access: http://localhost:8080/urls.json


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});//access: http://localhost:8080/hello

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});