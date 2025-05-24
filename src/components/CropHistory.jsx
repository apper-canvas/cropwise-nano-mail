import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import DataExport from './DataExport'

const CropHistory = () => {
  const { farmId } = useParams()
  const [farms] = useState([
    { 
      id: 1, 
      name: 'North Field Farm', 
      location: 'North Valley, CA', 
      size: 50.5, 
      type: 'Vegetable'
    },
    { 
      id: 2, 
      name: 'Sunny Acres', 
      location: 'Central Valley, CA', 
      size: 75.2, 
      type: 'Grain'
    }
  ])

  const [cropHistory, setCropHistory] = useState([
    {
      id: 1,
      farmId: 1,
      farmName: 'North Field Farm',
      cropName: 'Tomatoes',
      variety: 'Roma',
      plantingDate: '2023-03-15',
      harvestDate: '2023-07-20',
      area: 10.5,
      yieldAmount: 2400,
      yieldUnit: 'lbs',
      season: 'Spring 2023',
      status: 'Harvested',
      notes: 'Excellent yield, good weather conditions',
      pestIssues: 'Minor aphid infestation in June',
      fertilizerUsed: 'Organic compost, NPK 10-10-10',
      irrigationMethod: 'Drip irrigation',
      soilCondition: 'Good',
      weatherConditions: 'Mild spring, adequate rainfall'
    },
    {
      id: 2,
      farmId: 1,
      farmName: 'North Field Farm',
      cropName: 'Corn',
      variety: 'Sweet Corn',
      plantingDate: '2023-05-01',
      harvestDate: '2023-08-15',
      area: 15.0,
      yieldAmount: 1800,
      yieldUnit: 'lbs',
      season: 'Summer 2023',
      status: 'Harvested',
      notes: 'Good quality corn, market price was favorable',
      pestIssues: 'Corn borer damage in some sections',
      fertilizerUsed: 'NPK 15-5-10, side-dress with nitrogen',
      irrigationMethod: 'Sprinkler system',
      soilCondition: 'Excellent',
      weatherConditions: 'Hot summer, supplemental irrigation needed'
    },
    {
      id: 3,
      farmId: 2,
      farmName: 'Sunny Acres',
      cropName: 'Wheat',
      variety: 'Hard Red Winter',
      plantingDate: '2022-10-15',
      harvestDate: '2023-06-30',
      area: 40.0,
      yieldAmount: 3200,
      yieldUnit: 'bushels',
      season: 'Fall 2022 - Summer 2023',
      status: 'Harvested',
      notes: 'Record harvest, excellent grain quality',
      pestIssues: 'No significant pest issues',
      fertilizerUsed: 'Fall application of 18-46-0, spring nitrogen',
      irrigationMethod: 'Rain-fed with supplemental irrigation',
      soilCondition: 'Very Good',
      weatherConditions: 'Ideal growing conditions, timely rainfall'
    },
    {
      id: 4,
      farmId: 2,
      farmName: 'Sunny Acres',
      cropName: 'Barley',
      variety: 'Two-row Malting',
      plantingDate: '2023-03-20',
      harvestDate: '2023-07-10',
      area: 25.0,
      yieldAmount: 1800,
      yieldUnit: 'bushels',
      season: 'Spring 2023',
      status: 'Harvested',
      notes: 'Good malting quality, sold to brewery',
      pestIssues: 'Some rust issues late in season',
      fertilizerUsed: 'Starter fertilizer, foliar feeding',
      irrigationMethod: 'Center pivot irrigation',
      soilCondition: 'Good',
      weatherConditions: 'Dry spring, adequate irrigation'
    },
    {
      id: 5,
      farmId: 1,
      farmName: 'North Field Farm',
      cropName: 'Lettuce',
      variety: 'Romaine',
      plantingDate: '2022-09-01',
      harvestDate: '2022-11-15',
      area: 5.0,
      yieldAmount: 800,
      yieldUnit: 'lbs',
      season: 'Fall 2022',
      status: 'Harvested',
      notes: 'Premium quality, direct market sales',
      pestIssues: 'Slugs in wet areas',
      fertilizerUsed: 'Organic fish emulsion',
      irrigationMethod: 'Drip irrigation',
      soilCondition: 'Excellent',
      weatherConditions: 'Cool fall weather, perfect for lettuce'
    }
  ])

  const [filteredHistory, setFilteredHistory] = useState(cropHistory)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState(farmId ? parseInt(farmId) : 'all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('plantingDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)

  const [newCropHistory, setNewCropHistory] = useState({
    farmId: '',
    cropName: '',
    variety: '',
    plantingDate: '',
    harvestDate: '',
    area: '',
    yieldAmount: '',
    yieldUnit: 'lbs',
    season: '',
    status: 'Harvested',
    notes: '',
    pestIssues: '',
    fertilizerUsed: '',
    irrigationMethod: 'Drip irrigation',
    soilCondition: 'Good',
    weatherConditions: ''
  })

  const yieldUnits = ['lbs', 'bushels', 'tons', 'kg']
  const statusOptions = ['Harvested', 'Failed', 'Partial Harvest', 'Lost to Weather']
  const irrigationMethods = ['Drip irrigation', 'Sprinkler system', 'Center pivot irrigation', 'Rain-fed', 'Flood irrigation']
  const soilConditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']

  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedFarm, selectedYear, selectedStatus, sortBy, sortOrder, cropHistory])

  const applyFilters = () => {
    let filtered = [...cropHistory]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(crop =>
        crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.season.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by farm
    if (selectedFarm !== 'all') {
      filtered = filtered.filter(crop => crop.farmId === selectedFarm)
    }

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(crop =>
        new Date(crop.plantingDate).getFullYear().toString() === selectedYear
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(crop => crop.status === selectedStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'plantingDate' || sortBy === 'harvestDate') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else if (sortBy === 'area' || sortBy === 'yieldAmount') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredHistory(filtered)
  }

  const getAvailableYears = () => {
    const years = [...new Set(cropHistory.map(crop =>
      new Date(crop.plantingDate).getFullYear().toString()
    ))].sort().reverse()
    return years
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Harvested': return 'text-green-500 bg-green-50'
      case 'Failed': return 'text-red-500 bg-red-50'
      case 'Partial Harvest': return 'text-yellow-500 bg-yellow-50'
      case 'Lost to Weather': return 'text-orange-500 bg-orange-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const handleAddCropHistory = (e) => {
    e.preventDefault()

    if (!newCropHistory.farmId || !newCropHistory.cropName || !newCropHistory.plantingDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const farmName = farms.find(f => f.id === parseInt(newCropHistory.farmId))?.name || ''

    if (editingCrop) {
      setCropHistory(prev => prev.map(crop =>
        crop.id === editingCrop.id
          ? {
              ...crop,
              ...newCropHistory,
              farmId: parseInt(newCropHistory.farmId),
              farmName,
              area: parseFloat(newCropHistory.area),
              yieldAmount: parseFloat(newCropHistory.yieldAmount) || 0
            }
          : crop
      ))
      toast.success('Crop history updated successfully!')
      setEditingCrop(null)
    } else {
      const newEntry = {
        id: Date.now(),
        ...newCropHistory,
        farmId: parseInt(newCropHistory.farmId),
        farmName,
        area: parseFloat(newCropHistory.area),
        yieldAmount: parseFloat(newCropHistory.yieldAmount) || 0
      }
      setCropHistory(prev => [...prev, newEntry])
      toast.success('Crop history added successfully!')
    }

    resetForm()
  }

  const resetForm = () => {
    setNewCropHistory({
      farmId: '',
      cropName: '',
      variety: '',
      plantingDate: '',
      harvestDate: '',
      area: '',
      yieldAmount: '',
      yieldUnit: 'lbs',
      season: '',
      status: 'Harvested',
      notes: '',
      pestIssues: '',
      fertilizerUsed: '',
      irrigationMethod: 'Drip irrigation',
      soilCondition: 'Good',
      weatherConditions: ''
    })
    setShowAddForm(false)
  }

  const handleEditCrop = (crop) => {
    setEditingCrop(crop)
    setNewCropHistory({
      farmId: crop.farmId.toString(),
      cropName: crop.cropName,
      variety: crop.variety,
      plantingDate: crop.plantingDate,
      harvestDate: crop.harvestDate,
      area: crop.area.toString(),
      yieldAmount: crop.yieldAmount.toString(),
      yieldUnit: crop.yieldUnit,
      season: crop.season,
      status: crop.status,
      notes: crop.notes,
      pestIssues: crop.pestIssues,
      fertilizerUsed: crop.fertilizerUsed,
      irrigationMethod: crop.irrigationMethod,
      soilCondition: crop.soilCondition,
      weatherConditions: crop.weatherConditions
    })
    setShowAddForm(true)
  }

  const handleDeleteCrop = (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop history record? This action cannot be undone.')) {
      setCropHistory(prev => prev.filter(crop => crop.id !== cropId))
      toast.success('Crop history deleted successfully!')
    }
  }

  const calculateStats = () => {
    const totalArea = filteredHistory.reduce((sum, crop) => sum + crop.area, 0)
    const totalYield = filteredHistory.reduce((sum, crop) => sum + crop.yieldAmount, 0)
    const successfulHarvests = filteredHistory.filter(crop => crop.status === 'Harvested').length
    const successRate = filteredHistory.length > 0 ? (successfulHarvests / filteredHistory.length * 100).toFixed(1) : 0

    return { totalArea, totalYield, successfulHarvests, successRate }
  }

  const stats = calculateStats()
  const currentFarm = farmId ? farms.find(f => f.id === parseInt(farmId)) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={farmId ? "/farms" : "/"}
                className="flex items-center gap-2 text-surface-600 hover:text-primary transition-colors duration-300"
              >
                <ApperIcon name="ArrowLeft" className="h-5 w-5" />
                {farmId ? 'Back to Farms' : 'Back to Dashboard'}
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {currentFarm ? `${currentFarm.name} - Crop History` : 'Crop History'}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-neu-light dark:shadow-neu-dark"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <ApperIcon name="Maximize" className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-surface-600 dark:text-surface-400">Total Area</span>
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {stats.totalArea.toFixed(1)} acres
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-neu-light dark:shadow-neu-dark"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-secondary/10">
                <ApperIcon name="TrendingUp" className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-sm text-surface-600 dark:text-surface-400">Total Yield</span>
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {stats.totalYield.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-neu-light dark:shadow-neu-dark"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-green-500/10">
                <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-sm text-surface-600 dark:text-surface-400">Successful</span>
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {stats.successfulHarvests}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-neu-light dark:shadow-neu-dark"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-accent/10">
                <ApperIcon name="Target" className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm text-surface-600 dark:text-surface-400">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {stats.successRate}%
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark overflow-hidden">
          {/* Controls */}
          <div className="p-6 border-b border-surface-200 dark:border-surface-700">
            <div className="flex flex-col gap-4">
              {/* Top row - Search and view toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search crops, varieties, farms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-surface-100 dark:bg-surface-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        viewMode === 'cards'
                          ? 'bg-white dark:bg-surface-600 text-primary shadow-sm'
                          : 'text-surface-600 dark:text-surface-400'
                      }`}
                    >
                      <ApperIcon name="Grid3X3" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        viewMode === 'table'
                          ? 'bg-white dark:bg-surface-600 text-primary shadow-sm'
                          : 'text-surface-600 dark:text-surface-400'
                      }`}
                    >
                      <ApperIcon name="List" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!farmId && (
                  <select
                    value={selectedFarm}
                    onChange={(e) => setSelectedFarm(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                  >
                    <option value="all">All Farms</option>
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="all">All Years</option>
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field)
                    setSortOrder(order)
                  }}
                  className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="plantingDate-desc">Newest First</option>
                  <option value="plantingDate-asc">Oldest First</option>
                  <option value="yieldAmount-desc">Highest Yield</option>
                  <option value="area-desc">Largest Area</option>
                  <option value="cropName-asc">Crop Name A-Z</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300"
                >
                  <ApperIcon name="Download" className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300"
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                  Add Crop History
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHistory.map((crop) => (
                  <motion.div
                    key={crop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-lg group-hover:text-primary transition-colors">
                          {crop.cropName}
                        </h3>
                        <p className="text-surface-600 dark:text-surface-400 text-sm">
                          {crop.variety} • {crop.farmName}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(crop.status)}`}>
                        {crop.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                        <ApperIcon name="Calendar" className="h-4 w-4" />
                        {new Date(crop.plantingDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                        <ApperIcon name="Maximize" className="h-4 w-4" />
                        {crop.area} acres
                      </div>
                      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                        <ApperIcon name="TrendingUp" className="h-4 w-4" />
                        {crop.yieldAmount} {crop.yieldUnit}
                      </div>
                      <div className="text-sm text-surface-600 dark:text-surface-400">
                        <span className="font-medium">Season:</span> {crop.season}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCrop(crop)}
                        className="flex items-center gap-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors duration-300 text-sm"
                      >
                        <ApperIcon name="Eye" className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditCrop(crop)}
                        className="flex items-center gap-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-lg transition-colors duration-300 text-sm"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCrop(crop.id)}
                        className="flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors duration-300 text-sm"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Crop</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Farm</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Planted</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Area</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Yield</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((crop) => (
                      <tr key={crop.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-surface-900 dark:text-surface-100">{crop.cropName}</div>
                            <div className="text-sm text-surface-600 dark:text-surface-400">{crop.variety}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-surface-600 dark:text-surface-400">{crop.farmName}</td>
                        <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                          {new Date(crop.plantingDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-surface-600 dark:text-surface-400">{crop.area} acres</td>
                        <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                          {crop.yieldAmount} {crop.yieldUnit}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(crop.status)}`}>
                            {crop.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCrop(crop)}
                              className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded transition-colors"
                            >
                              <ApperIcon name="Eye" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditCrop(crop)}
                              className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded transition-colors"
                            >
                              <ApperIcon name="Edit" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCrop(crop.id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                            >
                              <ApperIcon name="Trash2" className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <ApperIcon name="Archive" className="h-12 w-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">
                  {searchTerm || selectedFarm !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all'
                    ? 'No crop history matches your search criteria.'
                    : 'No crop history found. Add your first crop record to get started.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowAddForm(false)
              setEditingCrop(null)
              resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleAddCropHistory} className="p-6 space-y-6">
                <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                  {editingCrop ? 'Edit Crop History' : 'Add Crop History'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Farm *
                    </label>
                    <select
                      value={newCropHistory.farmId}
                      onChange={(e) => setNewCropHistory({...newCropHistory, farmId: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      required
                    >
                      <option value="">Select Farm</option>
                      {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Crop Name *
                    </label>
                    <input
                      type="text"
                      value={newCropHistory.cropName}
                      onChange={(e) => setNewCropHistory({...newCropHistory, cropName: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="e.g., Tomatoes"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Variety
                    </label>
                    <input
                      type="text"
                      value={newCropHistory.variety}
                      onChange={(e) => setNewCropHistory({...newCropHistory, variety: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="e.g., Roma"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Planting Date *
                    </label>
                    <input
                      type="date"
                      value={newCropHistory.plantingDate}
                      onChange={(e) => setNewCropHistory({...newCropHistory, plantingDate: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      value={newCropHistory.harvestDate}
                      onChange={(e) => setNewCropHistory({...newCropHistory, harvestDate: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Area (acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCropHistory.area}
                      onChange={(e) => setNewCropHistory({...newCropHistory, area: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Yield Amount
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCropHistory.yieldAmount}
                      onChange={(e) => setNewCropHistory({...newCropHistory, yieldAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Yield Unit
                    </label>
                    <select
                      value={newCropHistory.yieldUnit}
                      onChange={(e) => setNewCropHistory({...newCropHistory, yieldUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    >
                      {yieldUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Season
                    </label>
                    <input
                      type="text"
                      value={newCropHistory.season}
                      onChange={(e) => setNewCropHistory({...newCropHistory, season: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="e.g., Spring 2023"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Status
                    </label>
                    <select
                      value={newCropHistory.status}
                      onChange={(e) => setNewCropHistory({...newCropHistory, status: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Irrigation Method
                    </label>
                    <select
                      value={newCropHistory.irrigationMethod}
                      onChange={(e) => setNewCropHistory({...newCropHistory, irrigationMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    >
                      {irrigationMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Soil Condition
                    </label>
                    <select
                      value={newCropHistory.soilCondition}
                      onChange={(e) => setNewCropHistory({...newCropHistory, soilCondition: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    >
                      {soilConditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newCropHistory.notes}
                      onChange={(e) => setNewCropHistory({...newCropHistory, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="General notes about this crop..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Pest Issues
                    </label>
                    <textarea
                      value={newCropHistory.pestIssues}
                      onChange={(e) => setNewCropHistory({...newCropHistory, pestIssues: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="Any pest or disease issues..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Fertilizer Used
                    </label>
                    <textarea
                      value={newCropHistory.fertilizerUsed}
                      onChange={(e) => setNewCropHistory({...newCropHistory, fertilizerUsed: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="Fertilizers and amendments used..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Weather Conditions
                    </label>
                    <textarea
                      value={newCropHistory.weatherConditions}
                      onChange={(e) => setNewCropHistory({...newCropHistory, weatherConditions: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="Weather conditions during growing season..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <ApperIcon name="Check" className="h-4 w-4" />
                    {editingCrop ? 'Update Record' : 'Add Record'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingCrop(null)
                      resetForm()
                    }}
                    className="flex items-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <ApperIcon name="X" className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCrop(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                      {selectedCrop.cropName} - {selectedCrop.variety}
                    </h3>
                    <p className="text-surface-600 dark:text-surface-400">
                      {selectedCrop.farmName} • {selectedCrop.season}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedCrop.status)}`}>
                    {selectedCrop.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-surface-600 dark:text-surface-400">Planted:</span>
                          <span>{new Date(selectedCrop.plantingDate).toLocaleDateString()}</span>
                        </div>
                        {selectedCrop.harvestDate && (
                          <div className="flex justify-between">
                            <span className="text-surface-600 dark:text-surface-400">Harvested:</span>
                            <span>{new Date(selectedCrop.harvestDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Production</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-surface-600 dark:text-surface-400">Area:</span>
                          <span>{selectedCrop.area} acres</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-600 dark:text-surface-400">Yield:</span>
                          <span>{selectedCrop.yieldAmount} {selectedCrop.yieldUnit}</span>
                        </div>
                        {selectedCrop.area > 0 && selectedCrop.yieldAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-surface-600 dark:text-surface-400">Yield per acre:</span>
                            <span>{(selectedCrop.yieldAmount / selectedCrop.area).toFixed(1)} {selectedCrop.yieldUnit}/acre</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Growing Conditions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-surface-600 dark:text-surface-400">Irrigation:</span>
                          <span>{selectedCrop.irrigationMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-600 dark:text-surface-400">Soil:</span>
                          <span>{selectedCrop.soilCondition}</span>
                        </div>
                      </div>
                    </div>

                    {selectedCrop.weatherConditions && (
                      <div>
                        <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Weather</h4>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          {selectedCrop.weatherConditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedCrop.notes || selectedCrop.pestIssues || selectedCrop.fertilizerUsed) && (
                  <div className="mt-6 space-y-4">
                    {selectedCrop.notes && (
                      <div>
                        <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Notes</h4>
                        <p className="text-sm text-surface-600 dark:text-surface-400">{selectedCrop.notes}</p>
                      </div>
                    )}
                    
                    {selectedCrop.pestIssues && (
                      <div>
                        <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Pest Issues</h4>
                        <p className="text-sm text-surface-600 dark:text-surface-400">{selectedCrop.pestIssues}</p>
                      </div>
                    )}
                    
                    {selectedCrop.fertilizerUsed && (
                      <div>
                        <h4 className="font-medium text-surface-900 dark:text-surface-100 mb-2">Fertilizer Used</h4>
                        <p className="text-sm text-surface-600 dark:text-surface-400">{selectedCrop.fertilizerUsed}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <button
                    onClick={() => setSelectedCrop(null)}
                    className="px-4 py-2 bg-surface-200 hover:bg-surface-300 text-surface-700 rounded-lg transition-colors duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <DataExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        farms={farms}
        crops={filteredHistory}
        tasks={[]}
        expenses={[]}
      />
    </div>
  )
}

export default CropHistory