const fs = require('fs')
const path = require('path')
const { validationResult } = require('express-validator')

const stream = require('stream/promises')
const bcrypt = require('bcryptjs')
const { ObjectID } = require('mongodb')

const removeFile = (filepath) => {
  fs.unlink(filepath, (err) => {
  	console.error(err)
  })
}

const handlers = (users) => {

  const getImages = async (sortBy, limit = 0) => {
  	let settings = [
  		{$unwind: '$images'},
  		{
  			$project: {
  				likesCount: {$size: '$images.likes'},
  				likes: '$images.likes',
  				addDate: '$images.add_date',
  				title: '$images.title',
  				username: '$username',
  				filename: '$images.filename'
  			}
  		}
  	]

  	//сортировка картинок по дате загрузки
  	if(sortBy == 'popular'){
  		settings.push({$sort: {'likesCount': -1}})
  	}
  	else{ // latest
  		settings.push({$sort: {'addDate': -1}})
  	}
  	if(limit){
  		settings.push({$limit: limit})
  	}
  	return (await users.aggregate(settings)).toArray()
  }

  const getUserData = async (userId) => {
  	const findRes = await users.findOne({'_id': ObjectID(userId)})
  	return {
  		'images': findRes.images.slice(-4), // последние 4 штуки
  		'email': findRes.email,
  		'reg_date': findRes.reg_date,
  		'totalImagesCount': findRes.images.length,
  		'totalLikesCount': findRes.images.reduce((prev, curr) => prev + curr.likes.length, 0)
  	}
  }

  return {
    homepage: async (req, res, next) => {
  		const latestImages = await getImages('latest', 6)
  		const popularImages = await getImages('popular', 6)
  		res.renderPage('index', {latestImages, popularImages})
  	},

    registration: (req, res, next) => {
      res.renderPage('registration')
  	},

    registrationPost: async (req, res, next) => {
  		try{
  			const { errors } = validationResult(req)
  			if(errors.length){
  				throw new Error(errors.map((err) => err.msg).join('\r\n'))
  			}

  			const { username, password, email } = req.body
  			const findRes = await users.findOne({$or:[{'email': {$regex: email, $options: '-i'}}, {'username': {$regex: username, $options: '-i'}}]})
  			if(findRes){
  				if(findRes.email.toLowerCase() == email.toLowerCase()){
  					throw new Error('Такая почта уже занята!')
  				}
  				else{
  					throw new Error('Такой логин уже занят!')
  				}
  			}

  			const insertRes = await users.insertOne({
  				'username': username,
  				'email': email,
  				'password': bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
  				'reg_date': (new Date()),
  				'images': [] // [ {'title':'', 'filename (on server)':'', 'time':'', 'likes': [user_id, user_id, ...]}, {...}, ...]
  			})

  			//create dir for images
  			const dir = path.join(__dirname, '../' + process.env.USERS_UPLOAD_DIR + username + '/')
  			if(!fs.existsSync(dir)){
  				fs.mkdirSync(dir)
  			}

  			req.session.loggedin = true
  			req.session.username = username
  			req.session.userid = insertRes.insertedId.toString()
  			req.session.message = 'Поздравляем с успешной регистрацией!'
  			res.redirect('/profile')
  		}
  		catch(e){
  			res.renderPage('registration', Object.assign({error: e.message || 'Возникла ошибка.'}, req.body))
  		}
  	},

    login: (req, res, next) => {
  		res.renderPage('login')
  	},

    loginPost: async (req, res, next) => {
  		const { username, password } = req.body
  		if(username && password){
  			const findRes = await users.findOne({$or:[{'email': {$regex: username, $options: '-i'}}, {'username': {$regex: username, $options: '-i'}}]})
  			if(findRes){
  				if(bcrypt.compareSync(password, findRes.password)){
  					req.session.loggedin = true
  					req.session.username = findRes.username
  					req.session.userid = findRes._id.toString()
  					res.redirect('/profile')
  				}
  				else{
  					res.renderPage('login', {error: 'Неверный пароль!'})
  				}
  			}
  			else{
  				res.renderPage('login', {error: 'Нет пользователя с таким логином/почтой!'})
  			}
  		}
  		else{
  			res.renderPage('login', {error: 'Не все поля формы были заполнены!'})
  		}
  	},

    logout: (req, res, next) => {
  		req.session.loggedin = false
  		delete req.session.username
  		delete req.session.userid
  		res.redirect('/')
  	},

    profile: async (req, res, next) => {
  		const message = req.session.message || ''
  		delete req.session.message
      const userData = await getUserData(req.session.userid)
  		res.renderPage('profile', {...userData, message})
  	},

    profilePost: async (req, res, next) => {
  		let errorMessage = ''
  		let uploadedFilepath = ''
  		let filepath = ''
  		try{
  			if(!req.file){
  				throw new Error('Укажите файл!')
  			}
  			uploadedFilepath = path.join(__dirname, req.file.path)
  			const mimetype = req.file.mimetype.toLowerCase()
  			if(mimetype !== 'image/png' && mimetype !== 'image/jpg' && mimetype !== 'image/jpeg'){
  				throw new Error('Невалидный тип файла (' + mimetype + ')')
  			}
  			const title = req.body.title.trim()
  			if(!title){
  				throw new Error('Укажите название файла')
  			}
  			//check filename
  			const objUserId = ObjectID(req.session.userid)
  			let findRes = await users.findOne({'_id': objUserId, 'images.title': {$regex: title, $options: '-i'}})
  			if(findRes){
  				throw new Error('Файл с таким названием уже существует!')
  			}

  			const filename = Date.now() + path.extname(req.file.originalname)
  			const userdir = path.join(__dirname, process.env.USERS_UPLOAD_DIR + req.session.username + '/')
  			filepath = userdir + filename

  			const readStream = fs.createReadStream(uploadedFilepath)
  			const writeStream = fs.createWriteStream(filepath)

  			await stream.pipeline(readStream, writeStream)
  			const updateRes = await users.updateOne({'_id': objUserId}, {$push: {'images': {'filename': filename, 'title': title, 'add_date': (new Date()), 'likes': []}}})
  			if(!updateRes){
  				throw new Error('Возникла ошибка при попытке добавить запись в БД.')
  			}
  		}
  		catch(err){
  			if(filepath){
  				removeFile(filepath)
  			}
  			errorMessage = err.message || 'Возникла ошибка.'
  		}
  		if(uploadedFilepath){
  			removeFile(uploadedFilepath)
  		}
  		let params = await getUserData(req.session.userid)
  		params['error'] = errorMessage
  		res.renderPage('profile', params)
  	},

    users: async (req, res, next) => {
  		let usersList = await users.aggregate([
  			{$project: {'name': '$username', 'reg_date': '$reg_date', 'images': '$images', 'imagesCount': {$size: '$images'}}},
  			{$sort: {'reg_date': -1}}
  		]).toArray()
      usersList = usersList.map((u) => {
        const date_str = ((new Date(u.reg_date)).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }))
<<<<<<< HEAD
        return {
          ...u,
          likesCount: u.images.reduce((p, c) => p + c.likes.length, 0),
          reg_date: date_str
        }
=======
        return {...u, likesCount: u.images.reduce((p, c) => p + c.likes.length, 0), reg_date: date_str}
>>>>>>> 05af31dae7d0d5ea5e6e6718638cb5e9658168c1
      })
  		res.renderPage('users', {list: usersList})
  	},

    userpage: async (req, res, next) => {
  		const data = await users.findOne({'username': req.params.username})
  		if(data){
  			const authorid = data._id.toString()
  			const authorname = data.username
  			const images = data.images.map((img) => {
  				return {username: data.username, _id: authorid, filename: img.filename, likes: img.likes, likesCount: img.likes.length, title: img.title}
  			})
  			return res.renderPage('user', {images, authorid, authorname, isUserPage: true})
  		}
  		next() // Error 404
  	},

    gallery: async (req, res, next) => {
  		const sortBy = req.query.sortBy ? req.query.sortBy.toLowerCase() : ''
  		if(!sortBy || sortBy == 'popular' || sortBy == 'latest'){
  			const images = await getImages(sortBy)
  			return res.renderPage('gallery', {images, sortBy})
  		}
  		next()
  	},

    ajaxToggleLike: async (req, res, next) => { // like (set || unset)
  		try{
  			if(req.body.authorid && req.body.filename && 'x-requested-with' in req.headers && req.headers['x-requested-with'] == 'XMLHttpRequest'){
          const filename = req.body.filename.trim()
  				const authorId = req.body.authorid.trim()
  				const userId = req.session.userid
  				if(authorId && userId && filename && userId != authorId){
  					const filter = {'_id': ObjectID(authorId), 'images.filename': filename}
  					const findRes = await users.findOne(filter)
  					if(findRes){
              const img = findRes.images.find((i) => i.filename == filename)
              if(img){ // нашли нужный файл
                const likesCount = img.likes.length
                const likeExists = img.likes.find((id) => id == userId)
      					const arrayFilters = [{'img.filename': filename}]
  							let responseObj = {}
  							if(!likeExists){ // лайка нет - нужно добавить
  								const update = {$push: {'images.$[img].likes': userId}}
  								const updateRes = await users.updateOne(filter, update, {arrayFilters})
  								if(updateRes){
  									responseObj = {"status": "added", "likesCount": likesCount + 1}
  								}
  								else{
  									responseObj = {"status": "error", "message": "Возникла ошибка при попытке добавить запись в БД."}
  								}
  							}
  							else{ // лайк уже поставлен - нужно убрать
  								const update = {$pull: {'images.$[img].likes': userId}}
  								const updateRes = await users.updateOne(filter, update, {arrayFilters})
  								if(updateRes){
  									responseObj = {"status": "removed", "likesCount": likesCount - 1}
  								}
  								else{
  									responseObj = {"status": "error", "message": "Возникла ошибка при попытке изменить запись в БД."}
  								}
  							}
  							return res.json(responseObj)
  						}
  					}
  				}
  			}
  			res.status(400).end('Bad Request')
  		}
  		catch(e){
  			res.status(500).end('Internal Server Error. ' + e.message)
  		}
  	}
  }
}

module.exports = handlers
