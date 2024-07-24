import { useState } from 'react';
import './App.css';

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'user',
    content: 'Hello World'
  },
  {
    id: 2,
    role: 'assistant',
    content: 'Hi there!'
  },
  {
    id: 3,
    role: 'user',
    content: 'How are you?'
  },
  {
    id: 4,
    role: 'assistant',
    content: 'I am good, thank you!'
  },
]

const api_send_messages = async (messages: Message[]) => {
  console.log('Sending messages:', messages);
  try {
    const response = await fetch('http://192.168.2.159:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history: messages }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data["message"];
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const MessagesView = ( { messages }: { messages: Message[] } ) => {
  return (
    <div style={
      {
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        border: '1px solid #000',
        borderRadius: '5px',
        margin: '10px'

      }
    }>
      {messages.map(message => {
        return (
          <div key={message.id} style={{ display: 'flex', flexDirection: message.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ padding: '10px', border: '1px solid #000', borderRadius: '5px', margin: '5px' }}>
              {message.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Main ChatView component
const ChatView = ( { initialMessages }: { initialMessages: Message[] } ) => {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    setLoading(true);
    const userMessage = { id: messages.length + 1, role: 'user' as 'user', content: message };
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);

    try {
      const assistantMessage = await api_send_messages(tempMessages);
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMessage('');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <MessagesView messages={messages} />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Loading...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ChatView initialMessages={initialMessages} />
      </header>
    </div>
  );
}

export default App;
