//This app takes in a url typed by a user in a browser interface, and generates a random string of 6 characters. That 6 character string is set as a shorter version of the url typed by the client. That shorter url is displayed as a link that redirects the client to the corresponding url
const express = require("express");
const app = express();
const PORT = 8080; // default port

//data received from client needs to be decrypted using express.use and the buffer/client data will be placed into req object under req.body.<name>. Name is defined in the ejs file inside <input>
app.use(express.urlencoded({ extended: true }));

//declaration below tells express.set module that HTML code will be rendered by ejs
app.set("view engine", "ejs");

//keep track of all URLs and shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//this function generates a random string of 6 characters
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 6) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

//hello page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//hello world page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//this page displays/routs to the client, the urlDatabase object in a very rough way
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Render urls_index file to the browser. displays urlDatabase object in a neat way as a list within tables. This is the home page of the app
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Render a page with a box to enter data. Include a button that sends that data back to the server
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Handle the data sent from client to the server, this data is coming from page /urls/new or file urls_new.ejs The data received is saved in the object urlDatabase, then client is redirected to /urls/:id contained in urls_show.ejs file
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//This page is set as a link in the files urls_show and urls_index. when the links redirect to this page :id is replaced with the short url. The short url is a key corresponding to an actual url and this page redirects the client to the url value that corresponds to the short url key.
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//:id works as an argument anything placed in the url instead of :id will be replaced into where we have req.params.id
//test example http://localhost:8080/urls/b2xVn2
app.get("/urls/:id", (req, res) => {
  //the 1st key in the templateVars is used to display the short url. The second key is used to display the entry belonging to the key(short url) inside urlDatabase that has an equal value to what is passed in the form by the client.
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//the method below sets the server to listen at predefined port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});