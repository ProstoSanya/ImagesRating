const setRenderPage = (req, res, next) => {
  res.set({ 'Content-Type': 'text/html; charset=utf-8' })
  res.renderPage = (tpl, params) => res.render(
    tpl,
    Object.assign(
<<<<<<< HEAD
      {
        error: '',
        message: '',
        loggedin: false,
        images: [],
        bucket_url: 'https://storage.googleapis.com/' + process.env.GCLOUD_STORAGE_BUCKET
      },
=======
      {error: '', message: '', loggedin: false, images: [], bucket: process.env.GCLOUD_STORAGE_BUCKET},
>>>>>>> 805dc850620427bff4578821316253bfd5dc0633
      req.session,
      params
    )
  )
  next()
}

module.exports = setRenderPage
