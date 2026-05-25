// src/features/cart/cartSlice.js
import { createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],           // [{ id, name, price, quantity, image, restaurantId, restaurantName }]
    restaurantId: null,
    restaurantName: '',
    isOpen: false,       // cart sidebar open/close
  },
  reducers: {
    addItem: (state, action) => {
      const { item, restaurantId, restaurantName } = action.payload

      // Different restaurant — clear cart
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        toast.error('Cart cleared — items from different restaurant.')
        state.items = []
        state.restaurantId = restaurantId
        state.restaurantName = restaurantName
      }

      if (!state.restaurantId) {
        state.restaurantId = restaurantId
        state.restaurantName = restaurantName
      }

      const existing = state.items.find((i) => i.id === item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...item, quantity: 1 })
      }
    },

    removeItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload)
      if (existing && existing.quantity > 1) {
        existing.quantity -= 1
      } else {
        state.items = state.items.filter((i) => i.id !== action.payload)
      }
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = ''
      }
    },

    deleteItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload)
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = ''
      }
    },

    clearCart: (state) => {
      state.items = []
      state.restaurantId = null
      state.restaurantName = ''
    },

    toggleCart: (state) => { state.isOpen = !state.isOpen },
    openCart:   (state) => { state.isOpen = true },
    closeCart:  (state) => { state.isOpen = false },
  },
})

// Selectors
export const selectCartItems    = (state) => state.cart.items
export const selectCartTotal    = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
export const selectCartCount    = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
export const selectCartOpen     = (state) => state.cart.isOpen
export const selectRestaurantId = (state) => state.cart.restaurantId

export const { addItem, removeItem, deleteItem, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions
export default cartSlice.reducer