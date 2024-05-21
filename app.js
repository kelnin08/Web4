    var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});


db.run('CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, name TEXT NOT NULL, price REAL NOT NULL)', (err) => {
    if (err) {
        console.error(err.message);
    }
});


app.get('/api/prices', (req, res) => {
    const { date, showAll } = req.query;
    let query = 'SELECT * FROM prices WHERE date = ?';
    let params = [date];

    if (showAll === 'true') {
        query = 'SELECT * FROM prices';
        params = [];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            res.status(500).send('Internal server error');
            return;
        }
        res.send(rows);
    });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
