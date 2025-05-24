import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import weatherService from '../services/weatherService'

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [forecast, setForecast] = useState([])
  const [recommendations, setRecommendations] = useState({ recommendations: [], alerts: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadWeatherData()
    // Refresh weather data every 30 minutes
    const interval = setInterval(loadWeatherData, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [currentWeather, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getForecast()
      ])
      
      setWeatherData(currentWeather)
      setForecast(forecastData)
      
      // Generate recommendations based on weather data
      const recs = weatherService.generateCropRecommendations({
        current: currentWeather,
        forecast: forecastData
      })
      setRecommendations(recs)
      
      // Show alerts as toasts
      recs.alerts.forEach(alert => {
        if (alert.severity === 'high') {
          toast.error(`⚠️ ${alert.title}: ${alert.message}`)
        } else {
          toast.warning(`⚠️ ${alert.title}: ${alert.message}`)
        }
      })
      
    } catch (err) {
      setError('Failed to load weather data')
      toast.error('Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'sunny': 'Sun',
      'partly-cloudy': 'CloudSun',
      'cloudy': 'Cloud',
      'rainy': 'CloudRain',
      'stormy': 'CloudLightning',
      'snowy': 'CloudSnow',
      'foggy': 'Haze'
    }
    return iconMap[condition] || 'Cloud'
  }

  const getWeatherGradient = (condition) => {
    const gradientMap = {
      'sunny': 'from-yellow-400 to-orange-500',
      'partly-cloudy': 'from-blue-400 to-blue-600',
      'cloudy': 'from-gray-400 to-gray-600',
      'rainy': 'from-blue-600 to-indigo-700',
      'stormy': 'from-gray-700 to-gray-900',
      'snowy': 'from-blue-200 to-blue-400'
    }
    return gradientMap[condition] || 'from-blue-400 to-blue-600'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-500 text-red-800'
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800'
      default: return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-l-red-500'
      case 'medium': return 'bg-yellow-50 border-l-yellow-500'
      case 'low': return 'bg-green-50 border-l-green-500'
      default: return 'bg-gray-50 border-l-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark p-6">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-surface-600 dark:text-surface-400">{error}</p>
          <button 
            onClick={loadWeatherData}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getWeatherGradient(weatherData?.condition)} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Weather & Recommendations</h2>
            <p className="text-white/80 text-sm">{weatherData?.location}</p>
          </div>
          <button
            onClick={loadWeatherData}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            title="Refresh weather data"
          >
            <ApperIcon name="RefreshCw" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <div className="flex">
          {[
            { id: 'current', label: 'Current', icon: 'Thermometer' },
            { id: 'forecast', label: 'Forecast', icon: 'Calendar' },
            { id: 'recommendations', label: 'Tips', icon: 'Lightbulb' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-surface-600 dark:text-surface-400 hover:text-primary'
              }`}
            >
              <ApperIcon name={tab.icon} className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Current Weather */}
          {activeTab === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <ApperIcon 
                  name={getWeatherIcon(weatherData?.condition)} 
                  className="h-16 w-16 text-primary" 
                />
                <div>
                  <div className="text-4xl font-bold text-surface-900 dark:text-surface-100">
                    {weatherData?.temperature}°F
                  </div>
                  <div className="text-surface-600 dark:text-surface-400 capitalize">
                    {weatherData?.condition?.replace('-', ' ')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Humidity', value: `${weatherData?.humidity}%`, icon: 'Droplets' },
                  { label: 'Wind', value: `${weatherData?.windSpeed} mph`, icon: 'Wind' },
                  { label: 'Rain Chance', value: `${weatherData?.precipitationChance}%`, icon: 'CloudRain' },
                  { label: 'UV Index', value: weatherData?.uvIndex, icon: 'Sun' }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <ApperIcon name={item.icon} className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs text-surface-600 dark:text-surface-400">{item.label}</div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Forecast */}
          {activeTab === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ApperIcon 
                      name={getWeatherIcon(day.condition)} 
                      className="h-6 w-6 text-primary" 
                    />
                    <div>
                      <div className="font-medium text-surface-900 dark:text-surface-100">
                        {index === 0 ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-surface-600 dark:text-surface-400 capitalize">
                        {day.condition.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-surface-900 dark:text-surface-100">
                      {day.high}° / {day.low}°
                    </div>
                    <div className="text-xs text-blue-600">
                      {day.precipitationChance}% rain
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Recommendations */}
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Alerts */}
              {recommendations.alerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100">Weather Alerts</h3>
                  {recommendations.alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start gap-3">
                        <ApperIcon name={alert.icon} className="h-5 w-5 mt-0.5" />
                        <div>
                          <div className="font-semibold">{alert.title}</div>
                          <div className="text-sm mt-1">{alert.message}</div>
                          {alert.actions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {alert.actions.map((action, i) => (
                                <span key={i} className="text-xs bg-white/50 px-2 py-1 rounded">
                                  {action}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {recommendations.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100">Farming Tips</h3>
                  {recommendations.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
                      <div className="flex items-start gap-3">
                        <ApperIcon name={rec.icon} className="h-5 w-5 mt-0.5 text-surface-600" />
                        <div>
                          <div className="font-medium text-surface-900 dark:text-surface-100">{rec.title}</div>
                          <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">{rec.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recommendations.alerts.length === 0 && recommendations.recommendations.length === 0 && (
                <div className="text-center py-8">
                  <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-surface-600 dark:text-surface-400">
                    No weather alerts or special recommendations at this time.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default WeatherWidget