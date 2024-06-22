const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const db = require('./Database.js');
const blacklist = require('./blacklist.js');
const config = require('./config.json');

const verificationCodes = new Map();
const dailyRewards = new Map();
const balancesFile = 'balances.json';

// قراءة البيانات من ملف JSON عند بدء التشغيل
let balances = {};
if (fs.existsSync(balancesFile)) {
    const data = fs.readFileSync(balancesFile);
    balances = JSON.parse(data);
}

function saveBalances() {
    fs.writeFileSync(balancesFile, JSON.stringify(balances, null, 2));
}

function sendVerificationCode(userId, recipientUserId, points, message) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    verificationCodes.set(userId, {
        code: verificationCode,
        recipient: recipientUserId,
        points: points
    });

    const embed = new MessageEmbed()
        .setTitle('Verification Required')
        .setDescription(`Your verification code is **${verificationCode}**. You have 10 seconds to use it.`)
        .setColor('YELLOW');

    message.author.send({ embeds: [embed] });

    setTimeout(() => {
        verificationCodes.delete(userId);
    }, 10000);
}

function updateBalance(userId) {
    const userBalance = db.getBalance(userId) || 0;
    balances[userId] = userBalance;
    saveBalances();
}

function handleCeroCommand(message) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const userId = message.author.id;

    if (command === 'cero') {
        if (blacklist.isUserIdBlacklisted(userId)) {
            const reason = blacklist.getBlacklistReason(userId);
            message.reply(`You are blacklisted and cannot use this command. Reason: ${reason}`);
            return;
        }

        if (args.length === 0) {
            updateBalance(userId);
            const userBalance = balances[userId] || 0;
            message.reply(`Your balance is ${userBalance} points.`);
        } else if (args.length === 1) {
            const targetUserId = args[0].replace('<@!', '').replace('>', '');
            updateBalance(targetUserId);
            const targetBalance = balances[targetUserId] || 0;
            message.reply(`User <@${targetUserId}> balance is ${targetBalance} points.`);
        } else if (args.length === 2 && args[0].startsWith('<@!') && !isNaN(args[1])) {
            const recipientUserId = args[0].replace('<@!', '').replace('>', '');
            const points = parseInt(args[1]);

            if (points <= 0) {
                message.reply('Invalid points amount.');
                return;
            }

            const fromBalance = balances[userId] || 0;

            if (fromBalance < points) {
                message.reply('Insufficient balance to transfer points.');
                return;
            }

            if (verificationCodes.has(userId)) {
                const verificationData = verificationCodes.get(userId);
                if (verificationData.recipient === recipientUserId && verificationData.points === points) {
                    db.addPoints(recipientUserId, points);
                    db.addPoints(userId, -points);
                    updateBalance(recipientUserId);
                    updateBalance(userId);
                    message.reply(`Transferred ${points} points to <@${recipientUserId}>.`);
                    verificationCodes.delete(userId);
                    console.log(`Transferred ${points} points from ${userId} to ${recipientUserId}.`);
                } else {
                    message.reply('Incorrect verification code or mismatch in transfer details.');
                }
            } else {
                sendVerificationCode(userId, recipientUserId, points, message);
                message.reply('Please check your DMs for the verification code.');
            }
        } else {
            message.reply('Invalid command format. Use `$cero` to check your balance, or `$cero {mention or user ID} {amount}` to transfer points.');
        }
    } else if (command === 'daily') {
        const now = Date.now();
        const lastClaimed = dailyRewards.get(userId) || 0;
        const timeSinceLastClaim = now - lastClaimed;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (timeSinceLastClaim >= twentyFourHours) {
            db.addPoints(userId, 10); // Add 10 points
            dailyRewards.set(userId, now);
            updateBalance(userId);
            message.reply('You have received your daily 10 points.');
        } else {
            const timeLeft = twentyFourHours - timeSinceLastClaim;
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            message.reply(`You need to wait ${hoursLeft} hours and ${minutesLeft} minutes before claiming your daily points again.`);
        }
    }
}

// احفظ التوازنات عند إيقاف التشغيل
process.on('exit', () => {
    saveBalances();
});

module.exports = {
    handleCeroCommand
};
