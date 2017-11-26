require('dotenv').config({path: __dirname + '/../.env'});
const mongo = require('mongodb').MongoClient;
const DB_HOST = process.env.MONGODB_HOSTNAME;
const DB_USER = process.env.MONGODB_USERNAME;
const DB_PASS = process.env.MONGODB_PASSWORD;
const DB_NAME = process.env.MONGODB_DATABASE;
const MONGO_URL = 'mongodb://' + DB_USER +':'+ DB_PASS+'@'+ DB_HOST + ':27017/' + DB_NAME;

class Connect{
  constructor(){
    this.db = null;
  }

  async init(){
    console.log('接続する');
    this.db = await mongo.connect(MONGO_URL);
    console.log('接続しました');
  }

  async getDb(){
    if(!this.db){
      await this.init();
    }
    return this.db;
  }

  async getCollection(name){
    if(!this.db){
      await this.init();
    }
    const collection = await this.db.collection(name);
    return collection;
  }
}
const po = new Connect();
module.exports = po;
