//This app takes in a url typed by a user in a browser interface, and generates a random string of 6 characters. That 6 character string is set as a shorter version of the url typed by the client. That shorter url is displayed as a link that redirects the client to the corresponding url. A user can also log in and register as a new user into the app.
const express = require("express");

//cookie-parser handles information saved as cookies
let cookieParser = require('cookie-parser');

//the app.get and app.post functions below have to be placed in the correct order since one function depends on the next

const app = express();
const PORT = 8080;

//When using cookie-parser modules like clearCookie it will access a variable that points to a saved cookie (user_id: req.cookies["user_id"]). this variable is called in the _header.ejs page and since the header page runs on all pages that have res.render these pages need to access the user_id variable, so this variable needs to be included in the code (check below for modules that have the user_id variable declared as practical application of this explanation)
app.use(cookieParser());

//data received from client needs to be decrypted using express.urlencoded and the buffer/client data will be placed into req object under req.body.<name>. Name is defined in the ejs file inside <form>. Another way to access information is by using req.params.<id>(check example that uses req.params further below).
app.use(express.urlencoded({ extended: true }));

//declaration below tells express.set module that HTML code will be rendered by ejs
app.set("view engine", "ejs");

//keep  trackand store all URLs and shortened forms provided by the user
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//keep track of registered users
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
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

//The function checks if an email exists in the users object. If the user does exist it returns the information of that user, otherwise it returns null
const userLookup = function(email) {
  for (let i in users) {
    for (let j in users[i]) {
      if (users[i][j] === email && email !== '') {
        return users[i];
      }
    }
  }
  return null;
};

//the method below sets the server to listen at a predefined port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Render urls_index file to the browser. displays urlDatabase object in a neat way as a list within tables. This is the home page of the app
app.get("/urls", (req, res) => {
  
  //The object below stores the user key(it's retrieving this info from the cookie files through the use of cookie-parser npm package, this info is called in the _header.ejs file)
  const templateVars = { userId: users[req.cookies["user_id"]], urls: urlDatabase };
  return res.render("urls_index", templateVars);
});

//the rout renders a login page
app.get('/urls/login', (req, res) => {
  const templateVars = { userId: users[req.cookies["user_id"]] };
  return res.render('urls_login', templateVars);
});

//The rout below logs the user(retrieving info from users object) and the user id as a cookie.
//to check the data/cookies saved: use the inspect tool in chrome /Application/Cookies in the browser
app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  
  //this statement handles errors (empty fields)
  if (!emailInput || !passwordInput) {
    return res.status(400).send("Error 400: Empty field(s)");
  }
 
  //this statement handles errors (incorrect password, user not registered)
  const user = userLookup(emailInput);
  if (user === null || passwordInput !== user.password) {
    return res.status(403).send("Error 403");
  } else {
    res.cookie('user_id', user.id);
    return res.redirect('/urls');
  }
});

//The rout below logs out the user by deleting saved cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect(`/urls/login`);
});

//Render a page with a box for the user to enter data. in the page /urls/new there is a button that sends that data back to the server using post method
app.get("/urls/new", (req, res) => {
  const templateVars = { userId: users[req.cookies["user_id"]] };
  return res.render("urls_new", templateVars);
});

//Handle the data sent from client to the server, this data is coming from page /urls/new or file urls_new.ejs The data received is saved in the object urlDatabase, then client is redirected to /urls/:id contained in urls_show.ejs file
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  return res.redirect(`/urls/${shortURL}`);
});

//this rout renders a registry page
app.get("/urls/register", (req, res) => {
  const templateVars = { userId: users[req.cookies["user_id"]] };
  return res.render("urls_register", templateVars);
});

//the following rout saves user information into users object and saves a user ID number as a cookie file, this ID number is used to identify the logged user in the users object and retrieve data related to the logged user to display users email on the header. this rout redirects the user to /urls page
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  //this statement handles errors (empty fields, user already registered)
  if (!email || !password || userLookup(email)) {
    return res.status(400).send("Error 400");
  } else {
    let id = generateRandomString();
    users[id] = { 'id': id, 'email': email, 'password': password};
    res.cookie('user_id', id);
    return res.redirect('/urls');
  }
});

//:id works as an argument/variable/placeholder. :id = req.params.id
//The page below is accessed when clicking the submit button in page /urls/new(that is where a key pair is created, the key is passed as the :id when redirected to this page (a value is set to id: in the app.post("/urls") method declared above). Also check note in urls_show with ****).
//test example http://localhost:8080/urls/b2xVn2
app.get("/urls/:id", (req, res) => {
  //the 1st key in the templateVars is used to display the short url. The 3rd key is used to display the entry belonging to the key(short url) inside urlDatabase that has an equal value to what is passed in the form by the client in urls_new.ejs file.
  const templateVars = { userId: users[req.cookies["user_id"]], id: req.params.id, longURL: urlDatabase[req.params.id] };
  return res.render("urls_show", templateVars);
});

//This page is set as a link in the files urls_show and urls_index. when the links redirects to this page :id is replaced with the short url(that key value is accessed through the use of req.params.id)(a value is set to id: in the app.post("/urls") method declared above). The short url is a key corresponding to an actual url and this page redirects the client to the url value that corresponds to the short url key.
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  return res.redirect(longURL);
});

//The rout below connects to a delete button and removes the corresponding url key pair from the urlDatabase object in the home page
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  return res.redirect(`/urls`);
});

//The rout below connects to an edit button redirecting the client to urls_show.ejs page where they can change the long url associated to the short url selected by the client. This edit button is located in the home page
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  urlDatabase[shortURL] = longURL;
  return res.redirect(`/urls/${shortURL}`);
});

//this .post rout handles info typed by the client in the urls_show.ejs, updating the long url referenced to a specified short url, this function can be accessed in the urls_show.ejs file page
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  return res.redirect(`/urls`);
});

