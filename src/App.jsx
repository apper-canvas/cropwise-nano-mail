import { createContext, useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { setUser, clearUser } from './store/userSlice'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Callback from './pages/Callback'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Farm from './components/Farm'
import CalendarView from './components/CalendarView'
import CropHistory from './components/CropHistory'
import DataExport from './components/DataExport'
import ExpenseReport from './components/ExpenseReport'
import FarmMap from './components/FarmMap'
import Inventory from './components/Inventory'
import KanbanView from './components/KanbanView'
import 'react-toastify/dist/ReactToastify.css'

// Create auth context
export const AuthContext = createContext(null)

function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)

  // Get authentication status
  const userState = useSelector((state) => state.user)
  const isAuthenticated = userState?.isAuthenticated || false

// Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK
    
    if (!ApperClient || !ApperUI) {
      console.error('ApperSDK not loaded');
      return;
    }

    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true)
const currentPath = window.location.pathname
        const redirectPath = window.URLSearchParams && window.location.search 
          ? new URLSearchParams(window.location.search).get('redirect') 
          : null
        const isAuthPage = ['login', 'signup', 'callback', 'error'].some(path => currentPath.includes(path))
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath)
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath)
            } else {
              navigate('/')
            }
          } else {
            navigate('/')
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))))
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
               ? `/signup?redirect=${currentPath}`
               : currentPath.includes('/login')
               ? `/login?redirect=${currentPath}`
               : '/login')
          } else if (redirectPath) {
            if (!['error', 'signup', 'login', 'callback'].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`)
            else {
              navigate(currentPath)
            }
          } else if (isAuthPage) {
            navigate(currentPath)
          } else {
            navigate('/login')
          }
          dispatch(clearUser())
        }
      }
    })
  }, [navigate, dispatch])

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK
        await ApperUI.logout()
        dispatch(clearUser())
        navigate('/login')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading">Initializing application...</div>
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/" element={<Home />} />
<Route path="/farms" element={<Farm />} />
          <Route path="/farm-map" element={<FarmMap />} />
          <Route path="/crop-history" element={<CropHistory />} />
          <Route path="/crop-history/:farmId" element={<CropHistory />} />
          <Route path="/expense-report" element={<ExpenseReport />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/kanban" element={<KanbanView />} />
          <Route path="/reports" element={<ExpenseReport />} />
          <Route path="/history" element={<CropHistory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/data-export" element={<DataExport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-50"
          toastClassName="shadow-card rounded-xl"
        />
      </div>
    </AuthContext.Provider>
  )
}

export default App