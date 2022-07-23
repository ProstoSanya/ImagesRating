const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb')

const routes = require('./routes')

const setRenderPage = require('./middlewares/setRenderPage')
const { setError404, sendErrorPage } = require('./middlewares/errors')

const PORT = 8080
const HOST = '127.0.0.1'
const app = express()
const client = new MongoClient('mongodb://localhost:27017')

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

process.on('SIGINT', async () => { // прослушиваем прерывание работы программы (ctrl-c)
    await dbClient.close()
    process.exit()
})

process.on('uncaughtException', (err) => { // clean up allocated resources
    process.exit()
})
