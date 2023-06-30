const friendRequestForm = document.getElementById('friendRequestForm');
const friendRequestList = document.getElementById('friendRequestList');

friendRequestForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const recipientUsername = document.getElementById('recipientUsername').value;

  sendFriendRequest(recipientUsername);
});

function sendFriendRequest(recipientUsername) {
  fetch('/friend-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipientUsername })
  })
    .then(response => response.text())
    .then(data => {
      alert(data); // Prikazujemo poruku o uspješnom slanju zahtjeva
      friendRequestForm.reset(); // Resetiranje obrasca
    })
    .catch(error => console.error('Greška:', error));
}

// Fetch the logged-in username from the server
fetch('/username')
  .then(response => response.text())
  .then(username => {
    const loggedInUsername = username; // Dodavanje korisničkog imena u varijablu
    fetchUserList(loggedInUsername);
    fetchFriendRequests(loggedInUsername);
  })
  .catch(error => {
    console.error('Error fetching logged-in username:', error);
  });

function fetchUserList(loggedInUsername) {
  fetch('/users')
    .then(response => response.json())
    .then(data => {
      const userList = document.getElementById('userList');

      data.forEach(user => {
        if (user !== loggedInUsername) {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.textContent = user;
          listItem.appendChild(link);
          userList.appendChild(listItem);
        }
      });
    })
    .catch(error => console.error('Error:', error));
}

function fetchFriendRequests(loggedInUsername) {
  fetch('/friend-requests')
    .then(response => response.json())
    .then(data => {
      const friendRequestList = document.getElementById('friendRequestList');

      data.forEach(request => {
        const listItem = document.createElement('li');
        listItem.textContent = `${request.sender_username}`;

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.classList.add('accept');
        acceptButton.addEventListener('click', () => {
          acceptButton.parentNode.style.display = 'none';
          acceptFriendRequest(request.id);
        });
        listItem.appendChild(acceptButton);

        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Reject';
        rejectButton.classList.add('reject');
        rejectButton.addEventListener('click', () => {
          rejectButton.parentNode.style.display = 'none';
          rejectFriendRequest(request.id);
        });
        listItem.appendChild(rejectButton);

        friendRequestList.appendChild(listItem);
      });
    })
    .catch(error => console.error('Error:', error));
}

function acceptFriendRequest(requestId) {
  fetch('/friend-requests/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requestId })
  })
    .then(response => response.text())
    .then(data => {
      alert(data); // Prikazujemo poruku o uspješnom prihvatanju zahtjeva
      // Ukloniti zahtjev za prijateljstvo iz liste
      const listItem = document.getElementById(`request-${requestId}`);
      listItem.remove();
    })
    .catch(error => console.error('Greška:', error));
}

function rejectFriendRequest(requestId) {
  fetch('/friend-requests/reject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requestId })
  })
    .then(response => response.text())
    .then(data => {
      alert(data); // Prikazujemo poruku o uspješnom odbijanju zahtjeva
      // Ukloniti zahtjev za prijateljstvo iz liste
      const listItem = document.getElementById(`request-${requestId}`);
      listItem.remove();
    })
    .catch(error => console.error('Greška:', error));
}

