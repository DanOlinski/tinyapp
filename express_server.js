//This app takes in a url typed by a user in a browser interface, and generates a random string of 6 characters. That 6 character string is set as a shorter version of the url typed by the client. That shorter url is displayed as a link that redirects the client to the corresponding url. A user can also log in and register as a new user into the app.
const express = require("express");

//password hashing method
const bcrypt = require("bcryptjs");

//This module handles information saved as cookies. This module has the added benefit of encrypting the cookies.
let cookieSession = require('cookie-session');

const helpers = require("./helpers")

//the app.get and app.post functions below have to be placed in the correct order since one function depends on the next
const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['abcd'],
}))

//data received from client needs to be decrypted using express.urlencoded and the buffer/client data will be placed into req object under req.body.<name>. Name is defined in the ejs file inside <form>. Another way to access information is by using req.params.<id>(check example that uses req.params further below).
app.use(express.urlencoded({ extended: true }));

//declaration below tells express.set module that HTML code will be rendered by ejs
app.set("view engine", "ejs");

//keep  track and store all URLs and shortened forms provided by the user
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};

//keep track of registered users
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
};

//the method below sets the server to listen at a predefined port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Render urls_index file to the browser. displays urlDatabase object in a neat way as a list within tables. This is the home page of the app
app.get("/urls", (req, res) => {

  //the code below retrieves a value from an existing cookie file
  //if you wanted to save a value as a cookie file use: req.session.user_id = id (the last id is a variable that holds the value you want to save as a cookie)
  //To clear all cookies: req.session = null
  const userId = req.session.user_id
  const userDatabase = helpers.urlsForUser(userId, urlDatabase)
  
  //The object below stores the user key(it's retrieving this info from the cookie files through the use of cookie-parser npm package, this info is called in the _header.ejs file)
  const templateVars = { userId, userDatabase, loggedUser: users[userId] };
  return res.render("urls_index", templateVars);
});

//the rout renders a login page
app.get('/urls/login', (req, res) => {
  const templateVars = { userId: users[req.session.user_id] };

  //if user is logged don't enter login page
  if(templateVars.userId){
  return res.redirect('/urls')  
  }
  return res.render('urls_login', templateVars);
});

//The rout below logs the user(retrieving info from user_id cookie object).
//to check the data/cookies saved: use the inspect tool in chrome /Application/Cookies in the browser
app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  
  //this statement handles errors (empty fields)
  if (!emailInput || !passwordInput) {
    return res.status(400).send("Error 400: Empty field(s)");
  } 
 
  const userId = helpers.getUserByEmail(emailInput, users)
  //this statement handles errors (user not registered)
  if (userId === null) {
    return res.status(403).send("Error 403: User not registered");
  }

  //this statement handles errors (incorrect password)
  if (bcrypt.compareSync(passwordInput, userId['password'])) {
    req.session.user_id = userId.id;
    return res.redirect('/urls');
  } else {
    return res.status(403).send("Error 403: Incorrect password");
  }
});

//The rout below logs out the user by deleting saved cookie
app.post("/logout", (req, res) => {
  req.session = null
  return res.redirect(`/urls/login`);
});

//Render a page with a box for the user to enter data. in the page /urls/new there is a button that sends that data back to the server using post method
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id
  const templateVars = { userId, loggedUser: users[userId] };

  //if user is not logged in block urls/new page
  if(!templateVars.userId){
    return res.redirect('/urls/login')  
    }
  return res.render("urls_new", templateVars);
});

//Handle the data sent from client to the server, this data is coming from page /urls/new or file urls_new.ejs The data received is saved in the object urlDatabase, then client is redirected to /urls/:id contained in urls_show.ejs file
app.post("/urls", (req, res) => {
  const shortURL = helpers.generateRandomString();
  const loggedUser = req.session.user_id
  
  //if user is not logged in, block the feature from this .post method by redirecting to /urls where there is a message asking user to login or register.
  if(!loggedUser) {
    return res.redirect(`/urls`)
  }

  urlDatabase[shortURL] = {longURL: req.body.longURL, userId: loggedUser};
  return res.redirect(`/urls/${shortURL}`);
});

//this rout renders a registry page
app.get("/urls/register", (req, res) => {
  const templateVars = { userId: users[req.session.user_id] };

  //if user is logged in block register page
  if(templateVars.userId){
    return res.redirect('/urls')  
    }
  return res.render("urls_register", templateVars);
});

//the following rout saves user information into users object and saves a user ID number as a cookie file, this ID number is used to identify the logged user in the users object and retrieve data related to the logged user to display users email on the header. this rout redirects the user to /urls page
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //this statement handles errors (user already registered)
  if (helpers.getUserByEmail(email, users)) {
    return res.status(400).send("Error 400: user already registered");
  }
  
  //this statement handles errors (empty fields)
  if (!email || !password) {
    return res.status(400).send("Error 400: empty field(s)");
  } else {
    //this function generates a random string ans stores that string as a unique ID for the user
    let id = helpers.generateRandomString();
    users[id] = { 'id': id, 'email': email, 'password': hashedPassword};

    //the code below saves the id values into an encrypted cookie file
    //if you wanted to retrieve a value from an existing cookie file use: const userId = users[req.session.user_id]  
    req.session.user_id = id
    return res.redirect('/urls');
  }
});

//:id works as an argument/variable/placeholder/abstraction(also called resource or REST or RESTful or REST API end point where API refers to the url of the rout). :id = req.params.id
//The page below is accessed when clicking the submit button in page /urls/new(that is where a key pair is created, the key is passed as the :id when redirected to this page (a value is set to id: in the app.post("/urls") method declared above). Also check note in urls_show with ****).
//test example http://localhost:8080/urls/b2xVn2
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id
                 
  //if user is not logged in block this feature
  if(!userId){
    return res.status(403).send("Error 403: user not logged in")
  }

  const userInfo = helpers.urlsForUser(userId, urlDatabase)
  //if user tries to access a url that doesn't belong to him an error is sent back to client
  if(!userInfo || Object.keys(userInfo).length === 0) {
    return res.status(403).send("Error 403: short url does not exist or cannot be changed by this user");
  }

  const templateVars = { userId: users[req.session.user_id], id: req.params.id, longURL: userInfo[req.params.id]['longURL'], loggedUser: users[userId]}

  return res.render("urls_show", templateVars);
});

//This page is set as a link in the files urls_show and urls_index. when the links redirects to this page :id is replaced with the short url(that key value is accessed through the use of req.params.id)(a value is set to id: in the app.post("/urls") method declared above). The short url is a key corresponding to an actual url and this page redirects the client to the url value that corresponds to the short url key.
app.get("/u/:id", (req, res) => {
  shortURL = req.params.id

  //if a short url that doesn't exist is accessed an error will be generated to handle this.
  if(!urlDatabase[shortURL] || !urlDatabase[shortURL]['longURL']){
    return res.status(403).send("Error 403: short url does not exist");
  }
  const longURL = urlDatabase[shortURL]['longURL'];
  return res.redirect(longURL);
});

//The rout below connects to a delete button and removes the corresponding url key pair from the urlDatabase object in the home page
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id
  const shortURL = req.params.id;
  const userInfo = helpers.urlsForUser(userId, urlDatabase)

  //if user tries to delete a url that doesn't belong to him an error is sent back to client
  if(!userInfo || Object.keys(userInfo).length === 0 || !userInfo[shortURL]) {
    return res.status(403).send("Error 403: short url does not exist or cannot be changed by this user");
  }
  delete urlDatabase[shortURL];
  return res.redirect(`/urls`);
});

//The rout below connects to an edit button redirecting the client to urls_show.ejs page where they can change the long url associated to the short url selected by the client. This edit button is located in the home page
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]['longURL'];
  const userInfo = helpers.urlsForUser(userId, urlDatabase)

  //if user tries to edit a url that doesn't belong to him an error is sent back to client
  if(!userInfo || Object.keys(userInfo).length === 0 || !userInfo[shortURL]) {
    return res.status(403).send("Error 403: short url does not exist or cannot be changed by this user");
  }

  urlDatabase[shortURL]['longURL'] = longURL;
  return res.redirect(`/urls/${shortURL}`);
});

//this .post rout handles info typed by the client in the urls_show.ejs, updating the long url referenced to a specified short url, this function can be accessed in the urls_show.ejs file page
app.post("/urls/:id/update", (req, res) => {
  const userId = req.session.user_id
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  
  //if user is not logged in block this feature
  if(!userId){
    return res.status(403).send("Error 403: user not logged in")
  }
  
  //if user tries to edit a url that doesn't belong to him an error is sent back to client
  const userInfo = helpers.urlsForUser(userId, urlDatabase)
  if(!userInfo || Object.keys(userInfo).length === 0 || !userInfo[shortURL]) {
    return res.status(403).send("Error 403: short url does not exist or cannot be changed by this user");
  }

  urlDatabase[shortURL]['longURL'] = longURL;
  return res.redirect(`/urls`);
});

