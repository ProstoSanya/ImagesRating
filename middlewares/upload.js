const multer = require('multer')

module.exports = multer({
	//storage: multer.memoryStorage(),
	dest: './uploads/',
	limits: {
		fileSize: 1048576 // 1 MB
	}
}).single('filedata')
