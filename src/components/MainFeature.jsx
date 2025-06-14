import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import CalendarView from './CalendarView'
import DataExport from './DataExport'
import KanbanView from './KanbanView'
import ExpenseReport from './ExpenseReport'
import farmService from '../services/api/farmService'
import cropService from '../services/api/cropService'
import taskService from '../services/api/taskService'
import expenseService from '../services/api/expenseService'


const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('crops')
  const [crops, setCrops] = useState([])
  const [tasks, setTasks] = useState([])
  const [expenses, setExpenses] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState({
    farms: false,
    crops: false,
    tasks: false,
    expenses: false
  })
  const [error, setError] = useState(null)
  const [showCropForm, setShowCropForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const [showExportModal, setShowExportModal] = useState(false)
  const [newCrop, setNewCrop] = useState({
    name: '',
    variety: '',
    plantingDate: '',
    area: '',
    expectedHarvestDate: '',
    assignedFarm: ''
  })

  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    priority: 'Medium'
  })

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Seeds',
    date: ''
  })

  const [showFarmForm, setShowFarmForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    type: 'Vegetable',
    established: ''
  })

  const tabs = [
    { id: 'farms', label: 'Farms', icon: 'MapPin' },
    { id: 'crops', label: 'Crops', icon: 'Sprout' },
    { id: 'map', label: 'Farm Map', icon: 'Map' },
    { id: 'tasks', label: 'Calendar', icon: 'Calendar' },
    { id: 'kanban', label: 'Kanban', icon: 'Columns' },
    { id: 'expenses', label: 'Expenses', icon: 'DollarSign' },
]

  // Load all data on component mount
  useEffect(() => {
    loadFarms()
    loadCrops()
    loadTasks()
    loadExpenses()
  }, [])

  const loadFarms = async () => {
    setLoading(prev => ({ ...prev, farms: true }))
    try {
      const farmData = await farmService.getAll()
      setFarms(farmData || [])
    } catch (error) {
      console.error('Error loading farms:', error)
      setError('Failed to load farms')
    } finally {
      setLoading(prev => ({ ...prev, farms: false }))
    }
  }

  const loadCrops = async () => {
    setLoading(prev => ({ ...prev, crops: true }))
    try {
      const cropData = await cropService.getAll()
      setCrops(cropData || [])
    } catch (error) {
      console.error('Error loading crops:', error)
      setError('Failed to load crops')
    } finally {
      setLoading(prev => ({ ...prev, crops: false }))
    }
  }

  const loadTasks = async () => {
    setLoading(prev => ({ ...prev, tasks: true }))
    try {
      const taskData = await taskService.getAll()
      setTasks(taskData || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      setError('Failed to load tasks')
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }))
    }
  }

  const loadExpenses = async () => {
    setLoading(prev => ({ ...prev, expenses: true }))
    try {
      const expenseData = await expenseService.getAll()
      setExpenses(expenseData || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
      setError('Failed to load expenses')
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }))
    }
  }

  const handleAddCrop = async (e) => {
    e.preventDefault()
    if (!newCrop.name || !newCrop.variety || !newCrop.plantingDate || !newCrop.area || !newCrop.expectedHarvestDate || !newCrop.assignedFarm) {
      toast.error('Please fill in all fields')
      return
    }

    const cropData = {
      ...newCrop,
      status: 'Planning',
      area: parseFloat(newCrop.area)
    }

    const createdCrop = await cropService.create(cropData)
    if (createdCrop) {
      await loadCrops() // Refresh the list
      setNewCrop({ name: '', variety: '', plantingDate: '', area: '', expectedHarvestDate: '', assignedFarm: '' })
      setShowCropForm(false)
    }
  }

const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.title || !newTask.dueDate) {
      toast.error('Please fill in required fields')
      return
    }

    const taskData = {
      ...newTask,
      completed: false
    }

    const createdTask = await taskService.create(taskData)
    if (createdTask) {
      await loadTasks() // Refresh the list
      setNewTask({ title: '', dueDate: '', priority: 'Medium' })
      setShowTaskForm(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount || !newExpense.date) {
      toast.error('Please fill in all fields')
      return
    }

    const expenseData = {
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    }

    const createdExpense = await expenseService.create(expenseData)
    if (createdExpense) {
      await loadExpenses() // Refresh the list
      setNewExpense({ description: '', amount: '', category: 'Seeds', date: '' })
      setShowExpenseForm(false)
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
        await loadFarms() // Refresh the list
        setEditingFarm(null)
      }
    } else {
      const createdFarm = await farmService.create(farmData)
      if (createdFarm) {
        await loadFarms() // Refresh the list
      }
    }

    setNewFarm({ name: '', location: '', size: '', type: 'Vegetable', established: '' })
    setShowFarmForm(false)
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
    setShowFarmForm(true)
  }

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      const deleted = await farmService.delete(farmId)
      if (deleted) {
        await loadFarms() // Refresh the list
      }
    }
  }

  const cancelFarmForm = () => {
    setShowFarmForm(false)
    setEditingFarm(null)
    setNewFarm({ name: '', location: '', size: '', type: 'Vegetable', established: '' })
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const updatedTaskData = { ...task, completed: !task.completed }
      const updatedTask = await taskService.update(taskId, updatedTaskData)
      if (updatedTask) {
        await loadTasks() // Refresh the list
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-50'
      case 'Medium': return 'text-yellow-500 bg-yellow-50'
      case 'Low': return 'text-green-500 bg-green-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Growing': return 'text-green-500 bg-green-50'
      case 'Sprouting': return 'text-yellow-500 bg-yellow-50'
      case 'Planning': return 'text-blue-500 bg-blue-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const addWeatherTask = async (suggestions) => {
    if (suggestions.length > 0) {
      const taskData = { ...suggestions[0], completed: false }
      const createdTask = await taskService.create(taskData)
      if (createdTask) {
        await loadTasks() // Refresh the list
      }
    } else {
      toast.info('No weather-based tasks needed at this time')
    }
  }
return (
    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-surface-600 dark:text-surface-400 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <ApperIcon name={tab.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
              {tab.label}
</button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {/* Farms Tab */}
          {activeTab === 'farms' && (
            <motion.div
              key="farms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
                  Farm Management
                </h2>
<div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                  >
                    <ApperIcon name="Download" className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setShowFarmForm(!showFarmForm)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                  >
                    <ApperIcon name="Plus" className="h-4 w-4" />
                    Add Farm
                  </button>
                </div>
              </div>

              {/* Add Farm Form */}
              <AnimatePresence>
                {showFarmForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddFarm}
                    className="bg-surface-50 dark:bg-surface-900 p-4 sm:p-6 rounded-xl space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                      {editingFarm ? 'Edit Farm' : 'Add New Farm'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                        {editingFarm ? 'Update Farm' : 'Add Farm'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelFarmForm}
                        className="flex items-center justify-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="X" className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Farms List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {farms.map((farm) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-surface-800 p-4 sm:p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
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
                      {farm.crops && farm.crops.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                          <ApperIcon name="Sprout" className="h-4 w-4" />
                          Crops: {farm.crops.join(', ')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Crops Tab */}
          {activeTab === 'crops' && (
            <motion.div
              key="crops"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
                  Crop Management
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                  >
                    <ApperIcon name="Download" className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setShowCropForm(!showCropForm)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                  >
                    <ApperIcon name="Plus" className="h-4 w-4" />
                    Add Crop
                  </button>
                </div>
              </div>

              {/* Add Crop Form */}
              <AnimatePresence>
                {showCropForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddCrop}
                    className="bg-surface-50 dark:bg-surface-900 p-4 sm:p-6 rounded-xl space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Crop Name
                        </label>
                        <input
                          type="text"
                          value={newCrop.name}
                          onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="e.g., Tomatoes"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Variety
                        </label>
                        <input
                          type="text"
                          value={newCrop.variety}
                          onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="e.g., Cherry"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Planting Date
                        </label>
                        <input
                          type="date"
                          value={newCrop.plantingDate}
                          onChange={(e) => setNewCrop({...newCrop, plantingDate: e.target.value})}
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
                          value={newCrop.area}
                          onChange={(e) => setNewCrop({...newCrop, area: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Expected Harvest Date
                        </label>
                        <input
                          type="date"
                          value={newCrop.expectedHarvestDate}
                          onChange={(e) => setNewCrop({...newCrop, expectedHarvestDate: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Assigned Farm
                        </label>
                        <select
                          value={newCrop.assignedFarm}
                          onChange={(e) => setNewCrop({...newCrop, assignedFarm: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          <option value="">Select Farm</option>
                          {farms.map((farm) => (
                            <option key={farm.id} value={farm.name}>{farm.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                        Add Crop
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCropForm(false)}
                        className="flex items-center justify-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="X" className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Crops List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {crops.map((crop) => (
                  <motion.div
                    key={crop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-surface-800 p-4 sm:p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-lg">
                          {crop.name}
                        </h3>
                        <p className="text-surface-600 dark:text-surface-400 text-sm">
                          {crop.variety} • {crop.area} acres
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(crop.status)}`}>
                        {crop.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <ApperIcon name="Calendar" className="h-4 w-4" />
                      Planted: {new Date(crop.plantingDate).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Farm Map Tab */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-12"
            >
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                The interactive farm map is available as a dedicated page for the best experience.
              </p>
              <a
                href="/farm-map"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors duration-300"
              >
                <ApperIcon name="Map" className="h-5 w-5" />
                Open Farm Map
              </a>
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <CalendarView 
                tasks={tasks} 
                setTasks={setTasks} 
                addWeatherTask={addWeatherTask} 
                onExport={() => setShowExportModal(true)}
              />
            </motion.div>
          )}
          {/* Expenses Tab */}
          
          {/* Kanban Tab */}
          {activeTab === 'kanban' && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <KanbanView 
                tasks={tasks} 
                setTasks={setTasks} 
                addWeatherTask={addWeatherTask} 
                onExport={() => setShowExportModal(true)}
              />
            </motion.div>
          )}
          
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
                    Expense Tracking
                  </h2>
                  <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">
                    Total: ${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                  >
                    <ApperIcon name="Download" className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                  >
                    <ApperIcon name="Plus" className="h-4 w-4" />
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Add Expense Form */}
              <AnimatePresence>
                {showExpenseForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddExpense}
                    className="bg-surface-50 dark:bg-surface-900 p-4 sm:p-6 rounded-xl space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="e.g., Seeds - Tomato"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Category
                        </label>
                        <select
                          value={newExpense.category}
                          onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          <option value="Seeds">Seeds</option>
                          <option value="Fertilizer">Fertilizer</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Labor">Labor</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={newExpense.date}
                          onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                        Add Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowExpenseForm(false)}
                        className="flex items-center justify-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="X" className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Expenses List */}
              <div className="space-y-3 sm:space-y-4">
                {expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-surface-800 p-4 sm:p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                          {expense.description}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                            <ApperIcon name="Calendar" className="h-4 w-4" />
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                          <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-xs font-medium w-fit">
                            {expense.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-surface-900 dark:text-surface-100">
                          ${expense.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        {/* Expense Report Tab */}
        {activeTab === 'expense-report' && (
          <motion.div
            key="expense-report"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ExpenseReport expenses={expenses} onExport={() => setShowExportModal(true)} />
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Export Modal */}
      <DataExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        farms={farms}
        crops={crops}
        tasks={tasks}
        expenses={expenses}
      />
    </div>
  )
}

export default MainFeature