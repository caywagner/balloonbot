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
  } else if (!message.subtype && message.text.indexOf('!spec') == 0) {
        const slack = new WebClient(process.env.BOT_TOKEN);
          // Handle initialization failure
          if (!slack) {
            return console.error('No authorization found for this team. Did you install the app through the url provided by ngrok?');
          }
          // Respond to the message back in the same channel
        message = message.substring(6);
        if(message == "all") {
          //for all keys yeehaw, not sure how to do in a message block
          //slack.chat.postMessage({ channel: message.user.channel, text: `Here's the <{message}> specsheet: <{dict[spec_name]}>`}).catch(console.error);
          slack.chat.postMessage({ channel: message.channel, text: `Send <@${message.user}> a list of all specsheets` })
            .catch(console.error);
        }
        var dict = {
            "ADXL335": "https://drive.google.com/file/d/1SQDVX4pyUmL4Bix31YxwA4BRA3nUb1xA/view?usp=sharing",
            "Accelerometer" : "https://drive.google.com/file/d/1SQDVX4pyUmL4Bix31YxwA4BRA3nUb1xA/view?usp=sharing",
            "B57164K": "https://drive.google.com/file/d/1NsWR_x83OhYsmL910Ml--_tHsuqDnts4/view?usp=sharing",
            "thermistor" : "https://drive.google.com/file/d/1NsWR_x83OhYsmL910Ml--_tHsuqDnts4/view?usp=sharing",
            "HIH-4030" : "https://drive.google.com/file/d/1_LNJdS-_JnDvOV4eXHjNEV6lEoOF4IUo/view?usp=sharing",
            "Humidity Sensor" : "https://drive.google.com/file/d/1_LNJdS-_JnDvOV4eXHjNEV6lEoOF4IUo/view?usp=sharing",
            "LinearRegulator": "https://drive.google.com/file/d/1uBG1QTpuwDYcjgUR08kW3rRDeN_U9pJT/view?usp=sharing",
            "LM1117": "https://drive.google.com/file/d/1uBG1QTpuwDYcjgUR08kW3rRDeN_U9pJT/view?usp=sharing",
            "Fixed Voltage Regulator": "https://drive.google.com/file/d/1tzmamWhObwSpM9S_n5xO9CppK5vneVoO/view?usp=sharing",
            "LM7805": "https://drive.google.com/file/d/1tzmamWhObwSpM9S_n5xO9CppK5vneVoO/view?usp=sharing",
            "MPX4115": "https://drive.google.com/file/d/1VazH0mFoq26qNE78Xmq48jDQQZBhiI8s/view?usp=sharing",
            "Pressure Sensor": "https://drive.google.com/file/d/1VazH0mFoq26qNE78Xmq48jDQQZBhiI8s/view?usp=sharing",
            "Micro Metal Gearmotors": "https://drive.google.com/file/d/1gWZcqazz1UgwP1TFWo4mwYfTRhf6-bgX/view?usp=sharing",
            "Pololu 210-1": "https://drive.google.com/file/d/1gWZcqazz1UgwP1TFWo4mwYfTRhf6-bgX/view?usp=sharing",
            "TMP36": "https://drive.google.com/file/d/14iAKnej6EEOFn9TSyiuXjsRfiS2MBA4x/view?usp=sharing",
            "":,
            "":,
            "":,
            1: "some value"
        };
        var spec_name = "";
        search:
        for(var key in dict) {
            if(key == message) {
                  spec_name = key;
                  break search;
            }
        }
        if(spec_name != "") {
          slack.chat.postMessage({ channel: message.user.channel, text: `Here's the <{message}> specsheet: <{dict[spec_name]}>`}).catch(console.error);
          slack.chat.postMessage({ channel: message.channel, text: `Send <@${message.user}> the <{message}> specsheet` })
            .catch(console.error);
        } else {
              slack.chat.postMessage({ channel: message.channel, text: `Uh oh <@${message.user}>, I can't seem to find the <{message}> specsheet`}) //Type !spec all for a list of all specsheets???
            .catch(console.error);
        }
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
