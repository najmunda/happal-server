const express = require('express');
const path = require('path')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const pool = require('./db/index.js');
const mountRoutes = require('./routes/index.js');

const app = express();

app.use(express.static(path.join(__dirname, process.env.CLIENTDIR, "./dist")));
app.use(cors());
app.use(express.json());

// Session store
const pgStore = require('connect-pg-simple')(session);
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgStore({
        pool: pool,
        createTableIfMissing: true,
    }),
}));
app.use(passport.authenticate('session'));

mountRoutes(app);

// Serve client
app.use((req, res, next) => {
    if (/(.js|.css|.ttf|.png|.svg|)$/i.test(req.path)) {
        next();
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, process.env.CLIENTDIR, "./dist", 'index.html'));
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});