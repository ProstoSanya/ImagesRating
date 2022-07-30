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
const DB_PORT = process.env.DB_PORT
const DB_HOST = process.env.DB_HOST
const DB_URI = process.env.DB_URI

const app = express()
console.log(process.env)
app.use(express.static(`${__dirname}/public`))
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))
app.use(bodyParser.urlencoded({extended: true, limit: '1kb'}))
app.use(bodyParser.json({limit: '1kb'}))

app.set('views', './views')
app.set('view engine', 'ejs')

let client
console.log('GCloud =', process.env.GCLOUD)
if(process.env.GCLOUD){ // Google Cloud
	client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
}
else{ // localhost
	client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}`)
}

let dbClient
client.connect((err, database) => {
	if(err){
		return console.log(err)
	}
	dbClient = database

	app.use(setRenderPage)
console.log('t1 =', Date.now())
  const users = database.db('db').collection('users')
	routes(app, users)
console.log('t2 =', Date.now())
	app.use(setError404)
	app.use(sendErrorPage)

	app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`))
})

process.on('SIGINT', async () => { // прослушиваем прерывание работы программы (ctrl-c)
	await dbClient.close()
	process.exit()
})

process.on('uncaughtException', (err) => { // clean up allocated resources
	console.log(err)
	process.exit()
})
