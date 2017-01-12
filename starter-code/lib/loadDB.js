'use strict'

const bluebird = require('bluebird')
const fsProm = bluebird.promisifyAll(require('fs'))
const pg = require('pg')
const Pool = pg.Pool
const ops = module.exports = {}

const pool = new Pool({
  user: 'Adrian',
  password: 'deathcrush',
  host: 'localhost',
  database: process.env.USER,
  max: 10,
  idleTimeoutMillis: 1000
})

const loadRecord = function(record) {
  const sqlVals = [record.title, record.author, record.authorUrl, record.category, record.publishedOn, record.body]
  const sqlString = `INSERT INTO
                     articles(title, author, "authorUrl", category, "publishedOn", body)
                     VALUES($1, $2, $3, $4, $5, $6);`

  return new Promise((res, rej) => {
    res(pool.query(sqlString, sqlVals))
    .catch(err => rej(err))
  })
}

ops.createTable = function() {
  return new Promise((res, rej) => {
    const sqlCreate = `
    CREATE TABLE IF NOT EXISTS
    articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL
    );`

    res(
      pool.query(sqlCreate)
      .then(() => console.log('create success'))
      .catch(err => rej(err))
    )
  })
}

pool.on('error', e => console.error(e))

ops.readJSON = (file) => {
  return fsProm.readFileAsync(`${__dirname}/../public/data/${file}`)
  .then(data => JSON.parse(data.toString().trim()))
  .then(fd => fd.map(loadRecord))
  .then(proms => Promise.all(proms))
  .then(() => console.log('files loaded successfully'))
  .catch(err => console.error(err))
}
