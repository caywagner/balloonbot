
require('dotenv').config();

var express = require('express');
var app = express();

// insert functionality code below

var slackEventsApi = require('@slack/events-api');

var slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
    includeBody: true
});

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

module.exports = {
    app,
    slackEvents
};