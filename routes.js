const validations = require('./validations')
const upload = require('./middlewares/upload')
const auth = require('./middlewares/auth')
const handlers = require('./middlewares/handlers')

module.exports = (app, users) => {
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
	app.post('/profile', upload, handlers.profilePost)

	app.get('/logout', handlers.logout)

	app.get('/users', handlers.users)
	app.get('/users/:username', handlers.userpage)

	app.get('/gallery', handlers.gallery)
	app.post('/ajax', auth.ajax, handlers.ajaxToggleLike)
}
