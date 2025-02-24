const express = require('express');
const path = require('path');
const app = express();

// Serve client
app.use((req, res, next) => {
    if (/(.js|.css|.ttf|.png|.svg|)$/i.test(req.path)) {
        next();
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, "../sorbit-client/dist", 'index.html'));
    }
});

app.use(express.static(path.join(__dirname, "../sorbit-client/dist")))

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Serving static files from:", path.join(__dirname, "../sorbit-client/dist"));
    console.log('Press Ctrl+C to quit.');
});