/*
 * "System Kernel" VK bot.
 */

const config = require('./config.json');
const log = require('fancy-log');
const VK = require('vk-io');
const MongoClient = require('mongodb').MongoClient;
const redis = require('redis');

let VKClient = new VK(config.vk);
VKClient.setToken(config.tokens.user);

let kernelBase = {};

MongoClient.connect(`mongodb://${config.mongo.ip}:${config.mongo.port}/${config.mongo.db}`, (err, db) => {
	if (err) {
		log.error('Connection to MongoDB failed', err);
	} 
	kernelBase = db;
});

let redisClient = redis.createClient(config['redis']);
const botNames = ['жаж', 'жыж', 'жойч', 'жож'];
const comNames = {
	'напиши': (message, splitedMsg) => {
		//	|		In that step i use magic number '2', 
		//	v 	coz in this step i need to consider length of space character.
		let responseText = message.text.slice(splitedMsg[0].length + splitedMsg[1].length + 2);
		message.send(responseText);
	},
	'повтори': (message, splitedMsg) => {
		let repeatCount = splitedMsg[2];
		let responseText = message.text.slice(splitedMsg[0].length + splitedMsg[1].length + repeatCount.length + 3);

		// let sendMessage = (responseText, random) => {
			
		// }

		for (let i = 0; i < repeatCount; i++) {
			let random = Math.round(100*Math.random());
			setTimeout(() => {
				message.send(`${responseText} [${random}]`);
			}, random*1000);
		}


	}
}


VKClient.longpoll.start()
.then(() => {
    log('Long Poll запущен');
    VKClient.longpoll.on('message', (message) => {

    	console.log(`New message: ${message.text}`);

			let splitedMsg = message.text.split(' ');
			let possibleName = splitedMsg[0].replace(',', '');

			if (botNames.indexOf(possibleName) >= 0) {

				console.log(`They called me like ${possibleName}! Horray!`);

				let possibleCom = splitedMsg[1]

				console.log(`They want to make a ${possibleCom}`);

				if (Object.keys(comNames).indexOf(possibleCom) >= 0) {

					console.log('Allright! I can do this!');
					console.log(message.text);

					comNames[possibleCom](message, splitedMsg);

				}

			}	
    });
})
.catch((error) => {
    log.error(error);
});

