require('dotenv').config()

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require('mongodb')

const routes = require('./routes')

const setRenderPage = require('./middlewares/setRenderPage')
const { setError404, sendErrorPage } = require('./middlewares/errors')

const PORT = process.env.PORT
const HOST = process.env.HOST
const DB_URI = process.env.DB_URI

if(!DB_URI){
	console.error('Укажите параметр DB_URI в ".env"-файле')
	process.exit(1)
}

const app = express()

app.use(express.static(`${__dirname}/public`))
app.use(session({
	secret: 'sess-secret',
	resave: true,
	saveUninitialized: true,
	cookie: {
		expires: 6 * 60 * 60 * 1000 // 6 hours
	}
}))
app.use(bodyParser.urlencoded({extended: true, limit: '1kb'}))
app.use(bodyParser.json({limit: '1kb'}))

app.set('views', './views')
app.set('view engine', 'ejs')

let client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

let dbClient
client.connect((err, database) => {
	if(err){
		return console.log(err)
	}
	dbClient = database

	app.use(setRenderPage)

  const users = database.db('db').collection('users')
	routes(app, users)

	app.use(setError404)
	app.use(sendErrorPage)

	app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`))
})

process.on('SIGINT', async () => { // ctrl-c
	if(dbClient){
		await dbClient.close()
	}
	process.exit()
})

process.on('uncaughtException', (err) => {
	console.log(err)
	if(dbClient){
		await dbClient.close()
	}
	process.exitCode = 1 // process.exit()
})
