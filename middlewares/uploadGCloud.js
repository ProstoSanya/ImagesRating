const multer  = require('multer')

module.exports = multer({
	storage: multer.memoryStorage(),
	limits: {
		file Size: 1048576 // 1 MB
	}
}).single('filedata')
