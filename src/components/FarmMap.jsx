import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from './ApperIcon'
import farmService from '../services/api/farmService'

const FarmMap = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFarms()
  }, [])

  const loadFarms = async () => {
    setLoading(true)
    try {
      const farmData = await farmService.getAll()
      setFarms(farmData || [])
    } catch (error) {
      console.error('Error loading farms:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-surface-600 hover:text-primary transition-colors duration-300"
              >
                <ApperIcon name="ArrowLeft" className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Farm Map
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark p-8">
          <div className="text-center py-12">
            <ApperIcon name="Map" className="h-16 w-16 text-surface-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
              Interactive Farm Map
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-2xl mx-auto">
              This is where you would see an interactive map showing all your farm locations, 
              crop distributions, and real-time field conditions. Integration with mapping 
              services would provide satellite imagery and GPS coordinates.
            </p>
            
            {loading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {farms?.map((farm) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
                  >
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                      {farm.name}
                    </h3>
                    <p className="text-surface-600 dark:text-surface-400 text-sm mb-4">
                      {farm.location}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Size:</span>
                        <span>{farm.size} acres</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <span>{farm.type}</span>
                      </div>
                    </div>
                  </motion.div>
                )) || []}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default FarmMap