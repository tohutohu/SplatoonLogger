const  MongoManager = require('./MongoManager');

require('dotenv').config({path: __dirname + '/../.env'});
const request = require('request');
const twit = require('twit');
const moment = require('moment')
let battle;

const T = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const sleep = (time) => {
  return new Promise(res => {
    setTimeout(res, time);
  })
}
      
const addLog = async () => {
  console.log('Logの追加を開始します')
  const j = request.jar()
  const cookie = request.cookie(process.env.IKSM)

  const url = 'https://app.splatoon2.nintendo.net/api/results'
  j.setCookie(cookie, url)
  request({url: url, jar: j, json: true}, (err, res, body) => {
    if(!body.results){
      T.post('statuses/update', {status: '@to_hutohu\nエラーが発生しました\n'+ body.message +'\n#SplatLog'})
      console.log('authlization error');
      return;
    }
    body.results.forEach(async (result, i) => {
      const j2 = request.jar();
      const url2 = url + '/' + result.battle_number;
      j2.setCookie(cookie, url2);
      const doc = await battle.findOne({battle_number: result.battle_number});
      if(doc)return;
      await sleep(1000 * i);
      request({url: url2, jar: j2, json: true}, (err2, res2, body2) => {
        console.log(body2);
        battle.updateOne({battle_number: result.battle_number}, body2, {upsert: true}, (err, doc) => {
          console.log('added');
          console.log(result)
        });
      })
    })
  })
  console.log('Logの追加しました')
}

const start = async () => {
  battle = await MongoManager.getCollection('Battle');
  //T.post('statuses/update', {status: '@to_hutohu\n起動しました\n' + moment(Date.now()).format() + '\n#SplatLog'}, (err) => console.log(err))
  await addLog()
  setInterval(addLog, 600000);
}

module.exports = start;
