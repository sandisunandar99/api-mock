
/**
 * DEFINE REQUIREMENT HIRE
 */

//define cors
const cors = require('cors')

//define express
const express = require('express')
const bodyParser = require('body-parser')

// define lowdb
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const adapter = new FileAsync('db.json')

//define for generate token
const jwt = require('jsonwebtoken')
const secret = '1234567890'

// define json-server
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')

// define check token
const {checkToken} =require('./middleware')

//======================================================================================


// create server
const app = express()
app.use(bodyParser.json())

// Create database instance and start server
low(adapter)
  .then(db => {

     /**
      * enable cors
      */
      app.use(cors())

      /**
       * USERS ROUTE
       */
      app.post('/api/users', (req, res) => {
          let response = req.body;
          let user = {
            username: response.username,
            email: response.email,
            password:response.password
          }
          let tokens = jwt.sign({user: response.username},
            secret,
            { expiresIn: '24h' // expires in 24 hours
            }
          );
          
          db.get('users')
            .push(user)
            .last()
            .assign({ 
              id: Date.now().toString(),
              token: tokens
            })
            .write()
            .then(x => res.json({
              status: 200,
              message: true,
              data: x
            }))
      })

      app.post('/api/login', (req, res) => {
        let response = req.body;
        let tokens = jwt.sign({user: response.username},
          secret,
          { expiresIn: '24h' // expires in 24 hours
          }
        );
        let dummyUser = {
          username: "test1",
          password: "test1",
          email: "test1@test1.com",
          token: tokens
        }
        let user = {
          username: response.username,
          password:response.password,
        }

        if(user.username === dummyUser.username && user.password === dummyUser.password){
          res.json({
              status: 200,
              message: true,
              data: dummyUser
          })
        }else{
          res.json({
            status: 401,
            message: false,
            data:{}
          })
        }

        
        
      
      })

      /**
       * SURVEYS ROUTE
       */
      app.post('/api/surveys', checkToken, (req, res) => {
        let response = req.body;
        let survey = {
          survey_name: response.survey_name ,
          category: response.category,
          using_for: response.using_for,
          description: response.description,
          introduction: response.introduction,
          periode_start: response.periode_start,
          periode_end: response.periode_end,
          respondent_target: response.respondent_target,
          status: response.status
        }
        
        db.get('surveys')
          .push(survey)
          .last()
          .assign({ 
            id: Date.now().toString(),
            created_at: Date.now(),
            respondent_input: null,
            author: 'ujang mamat'
          })
          .write()
          .then(x => res.json({
            status: 200,
            message: "survey created.",
            data: x
          }))
      })

      app.get('/api/surveys/find/:id', checkToken, (req, res) => {
        let _id = req.params.id
        let val = db.get('surveys')
                    .find({id: _id})
                    .value()
        res.json({
          status: 200,
          message: "Success",
          data: val
        })
      })
        
      app.delete('/api/surveys/:id', checkToken, (req, res) => {
        let _id = req.params.id
        
        db.get('surveys')
          .remove({ id: _id })
          .write()
    
        res.json({
          status: 200,
          message: "survey has been deleted"
        })
      })

      app.put('/api/surveys/:id', checkToken, (req, res) => { 
        let _id = req.params.id
        
        db.get('surveys')
        .find({ id: _id })
        .assign(req.body)
        .write()

    
        res.json({
          status: 200,
          message: "survey has been update"
        })
      })


      /**
       * JSON-SERVER SERVICE
       */

      router.render = (req, res, next) => {
      
        if (Array.isArray(res.locals.data)) {
          res.json({
            status: 200,
            message: "Success",
            data: {
              items: res.locals.data,
            },
            _meta: {
              totalCount: 100,
              pageCount: 5,
              currentPage: 1,
              perPage: 20
            }
          })
        } else {
          res.json({
            status: 200,
            message: "Success",
            data: res.locals.data
          })
        }
      }
     
      app.use(jsonServer.bodyParser)
      app.use(jsonServer.rewriter({
        '/api/users' : '/users',
        '/api/surveys' : '/surveys',
        '/api/*': '/$1',
      }), checkToken)

      app.use(router)


    /**
     * DEFINE NAME / SET TABLE DATABASE
     */
    return db.defaults({
      users:[],
      surveys:[] 
    }).write()
  })
  .then(() => {
    app.listen(3535, () => console.log('listening on port 3535'))
  })