require('dotenv').config()

const express = require('express')
const session = require('cookie-session')
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

app.use(express.static(`${__dirname}/public`))
app.use(session({
	secret: 'mysecret',
	resave: false,
	saveUninitialized: true
}))
app.use(bodyParser.urlencoded({extended: true, limit: '1kb'}))
app.use(bodyParser.json({limit: '1kb'}))

app.set('views', './views')
app.set('view engine', 'ejs')

let mongoClient
if(DB_URI){
	mongoClient = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
}
else{
	mongoClient = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}`)
}

const connectSync = async () => {
	await mongoClient.connect()
}
connectSync()

app.use(setRenderPage)

const users = mongoClient.db('db').collection('users')
routes(app, users)

app.use(setError404)
app.use(sendErrorPage)

app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`))

const mongoClientClose = async () => {
	if(mongoClient && mongoClient?.topology?.isConnected && mongoClient.topology.isConnected()){
		await mongoClient.close()
	}
}
process.on('SIGINT', async () => { // ctrl-c
	mongoClientClose()
	process.exit()
})
process.on('uncaughtException', (err) => {
	console.error(err)
	mongoClientClose()
	process.exitCode = 1 // process.exit()
})

module.exports = app // для тестирования
