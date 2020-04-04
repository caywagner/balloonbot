require('dotenv').config();

var express = require('express');
var app =  express();

// insert functionality code below

var { WebClient } = require('@slack/web-api');

function introduction(message, body) {
    console.log('balloonbot introduced itself!');
    // Only deal with messages that have no subtype (plain messages) and contain 'hi'
    searchStr = 'Hey balloonbot, introduce yourself!'
    if (!message.subtype && message.text.indexOf(searchStr) >= 0) {
    // Initialize a client
    // const slack = getClientByTeamId(body.team_id);
    const slack = new WebClient(process.env.BOT_TOKEN);

    // Handle initialization failure
    if (!slack) {
        return console.error('No authorization found for this team. Did you install the app through the url provided by ngrok?');
    }
    // Respond to the message back in the same channel
    slack.chat.postMessage({ channel: message.channel,
        text: `Hi everyone! I'm balloonbot :balloon:

I'll help around our workspace and have fun ruthlessly antagonizing instructors!

If you want to help develop me and learn how to make a balloon talk, come join my overlords on <#CUP0G2WHJ>!`
    })
        .catch(console.error);
    }
}


module.exports = {
    introduction: introduction
}
