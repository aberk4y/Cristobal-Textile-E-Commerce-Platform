const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

if (!fs.existsSync('./database/cristobal.db')) {
    console.log("Veritabanı dosyası bulunamadı.");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new SQLiteStore({ dir: './database', db: 'sessions.db' }),
    secret: 'cristobal_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
    if (!req.session.lang) {
        req.session.lang = 'tr';
    }
    if (req.query.lang) {
        req.session.lang = req.query.lang;
    }
    next();
});

//yönlendirmeler 
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/admin', require('./routes/admin'));
app.use('/cart', require('./routes/cart'));
app.use('/user', require('./routes/user'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});