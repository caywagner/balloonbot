// adapted from https://github.com/slackapi/node-slack-events-api/tree/master/examples/greet-and-react

// Load environment variables from `.env` file (optional)
require('dotenv').config();

const slackEventsApi = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const LocalStorage = require('node-localstorage').LocalStorage;
const http = require('http');

const {CLIENT_ID, CLIENT_SECRET, PORT} = process.env,
      SlackStrategy = require('passport-slack').Strategy,
      passport = require('passport'),
      express = require('express'),
      app = express();


// *** Initialize event adapter using signing secret from environment variables ***
const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
  includeBody: true
});

// Initialize a Local Storage object to store authorization info
// NOTE: This is an insecure method and thus for demo purposes only!
const botAuthorizationStorage = new LocalStorage('./storage');

// Helpers to cache and lookup appropriate client
// NOTE: Not enterprise-ready. if the event was triggered inside a shared channel, this lookup
// could fail but there might be a suitable client from one of the other teams that is within that
// shared channel.
const clients = {};
function getClientByTeamId(teamId) {
  // if (!clients[teamId] && botAuthorizationStorage.getItem(teamId)) {
  //   clients[teamId] = new WebClient(botAuthorizationStorage.getItem(teamId));
  // }
  if (!clients[teamId]) {
    clients[teamId] = new WebClient(botAuthorizationStorage.getItem(teamId));
  }
  if (clients[teamId]) {
    return clients[teamId];
  }
  return null;
}

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
app.use(require('body-parser').urlencoded({ extended: true }));

// path to start the OAuth flow
app.get('/auth/slack', passport.authorize('slack'));

// OAuth callback url
app.get('/auth/slack/callback', 
  passport.authorize('slack', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/')
);

// *** Plug the event adapter into the express app as middleware ***
app.use('/slack/events', slackEvents.expressMiddleware());

// *** Attach listeners to the event adapter ***
app.use('/slack/events', slackEvents.requestListener());

// *** Greeting any user that says "hi" ***
slackEvents.on('message', (message, body) => {
  console.log('said hi');
  console.log('message: ');
  console.log(message);
  console.log('body: ');
  console.log(body);
  // Only deal with messages that have no subtype (plain messages) and contain 'hi'
  if (!message.subtype && message.text.indexOf('hi') >= 0) {
    // Initialize a client
    // const slack = getClientByTeamId(body.team_id);
    const slack = new WebClient(process.env.BOT_TOKEN);

    // Handle initialization failure
    if (!slack) {
      return console.error('No authorization found for this team. Did you install the app through the url provided by ngrok?');
    }
    // Respond to the message back in the same channel
    slack.chat.postMessage({ channel: message.channel, text: `Hello <@${message.user}>! :tada:` })
      .catch(console.error);
  }
});

// *** Responding to reactions with the same emoji ***
slackEvents.on('reaction_added', (event, body) => {
  // Initialize a client
  // const slack = getClientByTeamId(body.team_id);
  const slack = new WebClient(process.env.BOT_TOKEN);
  // Handle initialization failure
  if (!slack) {
    return console.error('No authorization found for this team. Did you install the app through the url provided by ngrok?');
  }
  // Respond to the reaction back with the same emoji
  slack.chat.postMessage({ channel: event.item.channel, text: `:${event.reaction}:` })
    .catch(console.error);
});

// *** Handle errors ***
slackEvents.on('error', (error) => {
  console.log('error: ');
  console.log(error);
  if (error.code === slackEventsApi.errorCodes.TOKEN_VERIFICATION_FAILURE) {
    // This error type also has a `body` propery containing the request body which failed verification.
    console.error(`An unverified request was sent to the Slack events Request URL. Request body: \
${JSON.stringify(error.body)}`);
  } else {
    console.error(`An error occurred while handling a Slack event: ${error.message}`);
  }
});

// Handle challenge behavior
// app.post("/", jsonParser, function (req, res, next) {
//   if(!req.body.challenge){    
//     console.log('bruh');
//     console.log(req.body);
//     next();
//   }

//   console.log("POST index.js")
//   console.log(req.body);

//   res.status(200);
//   res.type('text/plain');
//   res.json({ 'challenge': req.body.challenge  });
// } );

// Start the express application
const port = process.env.PORT || 3000;
const server = http.createServer(slackEvents.requestListener());
server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`);
});
