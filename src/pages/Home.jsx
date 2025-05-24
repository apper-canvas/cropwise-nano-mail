import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import WeatherWidget from '../components/WeatherWidget'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const stats = [
    { label: "Active Farms", value: "3", icon: "MapPin", color: "text-primary" },
    { label: "Crop Records", value: "18", icon: "Archive", color: "text-accent" },
    { label: "Active Crops", value: "8", icon: "Sprout", color: "text-secondary" },
    { label: "This Month", value: "$2,450", icon: "DollarSign", color: "text-red-500" }
  ]


  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="bg-primary p-2 sm:p-3 rounded-2xl shadow-neu-light">
                <ApperIcon name="Sprout" className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CropWise
                </h1>
                <p className="text-surface-600 text-sm sm:text-base">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="hidden sm:flex items-center gap-2 bg-white/80 dark:bg-surface-800/80 rounded-xl px-3 py-2 shadow-soft">
                <ApperIcon name="Cloud" className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">72°F</span>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="bg-white/80 dark:bg-surface-800/80 p-2 sm:p-3 rounded-xl shadow-soft hover:shadow-card transition-all duration-300 group"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="h-4 w-4 sm:h-5 sm:w-5 text-surface-700 dark:text-surface-300 group-hover:scale-110 transition-transform" 
                />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-neu-light dark:shadow-neu-dark hover:shadow-card transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-2 rounded-xl ${stat.color} bg-opacity-10`}>
                  <ApperIcon name={stat.icon} className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900 dark:text-surface-100 group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Feature Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <MainFeature />
      </section>

      {/* Weather & Recommendations Widget */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <WeatherWidget />
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="text-surface-600 dark:text-surface-400 text-sm">
          <p>&copy; 2024 CropWise. Helping farmers grow smarter.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home