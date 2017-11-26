const cronJob = require('cron').CronJob;
const DayLog = require('./DayLog.js');
const response = require('./Response.js');

const AddLog = require('./AddLog.js');

const init = async () => {

  //セッションの設定

  await AddLog();
  const job = new cronJob({
    cronTime: '5 0 * * *',
    onTick: function(){
      DayLog();
    },
    start: true,
    runOnInit: true,
  });
  job.start();
  await response();
  
};
init();
