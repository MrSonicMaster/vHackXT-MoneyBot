/*
Copyright 2017 Mr.Sonic Master

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const base64 = require('./base64.js');
const request = require('request');
const MD5 = require('md5');
const fs = require('fs');

class Methods {
	constructor() {
		this.baseURL = 'https://api.vhack.cc/v/4/'; // Changes with updates
		this.config = this.parseJSON(fs.readFileSync('./config.json'));
	}

	getEndURL(options, values, subURL) { // Helper function, taken from the decompiled app.
		const optionsArr = options.toString().split(';');
		const valuesArr = values.toString().split(';');
		const currentTimeMillis = (~~(Date.now() / 1000)).toString();
		const jsonObj = {};
		for (let i = 0; i < optionsArr.length; i++) jsonObj[optionsArr[i]] = valuesArr[i];
		jsonObj['time'] = currentTimeMillis;
		jsonObj['user'] = this.config.userName;
		jsonObj['pass'] = this.config.userPass;
		jsonObj['uhash'] = this.config.uHashStr;
		const jsonStr = JSON.stringify(jsonObj);
		let base64Json = base64(jsonStr);
		let a2 = MD5(jsonStr.length + MD5(currentTimeMillis)); // TODO: Update var names to make more sense.
		let str5 = this.config.userName + MD5(MD5(this.config.userPass));
		let str4 = MD5(currentTimeMillis.toString() + '' + jsonStr);
		a2 = MD5('aeffI' + MD5(MD5(base64(a2))));
		str5 = base64(str5);
		str4 = MD5(MD5(a2 + MD5(MD5(str5) + base64(str4))));
		return `${this.baseURL}${subURL}?user=${base64Json}&pass=${str4}`;
	}

	updateUHashStr(uHashStr) { // Not necessary, but in case they later add checking for this.
		this.config.uHashStr = uHashStr;
		fs.writeFileSync('./config.json', JSON.stringify(this.config)); // TODO: Maybe beautify this before storing this?
	}

	getUserInfo(onfinish) { // TODO: Dry up this code, very repetitive.
		request(this.getEndURL('', '', 'vh_update.php'), (err, res, body) => {
			if (err || res.statusCode !== 200) return onfinish(`Fatal error: Status code is ${res.statusCode} for vh_update.php.`);
			onfinish(this.parseJSON(body));
		});
	}

	getPlayerList(isGlobal, onfinish) {
		request(this.getEndURL('global', isGlobal, 'vh_getImg.php'), (err, res, body) => {
			if (err || res.statusCode !== 200) return onfinish(`Fatal error: Status code is ${res.statusCode} for vh_getImg.php.`);
			onfinish(this.parseJSON(body).data);
		});
	}

	resolveIPFromHostname(playerHostname, onfinish) {
		request(this.getEndURL('hostname', playerHostname, 'vh_scanHost.php'), (err, res, body) => {
			if (err || res.statusCode !== 200) return onfinish(`Fatal error: Status code is ${res.statusCode} for vh_scanHost.php.`);
			onfinish(this.parseJSON(body));
		});
	}

	imageToText(image, allNumbers, onfinish) { // Not always perfect, but is close enough sometimes.
		request(`https://megascouts.ml/ocr.php?png=${image}&allNumbers=` + allNumbers, (err, res, body) => {
			if (err || res.statusCode !== 200) return onfinish(`Fatal error: Status code is ${res.statusCode} for MegaScouts ocr.php.`);
			onfinish(body);
		});
	}

	checkPassword(checkpassword, realpassword) { // Passwords are 5 characters long
		let matches = 0;
		for (let i = 0; i < realpassword.length; i++)
			if (realpassword[i] == checkpassword[i]) matches++;
		return matches >= (realpassword.length - 1); // Not super strict.
	}

	loadRemoteData(playerIP, onfinish) {
		request(this.getEndURL('target', playerIP, 'vh_loadRemoteData.php'), (err, res, body) => {
			if (err || res.statusCode !== 200) return onfinish(`Fatal error: Status code is ${res.statusCode} for vh_loadRemoteData.php.`);
			onfinish(this.parseJSON(body));
		});
	}

	hackPlayer(playerIP, port, onfinish) {
		request(this.getEndURL('target;port', `${playerIP};${port}`, 'vh_trTransfer.php'), (err, res, body) => {
			if (err || res.statusCode !== 200) return onfinish(`Fatal error: Status code is ${res.statusCode} for vh_trTransfer.php.`);
			onfinish(this.parseJSON(body));
		});
	}

	parseJSON(JSONString) {
		try {
			return JSON.parse(JSONString);
		} catch (error) {
			return `Fatal error: Failed to parse JSON. Invalid API response, outdated API version?`;
		}
	}
}

module.exports = new Methods();
