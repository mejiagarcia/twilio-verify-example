require('dotenv').config();

const context = require('./context');

const http = require('http');
const express = require('express');
const session = require('express-session');
const { registerWebsocketServer } = require('./websocket-server');

const test = require('./controllers/test');
const register = require('./controllers/register');
const login = require('./controllers/login');
const devices = require('./controllers/devices');
const challenges = require('./controllers/challenges');
const pages = require('./controllers/pages');

const validateSessionWithMultifactor = require('./middlewares/validate-session-with-multifactor');
const validateSession = require('./middlewares/validate-session');

const ChallengeManager = require('./challenge-manager');
const DeviceManager = require('./device-manager');
const UserRepository = require('./user-repository');

context.repository = new UserRepository();
context.devices = new DeviceManager();
context.challenges = new ChallengeManager();

const app = new express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(context.configuration));

// controllers
app.post('/api/login', login);
app.post('/api/register', register);
app.get('/api/created-users', test);

// middleware to validate session
app.post('/api/devices/token', validateSession, devices.token);
app.post('/api/devices/register', validateSession, devices.register);

app.post('/api/challenges/update-webhook', challenges.update);
app.get('/api/challenges/status', validateSession, challenges.status);

app.get('/push-challenge-pending', validateSession, pages.pending);
app.get('/profile', validateSessionWithMultifactor, pages.profile);
app.get('/logout', validateSessionWithMultifactor, pages.logout);
app.get('/reject', pages.reject);
app.get('/', pages.login);
app.get('/register', pages.register);

app.use(express.static('public'));

const port = process.env.PORT || '5000';

const server = http.createServer(app);

registerWebsocketServer(server);

server.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
