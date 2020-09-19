// Requiring packages
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const exphbj = require('express-handlebars')
const methodOverride = require('method-override')
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
// Create app
const app = express()
// Adding body parser middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// Enabling method override for update/delete requests
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        delete req.body._method
        return method
    }
}))
// Initialising morgan logging for development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
// Passport configuration
require('./passport.js')(passport)
// Setting up express-handlebars
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs.js')
app.engine('.hbs', exphbj({helpers: {select, formatDate, stripTags, truncate, editIcon} ,defaultLayout: 'main-layout', extname: '.hbs'}))
app.set('view engine', '.hbs')
// Passport + Express Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))
app.use(passport.initialize())
app.use(passport.session())
// Set Global Variable for User
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})
// Static folder
app.use(express.static(path.join(__dirname, 'public')))
// Connect to DB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('We\'re connected to the database.'))
// Routes
app.use('/', require('./routes/index.js'))
app.use('/auth', require('./routes/auth.js'))
app.use('/stories', require('./routes/stories.js'))
// Listen on port
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Running in ${process.env.NODE_ENV} on port ${port}`) )