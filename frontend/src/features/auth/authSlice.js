// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// ── Async Thunks ──────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login/', credentials)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Login failed' })
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register/', userData)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Registration failed' })
    }
  }
)

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile/')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  const refresh = localStorage.getItem('refresh')
  try { 
    if (refresh) {
      await api.post('/auth/logout/', { refresh }) 
    }
  } catch (err) {
    console.error("Logout API call failed:", err)
  } finally {
    // Always clear tokens from localStorage instantly
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }
})

// ── Slice ─────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem('access'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        toast.success(`Welcome back, ${action.payload.user.first_name}!`)
      })
      .addCase(loginUser.rejected,  (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload?.detail || 'Login failed')
      })

    // Register
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        toast.success('Account created successfully!')
      })
      .addCase(registerUser.rejected,  (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Profile
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => { state.user = action.payload })
      .addCase(fetchProfile.rejected,  (state) => {
        state.user = null
        state.isAuthenticated = false
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.isAuthenticated = false
    })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer