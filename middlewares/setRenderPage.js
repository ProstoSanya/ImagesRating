const setRenderPage = (req, res, next) => {
  res.set({ 'Content-Type': 'text/html; charset=utf-8' })
  res.renderPage = (tpl, params) => res.render(
    tpl,
    Object.assign(
      {error: '', message: '', loggedin: false, images: [], bucket: process.env.GCLOUD_STORAGE_BUCKET},
      req.session,
      params
    )
  )
  next()
}

module.exports = setRenderPage
