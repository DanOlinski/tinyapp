const express = require("express");
const app = express();
const PORT = 8080; // default port

//data received from client needs to be decrypted using express.use and the buffer/client data will be placed into req object under req.body.<name>. name is defined in the ejs file inside <input>
app.use(express.urlencoded({ extended: true }));

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

//hello world page rout
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//this page displays/routs to the client, the urlDatabase object in a very rough way
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

//Render urls_index file to the browser. displays/routs urlDatabase object in a neat way as a list within tables
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Render a page with a box to enter data with a button that sends that data back to the server
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Handel the data sent from client to the server, this data is coming from page /urls/new or file urls_new. The data received is posted in the /urls page
app.post("/urls", (req, res) => {
  console.log(req.body)
  res.send("ok")
});

//:id works as an argument anything placed in the url instead of :id will be replaced into where we have req.params.id 
//test example http://localhost:8080/urls/b2xVn2
app.get("/urls/:id", (req, res) => {
  //the 1st key in the templateVars is used to display the short url retrieved from the url placed in the browser. The second key is used to display the entry belonging to the key inside urlDatabase that has an equal value to what is passed in the browser in the place of :id.
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render("urls_show", templateVars);
});

//the method below sets the server to listen at predefined port 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});