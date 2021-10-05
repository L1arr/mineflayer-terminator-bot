module.exports = () => ({
  /*
  'midnight-bot': {
    load: './collect.js',
    autorun: '12am', // Tell the bot to run every midnight
  },
  */
  'regular-bot': {
    load: './index.js',
    autorun: ':00', // Tell the bot to run at every o'clock
  }
});
