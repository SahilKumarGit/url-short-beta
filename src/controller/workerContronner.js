const TelegramBot = require('node-telegram-bot-api');
const shortid = require('shortid');
const urlModel = require('../models/urlModel');
const { SET_ASYNC, GET_ASYNC } = require('../redis.config');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

let invalidURL = function (val) {
    let rejx = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/
    return !rejx.test(val)
}

module.exports.worker = async function () {
    try {
        bot.on('message', async (MESSAGE) => {

            if (MESSAGE.entities && MESSAGE.entities.length > 0 && MESSAGE.entities[0].type == 'bot_command') {
                if (MESSAGE.text == '/start') {
                    return await start(MESSAGE)
                } else if (MESSAGE.text == '/about') {
                    return await about(MESSAGE)
                } else if (MESSAGE.text == '/developer') {
                    return await developer(MESSAGE)
                } else if (MESSAGE.text == '/git_repo') {
                    return await sendRepoLink(MESSAGE)
                } else {
                    return await error(MESSAGE)
                }
            } else {
                return await generate(MESSAGE)
            }

        });
    } catch (e) {
        console.log(e.message)
    }
}

// let val = {
//     message_id: 1,
//     from: {
//         id: 1055295348,
//         is_bot: false,
//         first_name: 'Sahil Kk',
//         language_code: 'en'
//     },
//     chat: { id: 1055295348, first_name: 'Sahil Kk', type: 'private' },
//     date: 1660048527,
//     text: '/start',
//     entities: [{ offset: 0, length: 6, type: 'bot_command' }]
// }


async function start(DATA) {
    try {
        let from = DATA.from
        // let chat = DATA.chat
        // let text = DATA.text

        let message = `Hello ${from.first_name},\nI can help you create Short Urls\n\nYou can control me by sending these commands:    \n\n/about - About this bot. \n/developer - Get developer info. \n\n\nDeveloped By Sahilks`

        return await bot.sendMessage(from.id, message)
    } catch (e) {
        console.log(e.message, 'from /start')
    }
}


async function about(DATA) {
    try {
        let from = DATA.from
        // let chat = DATA.chat
        // let text = DATA.text

        let message = `This is an url shortener bot (project)\nVersion: 1.0.0.β\nDeveloped By Sahilks\n\nAlso, you can visit my website: http://uri.sahilks.in`

        return await bot.sendMessage(from.id, message)
    } catch (e) {
        console.log(e.message, 'from /about')
    }
}


async function developer(DATA) {
    try {
        let from = DATA.from
        // let chat = DATA.chat
        // let text = DATA.text

        let message = `Hello, My name is Sahil Kumar. \n\nLinkedIn: linkedin.com/in/sahil-kumar-sahoo-b305a7205 \nGitHub: github.com/SahilKumarGit \n\nYou can control me by sending these commands: \n\n/git_repo - Github project repository link \n\nThank You.`

        return await bot.sendMessage(from.id, message)
    } catch (e) {
        console.log(e.message, 'from /developer')
    }
}

async function sendRepoLink(DATA) {
    try {
        let from = DATA.from
        // let chat = DATA.chat
        // let text = DATA.text

        let message = `GitHub Repo Link: \nhttps://github.com/SahilKumarGit/url-short-beta.git`

        return await bot.sendMessage(from.id, message)
    } catch (e) {
        console.log(e.message, 'from /sendRepoLink')
    }
}


async function error(DATA) {
    try {
        let from = DATA.from
        // let chat = DATA.chat
        // let text = DATA.text
        let message = `👎 ERROR - Bad Request!`
        return await bot.sendMessage(from.id, message)
    } catch (e) {
        console.log(e.message, 'from /error')
    }
}



async function generate(DATA) {
    try {
        let from = DATA.from
        // let chat = DATA.chat
        let text = DATA.text.trim() || ""
        if (!text) return await bot.sendMessage(from.id, `Please Send an URL.`)
        if (invalidURL(text)) return await bot.sendMessage(from.id, `This URL is invalid.\n\nMake sure the URL contains HTTP, HTTPS, or FTP then the Domain name like:\nhttp://www.example.com/any`)
        if (text.includes('uri.sahilks.in')) return await bot.sendMessage(from.id, `This URL is invalid. \nYou can't generate any short URL related to this domain name.`)
        return await makeUrl(from.id, text)
    } catch (e) {
        console.log(e.message, 'from /error')
    }
}

async function makeUrl(to, longUrl) {
    try {
        const sortUrlDomain = `http://uri.sahilks.in`;

        const getUrlFromCatch = await GET_ASYNC(longUrl);
        if (getUrlFromCatch) {
            //return data
            // console.log('get data from cache')
            const urlData = JSON.parse(getUrlFromCatch)
            let msg = `🎉Congratulations, \nYou just created a new short URL. \n\nMain Url: \n${longUrl} \n\nGenerated Short Url: \n${urlData.shortUrl} \n\nNow copy this 👆 given Url and send it to your friends.`
            return await bot.sendMessage(to, msg)
        }

        /*------ check if unique id already exist or NOT -------*/
        const isExistLongUrl = await urlModel.findOne({
            longUrl,
        }).select({
            _id: 0,
            __v: 0,
        });

        if (isExistLongUrl) {
            // console.log('get data DB and its already exist')
            await SET_ASYNC(`${longUrl}`, JSON.stringify(isExistLongUrl));
            let msg = `🎉Congratulations, \nYou just created a new short URL. \n\nMain Url: \n${longUrl} \n\nGenerated Short Url: \n${isExistLongUrl.shortUrl} \n\nNow copy this 👆 given Url and send it to your friends.`
            return await bot.sendMessage(to, msg)
        }

        /*------ generate short id -------*/
        const urlCode = shortid.generate().toLowerCase();
        const rawData = {
            urlCode,
            longUrl,
            shortUrl: `${sortUrlDomain}/${urlCode}`,
        };

        /*--------- save in db ----------*/
        await urlModel.create(rawData);
        await SET_ASYNC(`${longUrl}`, JSON.stringify(rawData));

        let msg = `🎉Congratulations, \nYou just created a new short URL. \n\nMain Url: \n${longUrl} \n\nGenerated Short Url: \n${rawData.shortUrl} \n\nNow copy this 👆 given Url and send it to your friends.`
        return await bot.sendMessage(to, msg)

    } catch (e) {
        console.log(e.message, 'from /error')
        return await bot.sendMessage(to, `Something went wrong! Please try after some time.`)
    }
}