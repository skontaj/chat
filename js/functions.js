const messageForm = document.getElementById('messageForm');
const recipientSelect = document.getElementById('recipientUsername_message');
const messagesContainer = document.getElementById('messagesContainer');
const messagesError = document.getElementById('messagesError');

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const recipientUsername = recipientSelect.value;
  const message = document.getElementById('message').value;

  sendMessage(recipientUsername, message);
});

function sendMessage(recipientUsername, message) {
  fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipientUsername, message })
  })
    .then((response) => {
      if (response.ok) {
        document.getElementById('messageSuccess').textContent = 'The message was sent successfully';
        document.getElementById('messageError').textContent = '';
      } else {
        response.text().then((errorMessage) => {
          document.getElementById('messageError').textContent = errorMessage;
          document.getElementById('messageSuccess').textContent = '';
        });
      }
    })
    .catch((error) => {
      console.error('Error sending message', error);
      document.getElementById('messageError').textContent = 'Error sending message';
      document.getElementById('messageSuccess').textContent = '';
    });
}

function generateFriendOptions(friends) {
  recipientSelect.innerHTML = '';

  const selectOption = document.createElement('option');
  selectOption.value = 'select';
  selectOption.textContent = 'Select friend';
  recipientSelect.appendChild(selectOption);

  friends.forEach((friend) => {
    const option = document.createElement('option');
    option.value = friend;
    option.textContent = friend;
    recipientSelect.appendChild(option);
  });
}

function fetchFriends() {
  fetch('/friends')
    .then((response) => response.json())
    .then((data) => {
      generateFriendOptions(data.friends);
    })
    .catch((error) => {
      console.error('Error retrieving friends', error);
    });
}

recipientSelect.addEventListener('change', () => {
  const recipientUsername = recipientSelect.value;

  if (recipientUsername === 'select') {
    messagesContainer.innerHTML = '';
    messagesError.textContent = '';
    return;
  }

  fetchMessages(recipientUsername);
});

function fetchMessages(recipientUsername) {
  fetch(`/messages/${recipientUsername}`)
    .then((response) => response.json())
    .then((data) => {
      const messages = data.messages;
      messagesContainer.innerHTML = '';

      if (messages.length === 0) {
        messagesError.textContent = 'There are no messages available';
        return;
      }

      messages.forEach((message) => {
        const messageElement = document.createElement('p');
        const date = new Date(message.timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        messageElement.innerHTML = `${message.message} <br><br> ${hours}:${minutes}`;

        if (message.sender_username !== recipientUsername) {
          messageElement.classList.add('sent-message');
        } else {
          messageElement.classList.add('received-message');
        }
        messagesContainer.appendChild(messageElement);
      });

      messagesError.textContent = '';
    })
    .catch((error) => {
      console.error('Error retrieving messages', error);
      messagesError.textContent = 'Error retrieving messages';
    });
}

fetchFriends();

setInterval(() => {
  const recipientUsername = recipientSelect.value;

  if (recipientUsername !== 'select') {
    fetchMessages(recipientUsername);
  }
}, 3000);
