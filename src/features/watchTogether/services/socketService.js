import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.user = null;
  }

  connect() {
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinRoom(roomId, user) {
    this.roomId = roomId;
    this.user = user;
    this.socket.emit('joinRoom', { roomId, user });
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.emit('leaveRoom', { roomId: this.roomId, userId: this.user.id });
      this.roomId = null;
      this.user = null;
    }
  }

  sendMessage(message) {
    if (this.roomId) {
      this.socket.emit('sendMessage', {
        roomId: this.roomId,
        message: {
          ...message,
          user: this.user,
        },
      });
    }
  }

  updateVideoProgress(progress) {
    if (this.roomId) {
      this.socket.emit('updateProgress', {
        roomId: this.roomId,
        progress,
      });
    }
  }

  onUserJoined(callback) {
    this.socket.on('userJoined', callback);
  }

  onUserLeft(callback) {
    this.socket.on('userLeft', callback);
  }

  onNewMessage(callback) {
    this.socket.on('newMessage', callback);
  }

  onVideoProgress(callback) {
    this.socket.on('videoProgress', callback);
  }

  removeAllListeners() {
    this.socket.removeAllListeners('userJoined');
    this.socket.removeAllListeners('userLeft');
    this.socket.removeAllListeners('newMessage');
    this.socket.removeAllListeners('videoProgress');
  }
}

export default new SocketService(); 