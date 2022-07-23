module.exports = {
  setError404: (req, res, next) => {
		const err = new Error('Not found')
		err.status = 404
		next(err)
	},

  sendErrorPage: (err, req, res) => {
		if(!err.status){
			err.status = 500
		}
		res.status(err.status)
		res.renderPage('error', {error: err.message, code: err.status})
	}
}
