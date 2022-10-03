process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('./app')
//const expect = chai.expect

chai.use(chaiHttp)
const agent = chai.request.agent(app)
const should = chai.should()


describe('check pages', () => {

  it('get main page', (done) => {
    agent
      .get('/')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        res.text.should.include('Последние изображения')
        done()
      })
  })

  it('get profile page', (done) => {
    agent
      .get('/profile')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        res.redirects.should.be.an('array')
        //expect(res.redirects.length).to.equal(1)
        should.equal(res.redirects.length, 1)
        //expect((new URL(res.redirects[0])).pathname).to.equal('/login')
        const { pathname } = new URL(res.redirects[0])
        should.equal(pathname, '/login')
        done()
      })
  })

  it('get registration page', (done) => {
    agent
      .get('/registration')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        res.text.should.include('Зарегистрироваться')
        done()
      })
  })

  it('get gallery page (sortBy - latest)', (done) => {
    agent
      .get('/gallery?sortBy=latest')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        done()
      })
  })

  it('get gallery page (sortBy - popular)', (done) => {
    agent
      .get('/gallery?sortBy=popular')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        done()
      })
  })

})
