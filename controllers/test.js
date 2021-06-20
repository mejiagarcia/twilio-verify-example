const users = require('../users.json');

const test = async (request, response) => {
  response.json(users);
};

module.exports = test;