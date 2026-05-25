// src/components/cart/CartSidebar.jsx
import { useDispatch, useSelector } from 'react-redux'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  selectCartItems, selectCartTotal, selectCartOpen, selectCartCount,
  closeCart, addItem, removeItem, deleteItem, clearCart
} from '../../features/cart/cartSlice'

export default function CartSidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const count = useSelector(selectCartCount)
  const isOpen = useSelector(selectCartOpen)
  const { restaurantName } = useSelector((s) => s.cart)
  const { isAuthenticated } = useSelector((s) => s.auth)

  const handleCheckout = () => {
    dispatch(closeCart())
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => dispatch(closeCart())} />}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">Your Cart</h2>
            {restaurantName && <p className="text-xs text-gray-500">{restaurantName}</p>}
          </div>
          <button onClick={() => dispatch(closeCart())} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <ShoppingBag className="w-12 h-12" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-brand font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(removeItem(item.id))}
                    className="w-7 h-7 rounded-full border border-brand text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(addItem({ item, restaurantId: item.restaurantId, restaurantName }))}
                    className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => dispatch(deleteItem(item.id))} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{count} item{count > 1 ? 's' : ''}</span>
              <span>Subtotal: <strong className="text-gray-900">₹{total.toFixed(2)}</strong></span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => dispatch(clearCart())}
              className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}