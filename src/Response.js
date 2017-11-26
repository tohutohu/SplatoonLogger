const twit = require('twit');

require('dotenv').config({path: __dirname + '/../.env'});
const moment = require('moment');
const MongoManager = require('./MongoManager');

let battle;

const T = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const getQuery = (start, end, ) => {
  const query = {start_time: { $gte: start, $lte: end}};
  return query;
};

const getWinRate = async (start, end, rule, type, mode) => {
  
  const query = getQuery(start, end);
  Object.assign(query, {'rule.key': rule, type:type, 'game_mode.key': mode});
  Object.keys(query).forEach(pro => {
    if(!query[pro]){
      delete query[pro];
    }
  });
  const total = await battle.find(query).count();
  const win = await battle.find(Object.assign(query, {'my_team_result.key':'victory'})).count();

  return {total, win};
};

const init = async () => {
  const stream = T.stream('user');
  battle = await MongoManager.getCollection('Battle');


  stream.on('tweet', async tweet => {
    if(tweet.user.screen_name !== 'to_hutohu')return;

    const text = tweet.text;
    if(!text.match(/Request/))return;
    console.log(text);
    let arr;

    arr = text.match(/勝率/);
    if(arr){
      let start, end, rule, type, mode;
      if(text.match(/今日|きょう/)){
        start = moment(Date.now()).startOf('day').unix();
        end = moment(Date.now()).endOf('day').unix();
      }else if(text.match(/昨日|きのう/)){
        start = moment(Date.now()).subtract(1, 'day').startOf('day').unix();
        end = moment(Date.now()).subtract(1, 'day').endOf('day').unix();
      }else if(text.match(/今週|こんしゅう/)){
        start = moment(Date.now()).startOf('week').unix();
        end = moment(Date.now()).endOf('week').unix();
      }else if(text.match(/先週|せんしゅう/)){
        start = moment(Date.now()).subtract(1, 'week').startOf('week').unix();
        end = moment(Date.now()).subtract(1, 'week').endOf('week').unix();
      }else if(text.match(/今月|こんげつ/)){
        start = moment(Date.now()).startOf('month').unix();
        end = moment(Date.now()).endOf('month').unix();
      }else if(text.match(/先月|せんげつ/)){
        start = moment(Date.now()).subtract(1, 'month').startOf('month').unix();
        end = moment(Date.now()).subtract(1, 'month').endOf('month').unix();
      }else{
        start = moment('2000-01-01').unix();
        end = moment(Date.now()).unix();
      }

      if(text.match(/ホコ|ほこ|鉾/)){
        rule = 'rainmaker';
      }else if(text.match(/ヤグラ|やぐら|櫓/)){
        rule = 'tower_control';
      }else if(text.match(/エリア|えりあ/)){
        rule = 'splat_zones';
      }else if(text.match(/ナワバリ|レギュラー/)){
        rule = 'turf_war';
      }else{
        rule = null;
      }

      if(text.match(/ガチ|がち/)){
        type = 'gachi';
      }else{
        type = null;
      }

      if(text.match(/プラベ|ぷらべ/)){
        mode = 'private';
      }else{
        mode = null;
      }

      const res = await getWinRate(start, end, rule, type, mode);
    
      
      T.post('statuses/update', {in_reply_to_status_id: tweet.id_str, 
        status: `@to_hutohu\n${res.total}戦中${res.win}勝\n勝率は${Math.round(res.win*10000/res.total)/100}%です。\n#SplatLog`});
    }
  });
};
module.export = init;


