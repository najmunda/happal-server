import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import pool from './db/index.js';
import mountRoutes from './routes/index.js';

const __dirname = import.meta.dirname;
const app = express();

app.use(express.static(path.join(__dirname, process.env.CLIENTDIR, "./dist")));
app.use(cors());
app.use(express.json());

// Session store
const pgSession = (await import('connect-pg-simple')).default;
const pgStore = pgSession(session);
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