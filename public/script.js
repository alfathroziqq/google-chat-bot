const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', `Anda: ${userMessage}`);
  input.value = '';

  // Menghapus input dan button ketika menunggu response
  input.disabled = true;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Thinking...';
  }
  appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    // Menghapus pesan "Gemini is thinking..."
    const thinkingMessage = chatBox.lastChild;
    if (thinkingMessage && thinkingMessage.textContent === 'Gemini is thinking...') {
        chatBox.removeChild(thinkingMessage);
    }

    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = `Error: ${errorData.error}`;
        }
      } catch (parseError) {
        // status text
        console.warn('Could not parse error response JSON:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data && data.reply) {
      appendMessage('bot', `AI: ${data.reply}`);
    } else {
      appendMessage('bot', 'AI: Sorry, I received an unexpected response.');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    appendMessage('bot', `Error: ${error.message || 'Failed to connect to the server.'}`);
  } finally {
    // mengaktifkan kembali input button
    input.disabled = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send';
    }
    input.focus();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}