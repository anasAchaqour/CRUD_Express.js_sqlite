const express = require('express');
const sqlite3 = require('sqlite3');
const session = require('express-session');
const ejs = require('ejs');
const app = express();
const port = 3030;
// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
// Set EJS as the view engine
app.set('view engine', 'ejs');
// ::::::::::::::::::::::::::::::::::::::::::auth::::::::::::::::::::::::::::::::::::::::::;;;;;;;;;;;;;;;;;;;;;;;;;;
// Middleware for session management ( sets up session management.)
app.use(session({
    secret: 'your-secret-key', // Change this to a secure key
    resave: false,
    saveUninitialized: true,
}));
// middleware function to check authentication
const authenticate = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    } else {
        res.redirect('/login');
    }
};
// Login page
app.get('/login', (req, res) => {
    res.render('login');
});
// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication (replace with a more secure method in a real-world scenario)
    if (username === 'admin' && password === 'admin') {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});
// Logout route
app.get('/logout', (req, res) => {
    req.session.authenticated = false;
    res.redirect('/login');
});
//app.use(authenticate);
// ::::::::::::::::::::::::::::::::::::::::::auth::::::::::::::::::::::::::::::::::::::::::



// Connect to SQLite database
const db = new sqlite3.Database('products.db');
// Create 'products' table if not exists
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )`);


// Home page - Display all products
app.get('/', (req, res) => {
    db.all('select * from products', (err, rows) => {
        if (err) {
            console.log(err)
        }
        else {
            res.render('home', { products: rows })
        }
    })
});

// Add product page
app.get('/add', authenticate, (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    const { name, description } = req.body;
    // Insert data into 'products' table
    let stmt = db.run("INSERT INTO products (name,description) VALUES(?,?)", [name, description], (err) => {
        if (err) {
            console.log(err)
            return
        }
        else {
            res.redirect('/')
        }
    })
})

// Edit product page
app.get('/edit/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err);
        }
        else {
            res.render('edit', { product: row });
        }
    });
});

// Handle form submission to edit a product
app.post('/edit/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    db.run("update products set name = ? ,description = ? where id = ?", [name, description, id], (err) => {
        if (err) {
            console.log(err)
            return
        }
        else {
            res.redirect('/')
        }
    })
})


// Handle product deletion
app.get('/delete/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.run('delete from products where id = ?', [id], (err) => {
        if (err) {
            console.error(err);
        }
        else {
            res.redirect('/')
        }
    });
});

// Product details page
app.get('/details/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.get("select * from products where id = ?", [id], (err, row) => {
        if (err) {
            console.log(err)
            return
        }
        else {
            res.render('details', { product: row })
        }
    })
})
















// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});