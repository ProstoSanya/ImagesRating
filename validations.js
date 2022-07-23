const { check } = require('express-validator')

module.exports = {
  username: check('username').trim().escape()
		.isLength({ min: 6, max: 20 }).withMessage('Длина логина должна составлять от 6 до 20 символов!')
		.matches(/^[A-Za-z]+([_-]?[A-Za-z0-9]+)*$/).withMessage('Невалидный логин!'),

	email: check('email').trim().escape()
		.isLength({ min: 6, max: 20 }).withMessage('Длина почты должна составлять от 6 до 20 символов!')
		.normalizeEmail().isEmail().withMessage('Невалидная почта!')
		.custom(async (email, { req }) => {
			const username = req.body.username
			const findRes = await users.findOne({$or:[{'email': {$regex: email, $options: '-i'}}, {'username': {$regex: username, $options: '-i'}}]})
			if(findRes){
				if(findRes.email.toLowerCase() == email.toLowerCase()){
					throw new Error('Такая почта уже занята!')
				}
				else{
					throw new Error('Такой логин уже занят!')
				}
			}
		}
	),
	password: check('password').trim().escape()
		.isLength({ min: 8, max: 16 }).withMessage('Длина пароля должна составлять от 8 до 16 символов!'),
	passwordConfirm: check('password2').trim().escape()
		.not().isEmpty().withMessage('Введите подтверждение пароля!')
		.custom((value, { req }) => value === req.body.password).withMessage('Пароли должны совпадать!'),
	escapeUsername: check('username').trim().escape(),
	escapePassword: check('password').trim().escape()
}
