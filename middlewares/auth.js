const authMiddleware = {
  alreadyLoggedIn: (req, res, next) => {
  	if(req.session.loggedin){
  		res.redirect('/profile')
  	}
  	else{
  		next()
  	}
  },

  notLoggedIn: (req, res, next) => {
  	if(!req.session.loggedin){
  		res.redirect('/login')
  	}
  	else{
  		next()
  	}
  },

  ajax: (req, res, next) => {
  	if(!req.session.loggedin){
  		res.status(400).end('Bad Request')
  	}
  	else{
  		next()
  	}
  }
}

module.exports = authMiddleware
