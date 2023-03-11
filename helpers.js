//The function checks if an email exists in the users object. If the user does exist it returns the information of that user, otherwise it returns null
const getUserByEmail = function(email, usersDatabase) {
  for (let i in usersDatabase) {
    for (let j in usersDatabase[i]) {
      if (usersDatabase[i][j] === email && email !== '') {
        return usersDatabase[i];
      }
    }
  }
  return null;
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

//The function below checks the a database passed in and returns the urls that were saved by a specific user(the user is identified through it's id)
const urlsForUser = function(id, dataBase) {
  const data = {}
  for(let i in dataBase){
    if(id === dataBase[i]['userId']) {
      data[i] = dataBase[i]
    }
  }
  return data  
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser }