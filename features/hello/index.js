require('dotenv').config();

var express = require('express');
var app =  express();

// insert functionality code below

var { WebClient } = require('@slack/web-api');

function hello(message, body) {
    console.log('tried to say hi to ');
    console.log(message.user);
    console.log('who said');
    console.log(message.text);
    // Only deal with messages that have no subtype (plain messages) and contain 'hi'
    if (!message.subtype && message.text.indexOf('hi balloonbot') >= 0) {
    // Initialize a client
    // const slack = getClientByTeamId(body.team_id);
    const slack = new WebClient(process.env.BOT_TOKEN);

    // Handle initialization failure
    if (!slack) {
        return console.error('No authorization found for this team. Did you install the app through the url provided by ngrok?');
    }
    // Respond to the message back in the same channel
    console.log('said hi!');
    slack.chat.postMessage({ channel: message.channel, text: `Hello <@${message.user}>! :tada:` })
        .catch(console.error);
    }

}


module.exports = {
    hello: hello
}
