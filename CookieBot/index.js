// CookieBot - Written by Ncookie
// Invite Link: https://discord.com/oauth2/authorize?client_id=749021066571022387&scope=bot&permissions=388160

//====================================================================================================//
//                                            INITIAL SETUP                                           //
//====================================================================================================//

// Initializations:
const discord = require('discord.js');
const client = new discord.Client();
const mysql = require('mysql');
const key = 'cookie';
const prefix = 'cookie ';
const db_host = '65.19.141.67';
const db_user = 'ncookie_ncookie';
const db_name = 'ncookie_ClaimsDB';

// Connecting to MySQL:
var con = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: process.env.COOKIEBOT_PASS,
    database: db_name
});
con.connect(function(err) {
    if(err) throw err;
    console.log('MySQL has been connected to with plenty of cookies to spare.');
});

// Startup Message:
client.once('ready', () => {
    console.log('CookieBot is ready to deliver the goods.');

    // MySQL query to check and delete elapsed claims:
    function checkClaims() {
        var date = new Date();
        date.setDate(new Date().getDate() - 3);
        var sql = "SELECT * FROM claims WHERE time < '" + date.toISOString().slice(0, 19).replace('T', ' ') + "'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.length) {
                for(var i = 0; i < result.length; i++) {
                    sql = "DELETE FROM claims WHERE claim LIKE '" + result[i].claim + "'";
                    con.query(sql, function(err, result) {
                        if(err) throw err;
                        if(result.affectedRows < 1) {
                            console.log('ERROR WHILE DELETING ELAPSED CLAIMS');
                        }
                    });
                    client.users.cache.get(result[i].userID).send(':cookie: Your claim to ' + result[i].claim + ' has expired. It can now be claimed by others.');
                    console.log('----- CLAIMS: Claim ' + result[i].claim + ' @ ' + result[i].time + 'from ' + result[i].username + ' has been invalidated.');
                }
            } else {
                console.log('----- CLAIMS: No claims invalidated during startup.');
            }
        });
    }

    // Checking for elapsed claims on startup (runs at least once a day):
    checkClaims();

});


// Cookie Bible Quotes Library:
var quotes = ['The cookie is untouchable.', 'There is only one true cookie.', 'May the cookies reign supreme.', 'To dip in milk is life\'s true pleasures.', 'It is the king of the bakery.', 'Its chips can melt your soul.', 'Its crunch deafening - its sight rivetting.', 'The only choice is surrender.', 'The cookie cannot be stopped.', 'The chips made of the highest quality chocolate touch our tongues and hearts with gentleness.', 'The cookie has a hatred for bagels.'];

// Cookie Roast Library:
var roasts = ['This dude <X> has more chromosomes than starting villages.', 'Imagine being in the Cookie Shitlist like <X>. Must be sad.', 'Cookie farts smell much nicer than <X>.', 'The day <X> says something smart is the day cookies forget how to fly.', '<X> is nothing but a bagel.', 'I bet <X> has market 30 on all their villages.', 'The one true cookie is very displeased with you, <X>. Repent.'];

//====================================================================================================//
//                                            BOT COMMANDS                                            //
//====================================================================================================//

// Bot Commands Block:
client.on('message', message => {

    // Anti-Spy Measures:
    if(message.channel.type == 'dm') {
        return;
    } else if(!message.author.bot && !(message.guild.id == '728968437996716042')) {
        console.log(message.author.username + ': ' + message.content);
    }

    // Uncomment to get author info:
    //console.log(message.author);

    // MySQL query to add claim to database:
    function addClaim(discordID, username, claim) {
        sqlClaim = claim.substring(0, 3) + '_' + claim.substring(4);
        var sql = "SELECT username FROM claims WHERE claim LIKE '" + sqlClaim + "'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.length) {
                console.log('----- CLAIMS: ' + username + ' (' + discordID + ') has tried claiming ' + claim + '.');
                message.channel.send(':cookie: That village has already been claimed by ' + result[0].username + '. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            } else {
                sql = "INSERT INTO claims (userID, username, claim, time) VALUES ('" + discordID + "', '" + username + "', '" + claim + "', '" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "')";
                con.query(sql, function(err) {
                    if(err) throw err;
                    console.log('----- CLAIMS: ' + username + ' (' + discordID + ') has claimed ' + claim + '.');
                    message.channel.send(':cookie: Your claim has been made. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
                });
            }
        });
    }

    // MySQL query to delete claim from database:
    function deleteClaim(discordID, username, claim) {
        sqlClaim = claim.substring(0, 3) + '_' + claim.substring(4);
        var sql = "DELETE FROM claims WHERE userID = '" + discordID + "' AND claim LIKE '" + sqlClaim + "'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.affectedRows > 0) {
                console.log('----- CLAIMS: ' + username + ' (' + discordID + ') has deleted their ' + claim + ' claim.');
                message.channel.send(':cookie: Your claim has been deleted. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            } else {
                console.log('----- CLAIMS: ' + username + ' (' + discordID + ') has tried deleting a claim to ' + claim + '.');
                message.channel.send(':cookie: No such claim was found. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            }
        });
    }

    // MySQL query to get all of a user's claims from database:
    function getClaims(discordID, username) {
        var sql = "SELECT * FROM claims WHERE userID = '" + discordID + "'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.length) {
                var claims = '';
                for(var i = 0; i < result.length; i++) {
                    claims += '> ' + result[i].claim + '\n';
                }
                client.users.cache.get(discordID).send(':cookie: You have claimed the following villages:\n' + claims);
                console.log('----- CLAIMS: ' + username + ' (' + discordID + ') has retrieved their list of claims.');
                message.channel.send(':cookie: You have been DMd your claims. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            } else {
                console.log('----- CLAIMS: ' + username + ' (' + discordID + ') has tried to retrieve their list of claims but had none.');
                message.channel.send(':cookie: You don\'t seem to have made any claims. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            }
        });
    }

    // MySQL query to get all claims from database:
    function getAllClaims() {
        var sql = "SELECT * FROM claims";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.length) {
                var claims = '';
                client.users.cache.get('130396053399797760').send(':cookie: All Claims:');
                for(var i = 0; i < result.length; i++) {
                    claims += '> ' + result[i].username + ' has claimed ' + result[i].claim + ' on ' + result[i].time + '.\n';
                    if(claims.length > 1500) {
                        client.users.cache.get('130396053399797760').send(claims);
                        claims = '';
                    }
                }
                if(claims.length) {
                    client.users.cache.get('130396053399797760').send(claims);
                }
                console.log('----- CLAIMS: Ncookie has retrieved all claims in the database.');
                message.channel.send(':cookie: You have been DMd all claims. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            } else {
                console.log('----- CLAIMS: Ncookie has tried to retrieve all claims from the database but there were none.');
                message.channel.send(':cookie: There are no claims in the database. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            }
        });
    }

    // MySQL query to delete all null claim from database <TODO>:
    function deleteNullClaims() {
        // Need select statement to send messages to users before deleting. <TODO>
        var sql = "DELETE FROM claims WHERE time = 'null'";
        con.query(sql, function(err, result) {
            if(err) throw err;
            if(result.affectedRows > 0) {
                // <TODO>
            } else {
                console.log('----- CLAIMS: No null claims have been found to delete.');
            }
        });
    }

    // Checking if message contains 'THC':
    if(!message.author.bot && message.content.toLowerCase().includes('thc')) {
        message.react('🤮');
    }

    // Generic message checks:
    if(message.author.bot || !message.content.toLowerCase().includes(key)) {
        return;
    } else if(!message.content.toLowerCase().startsWith(prefix)) {
        message.react('🍪');
        return;
    }

    // String Manipulation:
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // Command: 'cookie help':
    if(command === 'help') {
        message.channel.send(`:cookie: What cookies shall I bless upon thee today?\n
    :man_shrugging: \`cookie help\` - Displays this very command!\n
    :thumbsup: \`cookie check\` - The cookie shall dictate if your idea is a good or bad one.\n
    :pray: \`cookie praise\` - Allow your inner self to give into the deliciousness of a cookie.\n
    :crossed_swords: \`cookie calc\` - Along with a cookie, you shall have a simple battle simulator for TW2.\n
    :abacus: \`cookie hiba\` - The most accurate battle simulator for TW2 shall be yours if you accept cookies into your heart.\n
    :map: \`cookie map\` - The one and only cookie shall guide you to a great mapping tool for TW2.\n
    :desktop: \`cookie forum\` - You can be led to our world's forums by the great cookie.\n
    :carousel_horse: \`cookie hc\` - There is no hope.\n
    :milk: \`cookie milk\` - What could possibly be better than this sacred combination?\n
    :dash: \`cookie fart\` - The sacred gases must be released.\n
    :fire: \`cookie roast\` - You may request from the great cookie a great roast to one you despise.\n
    :archery: \`cookie claim\` - You may claim a village for yourself! Please enter its coordinates.\n
    Also, be careful - even mentioning the great name of 'cookie' in any message will summon it.`);
        return;
    }

    // Command: 'cookie check':
    if(command === 'check') {
        (Math.floor(Math.random() * 100)) > 50 ? message.channel.send(':cookie::thumbsup:') : message.channel.send(':cookie::thumbsdown:');
        return;
    }

    // Command: 'cookie praise':
    if(command === 'praise') {
        var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        message.channel.send(':cookie::pray: ' + randomQuote + ' :pray::cookie:');
        return;
    }

    // Command: 'cookie calc':
    if(command === 'calc') {
        message.channel.send(':cookie: The one true cookie presents you with a link: http://tw2calc.com/');
        return;
    }

    // Command: 'cookie hiba':
    if(command === 'hiba') {
        message.channel.send(':cookie: The one true cookie presents you with a link: https://docs.google.com/spreadsheets/d/1Y-UPCQvlQbulStftYKGhjge2JTrh6s1bUUjVoKL1eLQ/edit?usp=sharing');
        return;
    }

    // Command: 'cookie map':
    if(command === 'map') {
        message.channel.send(':cookie: The one true cookie presents you with a link: https://tribalwars2map.com/en/en56');
        return;
    }

    // Command: 'cookie forum':
    if(command === 'forum') {
        message.channel.send(':cookie: The one true cookie presents you with a link: https://en.forum.tribalwars2.com/index.php?forums/daulatabad-en56.279/');
        return;
    }

    // Command: 'cookie hc':
    if(command === 'hc') {
        message.channel.send(':carousel_horse::cookie::carousel_horse: It is surounded by armoured horses, there is nothing anyone can do.');
        return;
    }

    // Command: 'cookie milk':
    if(command === 'milk') {
        message.channel.send(':cookie::milk:');
        return;
    }

    // Command: 'cookie fart':
    if(command === 'fart') {
        message.channel.send(':cookie::dash:');
        return;
    }

    // Command: 'cookie roast':
    if(command === 'roast') {
        var extraCommand = args.shift().toLowerCase();
        var roastee = '';
        if(extraCommand == null) {
            roastee = 'THC';
        } else if(extraCommand == 'cookie' || extraCommand == 'ncookie' || extraCommand == 'cookiebot') {
            roastee = message.author.username;
        } else {
            roastee = extraCommand;
        }
        var randomRoast = roasts[Math.floor(Math.random() * roasts.length)].replace('<X>', roastee);
        message.channel.send(':cookie::fire: ' + randomRoast + ' :fire::cookie:');
        return;
    }

    // Command: 'cookie claim':
    if(command === 'claim') {
        var extraCommand = args.shift();

        // If 'cookie claim delete xxx,yyy':
        if(extraCommand == 'delete') {
            var extraCommand = args.shift();

            // Checking for invalid coordinates:
            if(extraCommand == null) {
                message.channel.send(':cookie: Please use the format `cookie claim XXX,YYY` in order to claim a village, or `cookie claim delete XXX,YYY` in order to unclaim a village. To see all your claims please use `cookie claim list`. This message will self-destruct in 15 seconds. :cookie:').then(reply => {reply.delete({timeout: 15000})}).then(message.delete({timeout: 15000}));
                return;
            } else if(extraCommand.length == 7) {
                for(var i = 0; i < 7; i++) {
                    if(!(extraCommand.charAt(i) >= '0' && extraCommand.charAt(i) <= '9')) {
                        if(i != 3) {
                            message.channel.send(':cookie: Those doesn\'t seem like valid coordinates. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
                            return;
                        }
                    }
                }

                // Deleting claim:
                deleteClaim(message.author.id, message.author.username, extraCommand);

            } else {
                message.channel.send(':cookie: Please use the format `cookie claim XXX,YYY` in order to claim a village, or `cookie claim delete XXX,YYY` in order to unclaim a village. To see all your claims please use `cookie claim list`. This message will self-destruct in 15 seconds. :cookie:').then(reply => {reply.delete({timeout: 15000})}).then(message.delete({timeout: 15000}));
                return;
            }

        // If 'cookie claim list':
        } else if(extraCommand == 'list') {
            
            // Getting user's claims:
            getClaims(message.author.id, message.author.username);

        // If 'cookie claim db':
        } else if(extraCommand == 'db') {

            // Getting all claims from database:
            if(message.author.id == '130396053399797760') {
                getAllClaims();
            } else {
                message.channel.send(':cookie: You don\'t have permission to use this command. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            }
        
        // If 'cookie claim dbclean':
        } else if(extraCommand == 'dbclean') {

            // Getting all claims from database:
            if(message.author.id == '130396053399797760') {
                deleteNullClaims();
            } else {
                message.channel.send(':cookie: You don\'t have permission to use this command. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
            }

        // If 'cookie claim ?':
        } else if(extraCommand == null || extraCommand.length != 7) {
            message.channel.send(':cookie: Please use the format `cookie claim XXX,YYY` in order to claim a village, or `cookie claim delete XXX,YYY` in order to unclaim a village. To see all your claims please use `cookie claim list`. This message will self-destruct in 15 seconds. :cookie:').then(reply => {reply.delete({timeout: 15000})}).then(message.delete({timeout: 15000}));
            return;

        // If 'cookie claim xxx,yyy':
        } else {

            // Checking for invalid coordinates:
            for(var i = 0; i < 7; i++) {
                if(!(extraCommand.charAt(i) >= '0' && extraCommand.charAt(i) <= '9')) {
                    if(i != 3) {
                        message.channel.send(':cookie: Those doesn\'t seem like valid coordinates. This message will self-destruct in 5 seconds. :cookie:').then(reply => {reply.delete({timeout: 5000})}).then(message.delete({timeout: 5000}));
                        return;
                    }
                }
            }

            // Making new claim:
            addClaim(message.author.id, message.author.username, extraCommand);
        }
    }
});

//====================================================================================================//

// Accessing Bot w/ Token:
client.login(process.env.COOKIEBOT_TOKEN);