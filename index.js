const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const crypto = require('crypto')
const cookieParser = require('cookie-parser')
const uuid = require('uuid/v4')
const sha256 = require('sha256')
const jetpack = require('fs-jetpack')

const app = express()

const port = process.env.PORT || 8080

app.use(express.static('swagger-ui'))
app.use(express.static('api'))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cookieParser())

const minuteOffset = 3600000

let db

const getDb = () => jetpack.read('.tmp/db.json', 'json')
const commitDb = () => jetpack.write('.tmp/db.json', db)

const initDb = () => {
  try {
    db = getDb()
  } catch (ex) {
    console.log('initializing empty db')

    db = {
      sessions: {},
      users: {
        tizio: {
          id: uuid(),
          name: 'Tiberio',
          surname: 'Gracco',
          username: 'tizio',
          email: 'tizio@bemind.me',
          password: sha256('tizio.secret'),
          avatar: 'data:image/jpeg;base64,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'
        },
        caio: {
          id: uuid(),
          name: 'Gaio',
          surname: 'Gracco',
          username: 'caio',
          email: 'caio@bemind.me',
          password: sha256('caio.secret'),
          avatar: 'data:image/jpeg;base64,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'
        },
        sempronio: {
          id: uuid(),
          name: 'Sempronio',
          surname: 'Gracco',
          username: 'sempronio',
          email: 'sempronio@bemind.me',
          password: sha256('sempronio.secret'),
          avatar: 'data:image/jpeg;base64,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'
        }
      },
      initDate: new Date()
    }

    Object.keys(db.users).forEach(uu => {
      if (!db.users[uu].contacts) {
        db.users[uu].contacts = Object.keys(db.users).filter(u => db.users[u].id !== db.users[uu].id)
          .map(u => Object.assign({}, db.users[u], {
            history: {
              messages: [{
                id: uuid(),
                contactId: db.users[u].id,
                message: `Ciao ${db.users[uu].name}`,
                timestamp: new Date(db.initDate.getTime() - (minuteOffset * 2)).toISOString()
              }, {
                id: uuid(),
                contactId: db.users[uu].id,
                message: `Ciao ${db.users[u].name}`,
                timestamp: new Date(db.initDate.getTime() - minuteOffset).toISOString()
              }],
              count: 2
            }
          }))
      }
    })

    commitDb()

  }


}

const isAuthenticated = (req) => !!db.sessions[req.cookies.sessionId]

const cleanUser = (user) => {
  const cleanedUser = Object.assign({}, user)
  delete cleanedUser.contacts
  delete cleanedUser.password

  if (!!cleanedUser.history) {
    delete cleanedUser.history
  }

  return cleanedUser
}

const getContacts = (sessionId) => db.users[db.sessions[sessionId].username].contacts

const getContact = (sessionId, contactId) => getContacts(sessionId).find(c => c.id === contactId)

// app.get('/', (req, res) => {
//   return res.redirect(301, '/docs')
// })

app.post('/login', (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(400).json({ message: 'Invalid username or password supplied' })
  } else if (!!db.users[req.body.username] && sha256(req.body.password) === db.users[req.body.username].password) {

    const sessionId = crypto.randomBytes(64).toString('hex')

    db.sessions[sessionId] = db.users[req.body.username]
    commitDb()
    res.cookie('sessionId', sessionId, { session: true, httpOnly: true })
    res.json(cleanUser(db.users[req.body.username]))
  } else {
    res.status(400).json({ message: 'Bad request' })
  }
})

app.post('/logout', (req, res) => {
  if (!!req.cookies.sessionId && db.sessions[req.cookies.sessionId]) {
    delete db.sessions[req.cookies.sessionId]
    commitDb()
    res.clearCookie('sessionId')
    res.json({ message: 'You are now logged out' })
  } else {
    res.status(400).json({ message: 'Bad request' })
  }
})

app.get('/profile', (req, res) => {
  if (isAuthenticated(req)) {
    res.json(cleanUser(db.users[db.sessions[req.cookies.sessionId].username]))
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

app.get('/contacts', (req, res) => {
  if (isAuthenticated(req)) {

    let contacts = getContacts(req.cookies.sessionId)

    if (!!req.query.name) {
      contacts = contacts.filter(c => c.name.toLowerCase().indexOf(req.query.name) > -1 || c.surname.toLowerCase().indexOf(req.query.name) > -1 || c.username.toLowerCase().indexOf(req.query.name) > -1)
    }
    res.json(contacts.map(c => cleanUser(c)))
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

app.get('/contacts/:contactId', (req, res) => {
  if (isAuthenticated(req)) {
    const contact = getContact(req.cookies.sessionId, req.params.contactId)

    if (!!contact) {
      res.json(cleanUser(contact))
    } else {
      res.status(404).json({ message: 'Contact not found' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

app.get('/contacts/:contactId/history', (req, res) => {
  if (isAuthenticated(req)) {
    const contact = getContact(req.cookies.sessionId, req.params.contactId)

    if (!!contact) {
      res.json(contact.history)
    } else {
      res.status(404).json({ message: 'Contact not found' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

app.post('/contacts/:contactId/send', (req, res) => {
  if (isAuthenticated(req)) {
    const contact = getContact(req.cookies.sessionId, req.params.contactId)

    if (!!contact) {

      const message = Object.assign({}, req.body, { id: uuid(), date: (new Date()).toISOString() })

      contact.history.messages.push(message)
      commitDb()
      res.json(message)
    } else {
      res.status(404).json({ message: 'Contact not found' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Chat server listening on http://localhost:${port}!`)
  console.log(`Swagger-ui is available on http://localhost:${port}/docs`)
  initDb()
})
