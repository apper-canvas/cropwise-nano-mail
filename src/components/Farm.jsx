import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import ApperIcon from './ApperIcon'
import DataExport from './DataExport'

const Farm = () => {
  const [farms, setFarms] = useState([
    { 
      id: 1, 
      name: 'North Field Farm', 
      location: 'North Valley, CA', 
      size: 50.5, 
      type: 'Vegetable', 
      established: '2020-01-15', 
      crops: ['Tomatoes', 'Corn'],
      description: 'Primary vegetable production facility with advanced irrigation systems.',
      soilType: 'Loamy',
      irrigationType: 'Drip',
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Sunny Acres', 
      location: 'Central Valley, CA', 
      size: 75.2, 
      type: 'Grain', 
      established: '2018-05-20', 
      crops: ['Wheat', 'Barley'],
      description: 'Large-scale grain production with modern harvesting equipment.',
      soilType: 'Clay',
      irrigationType: 'Sprinkler',
      status: 'Active'
    }
  ])

  const [showFarmForm, setShowFarmForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [viewingFarm, setViewingFarm] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    type: 'Vegetable',
    established: '',
    description: '',
    soilType: 'Loamy',
    irrigationType: 'Drip'
  })

  const farmTypes = ['Vegetable', 'Grain', 'Fruit', 'Livestock', 'Mixed']
  const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Silty', 'Rocky']
  const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Manual', 'Rain-fed']

  const handleAddFarm = (e) => {
    e.preventDefault()
    if (!newFarm.name || !newFarm.location || !newFarm.size || !newFarm.established) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingFarm) {
      setFarms(farms.map(farm => 
        farm.id === editingFarm.id 
          ? { ...farm, ...newFarm, size: parseFloat(newFarm.size), status: 'Active' }
          : farm
      ))
      toast.success('Farm updated successfully!')
      setEditingFarm(null)
    } else {
      const farm = {
        id: Date.now(),
        ...newFarm,
        size: parseFloat(newFarm.size),
        crops: [],
        status: 'Active'
      }
      setFarms([...farms, farm])
      toast.success('Farm added successfully!')
    }

    resetForm()
  }

  const resetForm = () => {
    setNewFarm({
      name: '',
      location: '',
      size: '',
      type: 'Vegetable',
      established: '',
      description: '',
      soilType: 'Loamy',
      irrigationType: 'Drip'
    })
    setShowFarmForm(false)
  }

  const handleEditFarm = (farm) => {
    setEditingFarm(farm)
    setNewFarm({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      type: farm.type,
      established: farm.established,
      description: farm.description || '',
      soilType: farm.soilType || 'Loamy',
      irrigationType: farm.irrigationType || 'Drip'
    })
    setShowFarmForm(true)
  }

  const handleDeleteFarm = (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      setFarms(farms.filter(farm => farm.id !== farmId))
      toast.success('Farm deleted successfully!')
    }
  }

  const handleViewFarm = (farm) => {
    setViewingFarm(farm)
  }

  const filteredFarms = farms
    .filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farm.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || farm.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size
        case 'established':
          return new Date(b.established) - new Date(a.established)
        default:
          return 0
      }
    })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-500 bg-green-50'
      case 'Inactive': return 'text-gray-500 bg-gray-50'
      case 'Planning': return 'text-blue-500 bg-blue-50'
      default: return 'text-gray-500 bg-gray-50'
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
              Farm Management
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark overflow-hidden">
          {/* Controls */}
          <div className="p-6 border-b border-surface-200 dark:border-surface-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search farms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="all">All Types</option>
                  {farmTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="established">Sort by Date</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300"
                >
                  <ApperIcon name="Download" className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowFarmForm(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300"
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                  Add Farm
                </button>
              </div>
            </div>
          </div>

          {/* Farm Form Modal */}
          <AnimatePresence>
            {showFarmForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => {
                  setShowFarmForm(false)
                  setEditingFarm(null)
                  resetForm()
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <form onSubmit={handleAddFarm} className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                      {editingFarm ? 'Edit Farm' : 'Add New Farm'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Farm Name *
                        </label>
                        <input
                          type="text"
                          value={newFarm.name}
                          onChange={(e) => setNewFarm({...newFarm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="e.g., North Field Farm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={newFarm.location}
                          onChange={(e) => setNewFarm({...newFarm, location: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="e.g., North Valley, CA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Size (acres) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFarm.size}
                          onChange={(e) => setNewFarm({...newFarm, size: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Farm Type
                        </label>
                        <select
                          value={newFarm.type}
                          onChange={(e) => setNewFarm({...newFarm, type: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          {farmTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Established Date *
                        </label>
                        <input
                          type="date"
                          value={newFarm.established}
                          onChange={(e) => setNewFarm({...newFarm, established: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Soil Type
                        </label>
                        <select
                          value={newFarm.soilType}
                          onChange={(e) => setNewFarm({...newFarm, soilType: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          {soilTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Irrigation Type
                        </label>
                        <select
                          value={newFarm.irrigationType}
                          onChange={(e) => setNewFarm({...newFarm, irrigationType: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          {irrigationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newFarm.description}
                        onChange={(e) => setNewFarm({...newFarm, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        placeholder="Brief description of the farm..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                        {editingFarm ? 'Update Farm' : 'Add Farm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFarmForm(false)
                          setEditingFarm(null)
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

          {/* Farms Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFarms.map((farm) => (
                <motion.div
                  key={farm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-lg group-hover:text-primary transition-colors">
                        {farm.name}
                      </h3>
                      <p className="text-surface-600 dark:text-surface-400 text-sm">
                        {farm.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(farm.status)}`}>
                      {farm.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <ApperIcon name="Maximize" className="h-4 w-4" />
                      {farm.size} acres • {farm.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <ApperIcon name="Calendar" className="h-4 w-4" />
                      Est. {new Date(farm.established).getFullYear()}
                    </div>
                    {farm.description && (
                      <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-2">
                        {farm.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewFarm(farm)}
                      className="flex items-center gap-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors duration-300 text-sm"
                    >
                      <ApperIcon name="Eye" className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditFarm(farm)}
                      className="flex items-center gap-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-lg transition-colors duration-300 text-sm"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFarm(farm.id)}
                      className="flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors duration-300 text-sm"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredFarms.length === 0 && (
              <div className="text-center py-12">
                <ApperIcon name="MapPin" className="h-12 w-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">
                  {searchTerm || filterType !== 'all' ? 'No farms match your search criteria.' : 'No farms found. Add your first farm to get started.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Export Modal */}
      <DataExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        farms={farms}
        crops={[]}
        tasks={[]}
        expenses={[]}
      />
    </div>
  )
}

export default Farm