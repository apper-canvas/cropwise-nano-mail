import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block bg-primary/10 p-6 rounded-full mb-6"
            >
              <ApperIcon name="Sprout" className="h-16 w-16 text-primary" />
            </motion.div>
            
            <h1 className="text-6xl sm:text-7xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-surface-800 dark:text-surface-200 mb-4">
              Field Not Found
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-8">
              Looks like this crop field doesn't exist in our system. Let's get you back to the farm.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-card hover:shadow-lg transform hover:scale-105"
          >
            <ApperIcon name="Home" className="h-5 w-5" />
            Return to Farm
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound