// src/components/cart/CartSidebar.jsx
import { useDispatch, useSelector } from 'react-redux'
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'  // removed shopping cart since it's not used
import { useNavigate } from 'react-router-dom'
import {
  selectCartItems, selectCartTotal, selectCartOpen, selectCartCount,
  closeCart, addItem, removeItem, deleteItem, clearCart,
} from '../../features/cart/cartSlice'

export default function CartSidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items    = useSelector(selectCartItems)
  const total    = useSelector(selectCartTotal)
  const count    = useSelector(selectCartCount)
  const isOpen   = useSelector(selectCartOpen)
  const { restaurantName } = useSelector(s => s.cart)
  const { isAuthenticated } = useSelector(s => s.auth)

  const handleCheckout = () => {
    dispatch(closeCart())
    navigate(isAuthenticated ? '/checkout' : '/login')
  }

  const tax = total * 0.05
  const grandTotal = total + tax

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => dispatch(closeCart())}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-white dark:bg-zinc-900 shadow-2xl`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Your Cart</h2>
            {restaurantName && <p className="text-gray-400 text-xs mt-0.5">{restaurantName}</p>}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5">
              <div className="text-7xl">🛒</div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add items from a restaurant to get started</p>
              </div>
              <button
                onClick={() => { dispatch(closeCart()); navigate('/restaurants') }}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-full text-sm transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl p-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-2xl">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                  <p className="text-brand-500 font-bold text-sm mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={() => dispatch(deleteItem(item.id))} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatch(removeItem(item.id))}
                      className="w-7 h-7 rounded-full border-2 border-brand-500 text-brand-500 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(addItem({ item, restaurantId: item.restaurantId, restaurantName }))}
                      className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal ({count} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-zinc-700">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}