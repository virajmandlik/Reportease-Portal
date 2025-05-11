// src/redux/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  username: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  username: '',
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user', // This is the name of the slice
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ username: string }>) {
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.username = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions; // Export the actions
export default userSlice.reducer; // Export the reducer
