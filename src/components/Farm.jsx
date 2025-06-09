import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import farmService from '../services/api/farmService'

const Farm = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    type: 'Vegetable',
    established: ''
  })

  // Load farms when component mounts
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
      setError('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFarm = async (e) => {
    e.preventDefault()
    if (!newFarm.name || !newFarm.location || !newFarm.size || !newFarm.established) {
      toast.error('Please fill in all fields')
      return
    }

    const farmData = {
      ...newFarm,
      size: parseFloat(newFarm.size)
    }

    if (editingFarm) {
      const updatedFarm = await farmService.update(editingFarm.id, farmData)
      if (updatedFarm) {
        await loadFarms()
        setEditingFarm(null)
      }
    } else {
      const createdFarm = await farmService.create(farmData)
      if (createdFarm) {
        await loadFarms()
      }
    }

    resetForm()
  }

  const handleEditFarm = (farm) => {
    setEditingFarm(farm)
    setNewFarm({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      type: farm.type,
      established: farm.established
    })
    setShowAddForm(true)
  }

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      const deleted = await farmService.delete(farmId)
      if (deleted) {
        await loadFarms()
      }
    }
  }

  const resetForm = () => {
    setNewFarm({
      name: '',
      location: '',
      size: '',
      type: 'Vegetable',
      established: ''
    })
    setShowAddForm(false)
    setEditingFarm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            Farm Management
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            Add Farm
          </button>
        </div>

        {/* Add/Edit Farm Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card mb-8"
            >
              <form onSubmit={handleAddFarm} className="space-y-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {editingFarm ? 'Edit Farm' : 'Add New Farm'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      value={newFarm.name}
                      onChange={(e) => setNewFarm({...newFarm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="e.g., North Field Farm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newFarm.location}
                      onChange={(e) => setNewFarm({...newFarm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="e.g., North Valley, CA"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Size (acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newFarm.size}
                      onChange={(e) => setNewFarm({...newFarm, size: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      placeholder="0.0"
                      required
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
                      <option value="Vegetable">Vegetable</option>
                      <option value="Grain">Grain</option>
                      <option value="Fruit">Fruit</option>
                      <option value="Livestock">Livestock</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Established Date
                    </label>
                    <input
                      type="date"
                      value={newFarm.established}
                      onChange={(e) => setNewFarm({...newFarm, established: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <ApperIcon name="Check" className="h-4 w-4" />
                    {editingFarm ? 'Update Farm' : 'Add Farm'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <ApperIcon name="X" className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Farms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {farms?.map((farm) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-lg">
                    {farm.name}
                  </h3>
                  <p className="text-surface-600 dark:text-surface-400 text-sm">
                    {farm.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditFarm(farm)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-300"
                    title="Edit Farm"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFarm(farm.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                    title="Delete Farm"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <ApperIcon name="Maximize" className="h-4 w-4" />
                  Size: {farm.size} acres
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <ApperIcon name="Tag" className="h-4 w-4" />
                  Type: {farm.type}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <ApperIcon name="Calendar" className="h-4 w-4" />
                  Established: {new Date(farm.established).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          )) || []}
        </div>

        {farms?.length === 0 && !loading && (
          <div className="text-center py-12">
            <ApperIcon name="MapPin" className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">
              No farms found. Add your first farm to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Farm