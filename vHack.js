/*
Copyright 2017 Mr.Sonic Master

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const Methods = require('./methods.js');

class vHackBot {
  constructor(clientID) {
    this.delayBetweenActions = 2400; // In miliseconds.
    this.agent = null;//agents[clientID] || null;
    this.clientID = clientID || 0;
    this.isGlobalSearch = 1;
    this.debugLevel = 0; // Log level, 0-4 (0=normal, 4=debug)
    this.log(`INIT delay=${this.delayBetweenActions} isGlobal=${this.isGlobalSearch}`, 4);
    this.login();
  }

  login() {
    this.log('Starting login...', 1);
    Methods.getUserInfo(this.agent, (userInfo) => {
      if (userInfo.toString().includes('Fatal')) return this.log(userInfo, 0);
      if (!userInfo.ip) return this.log('Fatal Error: Invalid login credentials?', 0);
      this.log(`Logged in; userIP=${userInfo.ip}`, 0);
      setTimeout(this.getPlayerList.bind(this), this.delayBetweenActions);
      this.log(`Got user data ${userInfo}`, 4);
    });
  }

  getPlayerList() {
    this.log('Get new player list.', 0);
    Methods.getPlayerList(this.agent, this.isGlobalSearch, (playerList) => {
      if (playerList.toString().includes('Fatal')) return this.log(playerList, 0);
      this.parsePlayerList(playerList.data);
      this.log(`Got list data ${playerList}`, 4);
    });
  }

  parsePlayerList(playerList) {
    for (let i = 0; i < playerList.length; i++) {
      setTimeout(() => {
        const player = playerList[i];
        this.log(`Parsed player data ${player}`, 4);
        const alreadyAttacked = player.attacked;
        const playerIP = player.ip;
        if ((i + 1) == playerList.length) this.getPlayerList();
        if (alreadyAttacked == '1') return;
        this.scanPlayer(playerIP);
      }, i * this.delayBetweenActions);
    }
  }

  scanPlayer(playerIP) {
    Methods.scanPlayer(this.agent, playerIP, (scanResult) => {
      if (scanResult.toString().includes('Fatal')) return this.log(scanResult, 0);
      if (!scanResult.includes('Anonymous: ')) return;
      const isAnonymous = scanResult.split('Anonymous: ')[1].split('\n')[0];
      if (isAnonymous == "YES") setTimeout(() => { this.hackPlayer(playerIP); }, this.delayBetweenActions);
      this.log(`Scanned player ${playerIP} scanResult ${scanResult}`, 4);
    });
  }

  hackPlayer(playerIP) {
    Methods.hackPlayer(this.agent, playerIP, (result) => {
      if (result.toString().includes('Fatal')) return this.log(result, 0);
      this.log(`Hacked player ${playerIP} result ${result}`, 4);
      if (result.result == "0") this.log(`Gained: $${result.amount}. New money amount: $${result.newmoney}.`, 0);
    });
  }

  log(message, logLevel = 4) {
    if (this.debugLevel >= logLevel) console.log(`Client ${this.clientID}: ${message}`);
  }
}

new vHackBot(0);
