
// imports
require('dotenv').config();
var http = require('http');
var slackEventsApi = require('@slack/events-api');
var { WebClient } = require('@slack/web-api');
var SlackStrategy = require('passport-slack').Strategy;
var passport = require('passport');
var express = require('express');

var app = express();

// Initialize event adapter using signing secret from environment variables
var slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
    includeBody: true
});

// setup the strategy using defaults 
passport.use(new SlackStrategy({
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scope: ['bot'],
    skipUserProfile: true
  }, (accessToken, refreshToken, profile, done) => {
    // optionally persist profile data
    done(null, profile);
  }
));

app.use(passport.initialize());

// path to start the OAuth flow
app.get('/auth/slack', passport.authorize('slack'));

// OAuth callback url
app.get('/auth/slack/callback', 
  passport.authorize('slack', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/')
);

// Plug the event adapter into the express app as middleware
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach listeners to the event adapter
app.use('/slack/events', slackEvents.requestListener());

var challenge = require('./features/challenge');

// ^ dont touch
// *****************************************************************************
// v touch


// link slack events
slackEvents.on('message', require('./features/hello').hello);
slackEvents.on('message', require('./features/introduce_yourself').introduction);

// ^ touch
// *****************************************************************************
// v dont touch 

const port = process.env.PORT || 3000;
const server = http.createServer(slackEvents.requestListener());
server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`);
});