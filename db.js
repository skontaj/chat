const mysql = require('mysql');

// Konfigurirajte MySQL vezu
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'skontaj',
  password: 'mysql',
  database: 'chat',
});

// Provjerite je li uspostavljena veza s bazom podataka
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database!');
  }
});

module.exports = connection;