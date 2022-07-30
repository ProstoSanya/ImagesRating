const validations = require('./validations')
//const up loa d = req uire('./middl ewar es/up lo ad')
//const upl oadGCl oud = req uire('./mid dle wares/uplo adGClo ud')
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
	app.post('/profile', handlers.profilePostGCloud) // up loa dGClo ud, 

	app.get('/logout', handlers.logout)

	app.get('/users', handlers.users)
	app.get('/users/:username', handlers.userpage)

	app.get('/gallery', handlers.gallery)
	app.post('/ajax', auth.ajax, handlers.ajaxToggleLike)
}
