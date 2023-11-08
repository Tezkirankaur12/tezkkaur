const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: '12345678',
    resave: true,
    saveUninitialized: true,
  })
);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'car_selling_app',
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});
const path = require('path');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
  // Assuming you have the user data available from the session
  const user = req.session.username || null;
  res.render('index', { user: user });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/cars');
    } else {
      res.send('Incorrect username or password');
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/cars', (req, res) => {
  if (req.session.loggedin) {
    res.render('cars', { user: req.session.username });
  } else {
    res.redirect('/login');
  }
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  const sql = "INSERT INTO contact_us (name, email, message) VALUES (?, ?, ?)";
  db.query(sql, [name, email, message], (err, result) => {
    if (err) throw err;
    console.log("Contact form data inserted");
    res.redirect("/contact");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
