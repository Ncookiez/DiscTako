// KindaSusBot - Written by Ncookie
// Invite Link: https://discord.com/oauth2/authorize?client_id=767136958337384519&scope=bot&permissions=199744

//====================================================================================================//
//                                            INITIAL SETUP                                           //
//====================================================================================================//

// Initializations:
const discord = require('discord.js');
const client = new discord.Client();
const mysql = require('mysql');
const key = '!';
const db_host = '65.19.141.67';
const db_user = 'ncookie_ncookie';
const db_name = 'ncookie_KindaSusDB';

// Connecting to MySQL:
var con = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: process.env.DB_PASS,
    database: db_name
});
con.connect(function(err) {
    if(err) throw err;
    console.log('MySQL is looking kinda sus.');
});

// Startup Message:
client.once('ready', () => {
    console.log('KindaSusBot is ready to snap some necks.');
});

//====================================================================================================//
//                                            BOT COMMANDS                                            //
//====================================================================================================//

// Bot Commands Block:
client.on('message', message => {

    // MySQL query to add to database:
    function join(discordID, username) {
        var crewSize;
        var sql = "SELECT discordID FROM players WHERE discordID = '" + discordID + "'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.length) {
                message.channel.send(':x: You\'re already part of the crew! :x:');
            } else {
                message.channel.send(':wave: ' + username + ' has joined the crew! :wave:');
                sql = "INSERT INTO players (discordID, username) VALUES ('" + discordID + "', '" + username + "')";
                con.query(sql, function(err) {
                    if(err) throw err;
                    var sql = "SELECT * FROM players";
                    con.query(sql, function(err, result) {
                        if(err) throw err;
                        crewSize = result.length;
                    });
                });
            }
        });
        return crewSize;
    }

    // MySQL query to delete from database:
    function leave(discordID) {
        var sql = "DELETE FROM players WHERE discordID = '" + discordID + "'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.affectedRows > 0) {
                message.channel.send(':leaves: ' + message.author.username + ' has left the crew! Kinda sus... :leaves:');
            } else {
                message.channel.send(':x: You never joined the crew, what\'s wrong with you? :x:');
            }
        });
    }

    // MySQL query to fetch from database:
    function crew() {
        var sql = "SELECT username FROM players";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.length) {
                var crewmates = ':rocket: Current "crewmates" aboard:\n';
                for(var i = 0; i < result.length; i++) {
                    crewmates += '> ' + result[i].username + '\n';
                }
                message.channel.send(crewmates);
            } else {
                message.channel.send(':x: There are no crewmates aboard. The imposters must\'ve murdered them all. :x:');
            }
        });
    }

    // MySQL query to delete all rows from database:
    function reset() {
        var sql = "DELETE FROM players";
        con.query(sql, function(err, result) {
            if(err) throw err;
            message.channel.send(':boom: The ship has exploded. Vitals shows no crewmates alive. :boom:');
        });
    }

    // Generic message checks:
    if(message.author.bot || !message.content.toLowerCase().includes(key)) {
        return;
    }

    // String Manipulation:
    const args = message.content.substring(1);
    const command = args.toLowerCase();

    // Command: '!join':
    if(command === 'join') {
        var crewSize = join(message.author.id, message.author.username);
        if(crewSize == 10) {
            message.channel.send(':rocket: Our spaceship is full and ready to launch! :rocket:');
        } else if(crewSize == 6) {
            message.channel.send(':rocket: @everyone There are at least 6 "crewmates" ready to launch. Anyone else wanting to join? :rocket:');
        }
        return;
    }

    // Command: '!leave':
    if(command === 'leave') {
        leave(message.author.id);
        return;
    }

    // Command: '!help':
    if(command === 'help') {
        var helpMessage = `:cookie: Bot Commands:\n
        :wave: \`join\` - Join the crew!\n
        :leaves: \`leave\` - Leave the crew...\n
        :cookie: \`help\` - Get this command to pop up!\n
        :rocket: \`crew\` - Wanna know who your friends are?\n
        :boom: \`reset\` - Don't press the big red button.`;
        message.channel.send(helpMessage);
        return;
    }

    // Command: '!crew':
    if(command === 'crew') {
        crew();
        return;
    }

    // Command: '!reset':
    if(command === 'reset') {
        reset();
        return;
    }

});

//====================================================================================================//

// Accessing Bot w/ Token:
client.login(process.env.BOT_TOKEN);