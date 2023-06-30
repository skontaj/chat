const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const connection = require('./db');

app.use(express.json());

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

// Konfiguracija sesije
app.use(session({
  secret: 'tajna-sesije',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }));

// Postavljanje EJS kao šablona pregleda
app.set('view engine', 'ejs');

// Postavljanje putanje do 'views' foldera
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, redirektuj na glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/index.html');
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});

app.get('/registration.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik već prijavljen, redirektuj na glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/index.html');
  } else {
    // Ako korisnik nije prijavljen, prikaži stranicu za registraciju
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'registration.html'));
  }
});

app.get('/login.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik već prijavljen, redirektuj na glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/index.html');
  } else {
    // Ako korisnik nije prijavljen, prikaži stranicu za registraciju
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'login.html'));
  }
});

app.get('/index.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, prikaži glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});

app.get('/requests.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, prikaži glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'requests.html'));
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});

// Ostale rute i logika


app.post('/register', (req, res) => {
  const { username, password, confirm_password } = req.body;
  const errors = [];

  // Check if the username is already taken
  const checkUsernameQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUsernameQuery, [username], (error, results) => {
    if (error) {
      console.error('Error verifying username', error);
      errors.push('User registration error');
    } else {
      if (results.length > 0) {
        // Username already taken
        errors.push('Username already exists');
      }
    }

    // Validate password length
    if (password.length < 8) {
      errors.push('The password must contain at least 8 characters');
    } else if (password !== confirm_password) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      res.render('register', { errors });
    } else {
      // Hash the password and insert the user into the database
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
          console.error('Error', err);
          errors.push('User registration error');
          res.render('register', { errors });
        } else {
          bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
              console.error('Password encryption error', err);
              errors.push('User registration error');
              res.render('register', { errors });
            } else {
              const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
              const values = [username, hash];
              connection.query(insertUserQuery, values, (error, results) => {
                if (error) {
                  console.error('User registration error', error);
                  errors.push('User registration error');
                  res.render('register', { errors });
                } else {
                  // Set session values after successful registration
                  req.session.loggedIn = true;
                  req.session.username = username;
                  res.redirect('/index.html');
                }
              });
            }
          });
        }
      });
    }
  });
});



app.post('/logout', (req, res) => {
  // Destroy the session to logout the user
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out user', err);
      res.status(500).send('Error logging out user');
    } else {
      // Redirect to the registration page after logout
      res.redirect('/registration.html');
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const errors = [];

  // Retrieve the user from the database based on the provided username
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (error, results) => {
    if (error) {
      console.error('User login error', error);
      errors.push('User login error');
      res.render('login', { errors });
    } else {
      if (results.length === 0) {
        // User not found
        errors.push('Invalid username or password');
        res.render('login', { errors });
      } else {
        const user = results[0];
        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error('Error comparing passwords', err);
            errors.push('User login error');
            res.render('login', { errors });
          } else {
            if (isMatch) {
              // Passwords match, set session values and redirect to the main page
              req.session.loggedIn = true;
              req.session.username = username;
              res.redirect('/index.html');
            } else {
              // Passwords do not match
              errors.push('Invalid username or password');
              res.render('login', { errors });
            }
          }
        });
      }
    }
  });
});



app.get('/users', (req, res) => {
  const query = 'SELECT username FROM users';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching usernames', error);
      res.status(500).send('Error fetching usernames');
    } else {
      const usernames = results.map(result => result.username);
      res.json(usernames);
    }
  });
});

app.get('/username', (req, res) => {
  const loggedInUsername = req.session.username; // Dobijanje korisničkog imena iz sesije
  res.send(loggedInUsername);
});

app.post('/friend-requests', (req, res) => {
  const senderUsername = req.session.username;
  const recipientUsername = req.body.recipientUsername;

  // Check if the sender and recipient usernames are the same
  if (senderUsername === recipientUsername) {
    res.status(400).send('It is not possible to send a friend request to yourself');
    return;
  }

  // Check if the recipient username exists in the users table
  const checkRecipientQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkRecipientQuery, [recipientUsername], (error, results) => {
    if (error) {
      console.error('Error checking recipient username', error);
      res.status(500).send('Error sending friend request');
    } else {
      if (results.length === 0) {
        // Recipient username does not exist
        res.status(404).send("The recipient's username does not exist");
      } else {
        // Check if a friend request already exists between the sender and recipient
        const checkRequestQuery = 'SELECT * FROM friend_requests WHERE sender_username = ? AND recipient_username = ?';
        const checkRequestValues = [senderUsername, recipientUsername];
        connection.query(checkRequestQuery, checkRequestValues, (error, results) => {
          if (error) {
            console.error('Error checking for friend request', error);
            res.status(500).send('Error sending friend request');
          } else {
            if (results.length > 0) {
              // A friend request already exists between the sender and recipient
              res.status(400).send('A friend request already exists');
            } else {
              // Check if a friend request already exists between the recipient and sender
              const checkReverseRequestQuery = 'SELECT * FROM friend_requests WHERE sender_username = ? AND recipient_username = ?';
              const checkReverseRequestValues = [recipientUsername, senderUsername];
              connection.query(checkReverseRequestQuery, checkReverseRequestValues, (error, results) => {
                if (error) {
                  console.error('Error checking for friend request', error);
                  res.status(500).send('Error sending friend request');
                } else {
                  if (results.length > 0) {
                    // A friend request already exists between the recipient and sender
                    res.status(400).send('The user has already sent a friend request');
                  } else {
                    // Insert the friend request into the friend_requests table
                    const insertRequestQuery = 'INSERT INTO friend_requests (sender_username, recipient_username) VALUES (?, ?)';
                    const insertRequestValues = [senderUsername, recipientUsername];
                    connection.query(insertRequestQuery, insertRequestValues, (error, results) => {
                      if (error) {
                        console.error('Error sending friend request', error);
                        res.status(500).send('Error sending friend request');
                      } else {
                        res.send('Friend request successfully sent');
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  });
});



app.get('/friend-requests', (req, res) => {
  const loggedInUsername = req.session.username;

  // Fetch friend requests for the logged-in user
  const getRequestsQuery = 'SELECT * FROM friend_requests WHERE recipient_username = ? AND status = "pending"';
  connection.query(getRequestsQuery, [loggedInUsername], (error, results) => {
    if (error) {
      console.error('Error fetching friend request', error);
      res.status(500).send('Error fetching friend request');
    } else {
      res.json(results);
    }
  });
});

app.post('/friend-requests/accept', (req, res) => {
  const requestId = req.body.requestId;
  const loggedInUsername = req.session.username;

  // Update the status of the friend request to 'accepted'
  const acceptRequestQuery = 'UPDATE friend_requests SET status = "accepted" WHERE id = ? AND recipient_username = ?';
  connection.query(acceptRequestQuery, [requestId, loggedInUsername], (error, results) => {
    if (error) {
      console.error('Error accepting friend request', error);
      res.status(500).send('Error accepting friend request');
    } else {
      res.send('Friend request successfully accepted');
    }
  });
});


app.post('/friend-requests/reject', (req, res) => {
  const requestId = req.body.requestId;
  const loggedInUsername = req.session.username;

  // Delete the friend request from the database
  const deleteRequestQuery = 'DELETE FROM friend_requests WHERE id = ? AND recipient_username = ?';
  connection.query(deleteRequestQuery, [requestId, loggedInUsername], (error, results) => {
    if (error) {
      console.error('Error deleting friend request', error);
      res.status(500).send('Error deleting friend request');
    } else {
      res.send('The friend request was successfully rejected');
    }
  });
});


app.post('/messages', (req, res) => {
  const senderUsername = req.session.username;
  const recipientUsername = req.body.recipientUsername;
  const message = req.body.message;
  const timestamp = new Date(); // Trenutno vrijeme

if (recipientUsername === 'select') {
    // Korisnik nije odabrao stvarnog prijatelja
    res.status(400).send('Choose a friend');
    return;
  }

  // Check if the sender and recipient are friends with accepted status
  const checkFriendshipQuery = "SELECT * FROM friend_requests WHERE ((sender_username = ? AND recipient_username = ?) OR (sender_username = ? AND recipient_username = ?)) AND status = 'accepted'";
  const checkFriendshipValues = [senderUsername, recipientUsername, recipientUsername, senderUsername];

  connection.query(checkFriendshipQuery, checkFriendshipValues, (error, results) => {
    if (error) {
      console.error('Friendship verification error', error);
      res.status(500).send('Error sending message');
    } else {
      if (results.length === 0) {
        // The sender and recipient are not friends or their friendship is not accepted
        res.status(400).send('Users are not friends or friendship is not accepted');
      } else {
        // Insert the message into the messages table with sender and recipient usernames
        const insertMessageQuery = 'INSERT INTO messages (sender_username, recipient_username, message, timestamp) VALUES (?, ?, ?, ?)';
        const insertMessageValues = [senderUsername, recipientUsername, message, timestamp];
        connection.query(insertMessageQuery, insertMessageValues, (error, results) => {
          if (error) {
            console.error('Error sending message', error);
            res.status(500).send('Error sending message');
          } else {
            res.send('The message was sent successfully');
          }
        });
      }
    }
  });
});


app.get('/friends', (req, res) => {
  const currentUser = req.session.username;

  // Izvrši upit na bazu podataka za dohvatanje prijatelja korisnika
  const getFriendsQuery = 'SELECT CASE WHEN sender_username = ? THEN recipient_username ELSE sender_username END AS friend_username FROM friend_requests WHERE (sender_username = ? OR recipient_username = ?) AND status = "accepted"';
  connection.query(getFriendsQuery, [currentUser, currentUser, currentUser], (error, results) => {
    if (error) {
      console.error('Error retrieving friends', error);
      res.status(500).send('Error retrieving friends');
    } else {
      // Mapiraj rezultate upita u niz korisničkih imena prijatelja
      const friends = results.map((row) => row.friend_username);

      // Vrati prijatelje kao JSON odgovor
      res.json({ friends });
    }
  });
});


app.get('/messages/:recipient', (req, res) => {
  const senderUsername = req.session.username;
  const recipientUsername = req.params.recipient;

  const getMessagesQuery = 'SELECT * FROM messages WHERE (sender_username = ? AND recipient_username = ?) OR (sender_username = ? AND recipient_username = ?)';
  const getMessagesValues = [senderUsername, recipientUsername, recipientUsername, senderUsername];

  connection.query(getMessagesQuery, getMessagesValues, (error, results) => {
    if (error) {
      console.error('Error retrieving messages', error);
      res.status(500).send('Error retrieving messages');
    } else {
      res.json({ messages: results });
    }
  });
});


const port = 3000;
app.listen(port, () => {
  console.log(`The server is running on the port ${port}`);
});
