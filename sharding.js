//process.exit();
const { ShardingManager } = require('discord.js');
const config = require('./config.json');
const chalk = require('chalk');
const Manager = new ShardingManager('./index.js', { totalShards: 'auto', token: config.token });
console.log(`${chalk.bgRgb(180, 100, 49)('SHARDMNGR')} Firing up the shards...`);

Manager.on('launch', async shard => {
    console.log(`${chalk.bgRgb(180, 100, 49)('SHARDMNGR')} Shard ${shard.id} (Process ${shard.process.pid}) is currently booting...`);
});
Manager.spawn();

process.on('unhandledRejection', (reason, p) => {
    console.log(chalk.bgRed('SHARDMNGRERR ') + 'Unhandled Rejection at: ', p, ', reason:', reason);
});
