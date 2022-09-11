const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('./app')
const should = chai.should()
const expect = chai.expect

chai.use(chaiHttp)

describe('Login', () => {
  /*beforeEach((done) => {
  })*/
  //describe('/GET book', () => {
  it('get login page', (done) => {
    chai.request(app)
      .get('/login')
      .end((err, res) => {
        res.should.have.status(200)
        //res.body.should.be.a('array')
        //res.body.length.should.be.eql(0)
        done()
      })
  })
  //})
})
