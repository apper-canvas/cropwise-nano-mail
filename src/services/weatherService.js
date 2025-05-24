// Mock weather service for demonstration - in production, integrate with real weather API
const MOCK_WEATHER_DATA = {
  current: {
    temperature: 72,
    condition: 'partly-cloudy',
    humidity: 65,
    windSpeed: 8,
    precipitationChance: 20,
    uvIndex: 6,
    pressure: 30.12,
    visibility: 10,
    location: 'Farm Location'
  },
  forecast: [
    {
      date: new Date(),
      high: 75,
      low: 58,
      condition: 'partly-cloudy',
      precipitationChance: 20,
      windSpeed: 8
    },
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      high: 68,
      low: 52,
      condition: 'rainy',
      precipitationChance: 80,
      windSpeed: 12
    },
    {
      date: new Date(Date.now() + 48 * 60 * 60 * 1000),
      high: 63,
      low: 45,
      condition: 'cloudy',
      precipitationChance: 40,
      windSpeed: 15
    },
    {
      date: new Date(Date.now() + 72 * 60 * 60 * 1000),
      high: 70,
      low: 48,
      condition: 'sunny',
      precipitationChance: 10,
      windSpeed: 6
    },
    {
      date: new Date(Date.now() + 96 * 60 * 60 * 1000),
      high: 76,
      low: 54,
      condition: 'sunny',
      precipitationChance: 5,
      windSpeed: 4
    }
  ]
}

export const weatherService = {
  async getCurrentWeather(location = 'default') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Add some randomization to make it more realistic
    const baseTemp = MOCK_WEATHER_DATA.current.temperature
    const variation = (Math.random() - 0.5) * 10
    
    return {
      ...MOCK_WEATHER_DATA.current,
      temperature: Math.round(baseTemp + variation),
      timestamp: new Date()
    }
  },

  async getForecast(location = 'default') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return MOCK_WEATHER_DATA.forecast.map(day => ({
      ...day,
      high: day.high + Math.round((Math.random() - 0.5) * 6),
      low: day.low + Math.round((Math.random() - 0.5) * 4)
    }))
  },

  generateCropRecommendations(weatherData) {
    const recommendations = []
    const alerts = []
    
    // Temperature-based recommendations
    if (weatherData.current.temperature < 35) {
      alerts.push({
        type: 'frost',
        severity: 'high',
        title: 'Frost Warning',
        message: 'Protect sensitive crops with row covers or move potted plants indoors',
        icon: 'Snowflake',
        actions: ['Cover crops', 'Move containers', 'Check irrigation']
      })
    }
    
    if (weatherData.current.temperature > 90) {
      alerts.push({
        type: 'heat',
        severity: 'medium',
        title: 'Heat Advisory',
        message: 'Increase watering frequency and provide shade for sensitive plants',
        icon: 'Thermometer',
        actions: ['Extra watering', 'Shade cloth', 'Mulching']
      })
    }
    
    // Precipitation-based recommendations
    const upcomingRain = weatherData.forecast.slice(0, 3).some(day => day.precipitationChance > 60)
    
    if (upcomingRain) {
      recommendations.push({
        type: 'watering',
        title: 'Adjust Watering Schedule',
        message: 'Heavy rain expected - reduce or skip watering for next 2-3 days',
        icon: 'CloudRain',
        priority: 'medium'
      })
    }
    
    // Wind-based recommendations
    if (weatherData.current.windSpeed > 20) {
      recommendations.push({
        type: 'wind',
        title: 'High Wind Advisory',
        message: 'Secure tall plants and greenhouse structures. Delay spraying activities.',
        icon: 'Wind',
        priority: 'high'
      })
    }
    
    // UV-based recommendations
    if (weatherData.current.uvIndex > 8) {
      recommendations.push({
        type: 'uv',
        title: 'High UV Index',
        message: 'Consider shade protection for sensitive crops during peak hours (10am-4pm)',
        icon: 'Sun',
        priority: 'low'
      })
    }
    
    // Planting recommendations
    const avgTemp = weatherData.forecast.slice(0, 7).reduce((sum, day) => sum + (day.high + day.low) / 2, 0) / 7
    
    if (avgTemp >= 65 && avgTemp <= 75) {
      recommendations.push({
        type: 'planting',
        title: 'Optimal Planting Conditions',
        message: 'Perfect temperature range for planting cool-season crops like lettuce, spinach, and peas',
        icon: 'Sprout',
        priority: 'medium'
      })
    }
    
    // Pest management
    if (weatherData.current.humidity > 70 && weatherData.current.temperature > 70) {
      recommendations.push({
        type: 'pest',
        title: 'Pest Monitoring',
        message: 'High humidity and warm temperatures favor pest development. Increase monitoring.',
        icon: 'Bug',
        priority: 'medium'
      })
    }
    
    return { recommendations, alerts }
  }
}

export default weatherService