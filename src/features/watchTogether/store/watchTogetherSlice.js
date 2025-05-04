import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  room: null,
  users: [],
  messages: [],
  videoProgress: 0,
  isHost: false,
  error: null,
};

const watchTogetherSlice = createSlice({
  name: 'watchTogether',
  initialState,
  reducers: {
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setVideoProgress: (state, action) => {
      state.videoProgress = action.payload;
    },
    setIsHost: (state, action) => {
      state.isHost = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
  },
});

export const {
  setRoom,
  setUsers,
  addUser,
  removeUser,
  addMessage,
  setVideoProgress,
  setIsHost,
  setError,
  resetState,
} = watchTogetherSlice.actions;

export default watchTogetherSlice.reducer; 