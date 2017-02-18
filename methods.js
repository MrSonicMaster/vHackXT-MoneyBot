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
    this.baseURL = 'https://api.vhack.cc/v/2/'; // Changes with updates
    this.config = JSON.parse(fs.readFileSync('./config.json'));
    this.userName = this.config.userName;
    this.userPass = this.config.userPass;
    this.uHashStr = this.config.uHashStr;
  }

  getEndURL(options, values, subURL) { // Helper function, taken from the decompiled app.
    const optionsArr = options.toString().split(';');
    const valuesArr = values.toString().split(';');
    const currentTimeMillis = (~~(Date.now() / 1000)).toString();
    const jsonObj = {};
    for (let i = 0; i < optionsArr.length; i++) jsonObj[optionsArr[i]] = valuesArr[i];
    jsonObj['time'] = currentTimeMillis;
    jsonObj['user'] = this.userName;
    jsonObj['pass'] = this.userPass;
    jsonObj['uhash'] = this.uHashStr;
    const jsonStr = JSON.stringify(jsonObj);
    let base64Json = base64(jsonStr);
    let a2 = MD5(jsonStr.length + MD5(currentTimeMillis));
    let str5 = this.userName + MD5(MD5(this.userPass));
    let str4 = MD5(currentTimeMillis.toString() + '' + jsonStr);
    a2 = MD5('aeffI' + MD5(MD5(base64(a2))));
    str5 = base64(str5);
    str4 = MD5(MD5(a2 + MD5(MD5(str5) + base64(str4))));
    return `${this.baseURL}${subURL}?user=${base64Json}&pass=${str4}`;
  }

  getUserInfo(agent, onfinish) { // TODO: Dry up this code, very repetitive.
    const options = { url: this.getEndURL('', '', 'vh_update.php') };
    if (agent) options.agent = agent;
    request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) return onfinish(`Fatal error: ${err}.`);
      onfinish(JSON.parse(body));
    });
  }

  getPlayerList(agent, isGlobal, onfinish) {
    const options = { url: this.getEndURL('global', isGlobal, 'vh_network.php') };
    if (agent) options.agent = agent;
    request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) return onfinish(`Fatal error: ${err}.`);
      onfinish(JSON.parse(body));
    });
  }

  scanPlayer(agent, playerIP, onfinish) {
    const options = { url: this.getEndURL('target', playerIP, 'vh_scan.php') };
    if (agent) options.agent = agent;
    request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) return onfinish(`Fatal error: ${err}.`);
      onfinish(body);
    });
  }

  hackPlayer(agent, playerIP, onfinish) {
    const options = { url: this.getEndURL('target', playerIP, 'vh_trTransfer.php') };
    if (agent) options.agent = agent;
    request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) return onfinish(`Fatal error: ${err}.`);
      onfinish(JSON.parse(body));
    });
  }
}

module.exports = new Methods();
