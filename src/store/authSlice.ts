import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import type {User} from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({email, password}: {email: string; password: string}) => {
    const {data} = await api.login(email, password);
    await AsyncStorage.setItem('token', data.token);
    return data;
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await api.logout();
  await AsyncStorage.removeItem('token');
});

export const restoreToken = createAsyncThunk('auth/restore', async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    return null;
  }
  const {data} = await api.getUser();
  return {token, user: data};
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error de autenticación';
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.user = null;
        state.token = null;
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      });
  },
});

export default authSlice.reducer;
