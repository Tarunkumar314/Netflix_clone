import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import './WatchTogether.scss';

const WatchTogether = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const { roomId } = useParams();
  const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://netflix-clone-backend.onrender.com');

  const joinRoom = useCallback((roomId) => {
    socket.emit('joinRoom', { roomId, user: { id: uuidv4(), name: 'User' } });
  }, [socket]);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }

    socket.on('userJoined', (user) => {
      setUsers((prevUsers) => [...prevUsers, user]);
    });

    socket.on('userLeft', (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('videoProgress', (progress) => {
      setVideoProgress(progress);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, joinRoom, socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: uuidv4(),
        text: newMessage,
        user: { id: socket.id, name: 'You' },
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', { roomId, message });
      setNewMessage('');
    }
  };

  return (
    <div className="watch-together">
      <div className="watch-together__main">
        <div className="watch-together__video">
          {/* Video player will be integrated here */}
          <div className="watch-together__progress">
            <div 
              className="watch-together__progress-bar" 
              style={{ width: `${videoProgress}%` }}
            />
          </div>
        </div>
        
        <div className="watch-together__users">
          <h3>Watching Together ({users.length})</h3>
          <div className="watch-together__users-list">
            {users.map((user) => (
              <div key={user.id} className="watch-together__user">
                <span className="watch-together__user-avatar">
                  {user.name[0].toUpperCase()}
                </span>
                <span className="watch-together__user-name">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="watch-together__chat">
        <div className="watch-together__messages">
          {messages.map((message) => (
            <div key={message.id} className="watch-together__message">
              <span className="watch-together__message-user">
                {message.user.name}:
              </span>
              <span className="watch-together__message-text">
                {message.text}
              </span>
            </div>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="watch-together__message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="watch-together__message-input"
          />
          <button type="submit" className="watch-together__message-send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default WatchTogether; 