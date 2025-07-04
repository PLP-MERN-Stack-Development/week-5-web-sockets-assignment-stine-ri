import { useState, useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const Chat = ({ socket, username, room }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_typing', (username) => {
      setTypingUsers(prev => [...prev, username]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== username));
      }, 2000);
    });

    socket.emit('join_room', room);

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [room, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { message, room });
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Room: {room}</h2>
      </div>
      <div className="messages-container">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} isCurrentUser={msg.sender === username} />
        ))}
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            socket.emit('typing', room);
          }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;