const validations = require('./validations')
const upload = require('./middlewares/upload')
const uploadGCloud = require('./middlewares/uploadGCloud')
const auth = require('./middlewares/auth')

module.exports = (app, users) => {
	const handlers = require('./middlewares/handlers')(users)

	app.get('/', handlers.homepage)

	app.get('/registration', auth.alreadyLoggedIn, handlers.registration)
	app.post('/registration',
		auth.alreadyLoggedIn,
		validations.username,
		validations.email,
		validations.password,
		validations.passwordConfirm,
		handlers.registrationPost
	)

	app.get('/login', auth.alreadyLoggedIn, handlers.login)
	app.post('/login',
		auth.alreadyLoggedIn,
		validations.escapeUsername,
		validations.escapePassword,
		handlers.loginPost
	)

	app.use('/profile', auth.notLoggedIn)
	app.get('/profile', handlers.profile)

	//const midds = process.env.GCLOUD ? [uploadGCloud, handlers.profilePostGCloud] : [upload, handlers.profilePost]
	app.post('/profile', uploadGCloud, handlers.profilePostGCloud) // up loa dGClo ud,

	app.get('/logout', handlers.logout)

	app.get('/users', handlers.users)
	app.get('/users/:username', handlers.userpage)

	app.get('/gallery', handlers.gallery)
	app.post('/ajax', auth.ajax, handlers.ajaxToggleLike)
}
