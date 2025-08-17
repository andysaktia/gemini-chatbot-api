// gemini-chatbot-api/public/script.js
/**
 * script.js for the frontend of a Vanilla JS chatbot application.
 *
 * This script handles:
 * 1. Listening for form submissions.
 * 2. Displaying user messages in the chat box.
 * 3. Showing a temporary "Thinking..." message from the bot.
 * 4. Sending the user's message to the backend API via a POST request.
 * 5. Replacing the "Thinking..." message with the AI's actual response.
 * 6. Handling API errors gracefully.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get references to the necessary DOM elements.
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // --- Helper Function to Add Messages to the DOM ---
  /**
   * Creates and appends a new message div to the chat box.
   * @param {string} text - The content of the message.
   * @param {string} sender - The sender of the message ('user' or 'bot').
   * @returns {HTMLElement} The created message element.
   */
  const addMessageToChatBox = (text, sender) => {
      const messageElement = document.createElement('div');
      // Add a general 'message' class and a specific sender class for styling.
      messageElement.classList.add('message', `${sender}-message`);
      messageElement.textContent = text;
      chatBox.appendChild(messageElement);
      // Auto-scroll to the latest message.
      chatBox.scrollTop = chatBox.scrollHeight;
      return messageElement;
  };


  // --- Form Submission Handler ---
  chatForm.addEventListener('submit', async (event) => {
      // Prevent the default form submission which reloads the page.
      event.preventDefault();

      // Get the user's message and trim any whitespace.
      const userMessage = userInput.value.trim();

      // If the message is empty, do nothing.
      if (!userMessage) {
          return;
      }

      // 1. Add the user's message to the chat box.
      addMessageToChatBox(userMessage, 'user');

      // 2. Show a temporary "Thinking..." bot message.
      const thinkingMessage = addMessageToChatBox('Thinking...', 'bot');

      // Clear the input field for the next message.
      userInput.value = '';

      try {
          // 3. Send the user's message to the backend API.
          const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              // Construct the JSON body as per the backend's expectation.
              body: JSON.stringify({
                  messages: [{
                      role: 'user',
                      content: userMessage
                  }],
              }),
          });

          // Check if the network response was successful.
          if (!response.ok) {
              // If not, throw an error to be caught by the catch block.
              throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          // 4. Replace the "Thinking..." message with the AI's reply.
          if (data && data.result) {
              thinkingMessage.textContent = data.result;
          } else {
              // Handle cases where the response is ok but contains no result.
              thinkingMessage.textContent = 'Sorry, no response was received from the server.';
          }

      } catch (error) {
          // 5. If an error occurs, update the bot message to inform the user.
          console.error('Failed to fetch chat response:', error);
          thinkingMessage.textContent = 'Failed to get a response from the server. Please try again.';
      }
  });
});
