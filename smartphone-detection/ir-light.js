const { Client } = require('tplink-smarthome-api');
const client = new Client();

let command = process.argv[2] === "true" ? true : false;
// Host = Static IP of your smart plug
const plug = client.getPlug({host: 'xxx.xxx.x.xx'});

plug.setPowerState(command);