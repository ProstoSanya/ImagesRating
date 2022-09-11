const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('./app')
//const expect = chai.expect

chai.should()
chai.use(chaiHttp)
const agent = chai.request.agent(app)

const USERNAME = 'usertest'
const USEREMAIL = 'usertest@mail.com'
const PASSWORD = 'mypassword123'
const IMAGENAME = 'ejik' // название единственного загруженного изображения этим пользователем

describe('Login', () => {
  /*beforeEach((done) => {
  })*/

  it('get profile page', (done) => {
    agent
      .get('/profile')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        res.redirects.length.should.be.eql(1)
        new URL(res.redirects[0]).pathname.should.be.eql('/login')
        //res.body.should.be.a('array')
        //res.body.length.should.be.eql(0)
        done()
      })
  })

  it('get login page', (done) => {
    agent
      .get('/login')
      .end((err, res) => {
        if(err){
          return done(err)
        }
        res.should.have.status(200)
        //res.body.should.be.a('array')
        //res.body.length.should.be.eql(0)
        done()
      })
  })


  //http://127.0.0.1:8080/profile
  /*it('authorization', (done) => {
    chai.request(app)
      .post('/login')
      .end((err, res) => {
        res.should.have.status(200)
        //res.body.should.be.a('array')
        //res.body.length.should.be.eql(0)
        done()
      })
  })*/

})
