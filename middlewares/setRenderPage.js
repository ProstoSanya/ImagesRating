const setRenderPage = (req, res, next) => {
  res.set({ 'Content-Type': 'text/html; charset=utf-8' })
  res.renderPage = (tpl, params) => {
    console.log('tpl = ', tpl)
    return res.render(tpl, Object.assign({error: '', message: '', loggedin: false, images: []}, req.session, params))
  }
  next()
}

module.exports = setRenderPage
