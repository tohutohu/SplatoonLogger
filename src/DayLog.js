require('dotenv').config({path:__dirname +  '/../.env'})
const MongoManager = require('./MongoManager')
const twit = require('twit')
const moment = require('moment')
const request = require('request')
const T = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const DayLog = async () => {
  const records = await MongoManager.getCollection('Records')
  const battle = await MongoManager.getCollection('Battle')
  const j = request.jar()
  const cookie = request.cookie(process.env.IKSM)

  const url = 'https://app.splatoon2.nintendo.net/api/records'
  j.setCookie(cookie, url)
  request({url: url, jar: j, json: true}, async (err, res, body) => {
    if(!body.records)return
    body.time = moment(Date.now()).unix()
    await records.insertOne(body)
    const lastDay = moment(Date.now()).subtract(1, 'day').startOf('day').unix()
    records.findOne({time: {$gte: lastDay}}, (err, doc) => {
      console.log(doc)
      if(!doc.records)return
      const win = body.records.win_count - doc.records.win_count
      const lose = body.records.lose_count - doc.records.lose_count
      const paintPoint = body.challenges.total_paint_point - doc.challenges.total_paint_point
      console.log(win, lose, paintPoint)
      T.post('statuses/update', {status: `今日の記録\n試合数：${win+lose}(勝${win},負${lose})\n勝率${win/(win+lose)}\n塗りポイント：${paintPoint}\n#SplatLog`})
    })
  })
}
module.exports = DayLog

