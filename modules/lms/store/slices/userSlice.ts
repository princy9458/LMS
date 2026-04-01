import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  name: string | null;
  email: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  userId: null,
  name: null,
  email: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ userId: string; name: string; email: string }>) {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    clearUser(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.name = null;
      state.email = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
