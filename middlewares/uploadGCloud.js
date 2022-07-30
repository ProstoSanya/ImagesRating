const multer  = require('multer')

module.exports = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 1048576 // 1 MB
	}
}).single('filedata')
