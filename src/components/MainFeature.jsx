import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('crops')
  const [crops, setCrops] = useState([
    { id: 1, name: 'Tomatoes', variety: 'Cherry', plantingDate: '2024-03-15', status: 'Growing', area: 2.5 },
    { id: 2, name: 'Corn', variety: 'Sweet', plantingDate: '2024-04-01', status: 'Sprouting', area: 5.0 }
  ])
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Water Tomatoes', dueDate: '2024-12-20', priority: 'High', completed: false },
    { id: 2, title: 'Fertilize Corn', dueDate: '2024-12-22', priority: 'Medium', completed: false }
  ])
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Seeds - Tomato', amount: 45.99, category: 'Seeds', date: '2024-03-15' },
    { id: 2, description: 'Fertilizer', amount: 89.50, category: 'Fertilizer', date: '2024-04-01' }
  ])

  const [showCropForm, setShowCropForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const [newCrop, setNewCrop] = useState({
    name: '',
    variety: '',
    plantingDate: '',
    area: ''
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

  const tabs = [
    { id: 'crops', label: 'Crops', icon: 'Sprout' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'expenses', label: 'Expenses', icon: 'DollarSign' }
  ]

  const handleAddCrop = (e) => {
    e.preventDefault()
    if (!newCrop.name || !newCrop.variety || !newCrop.plantingDate || !newCrop.area) {
      toast.error('Please fill in all fields')
      return
    }

    const crop = {
      id: Date.now(),
      ...newCrop,
      status: 'Planning',
      area: parseFloat(newCrop.area)
    }

    setCrops([...crops, crop])
    setNewCrop({ name: '', variety: '', plantingDate: '', area: '' })
    setShowCropForm(false)
    toast.success('Crop added successfully!')
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.title || !newTask.dueDate) {
      toast.error('Please fill in required fields')
      return
    }

    const task = {
      id: Date.now(),
      ...newTask,
      completed: false
    }

    setTasks([...tasks, task])
    setNewTask({ title: '', dueDate: '', priority: 'Medium' })
    setShowTaskForm(false)
    toast.success('Task added successfully!')
  }

  const handleAddExpense = (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount || !newExpense.date) {
      toast.error('Please fill in all fields')
      return
    }

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    }

    setExpenses([...expenses, expense])
    setNewExpense({ description: '', amount: '', category: 'Seeds', date: '' })
    setShowExpenseForm(false)
    toast.success('Expense recorded successfully!')
  }

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ))
    toast.success('Task updated!')
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

  return (
    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl shadow-neu-light dark:shadow-neu-dark overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-300 ${
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
                <button
                  onClick={() => setShowCropForm(!showCropForm)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                  Add Crop
                </button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100">
                  Task Management
                </h2>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                  Add Task
                </button>
              </div>

              {/* Add Task Form */}
              <AnimatePresence>
                {showTaskForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddTask}
                    className="bg-surface-50 dark:bg-surface-900 p-4 sm:p-6 rounded-xl space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Task Title
                        </label>
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                          placeholder="e.g., Water Tomatoes"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                        Add Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="flex items-center justify-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        <ApperIcon name="X" className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Tasks List */}
              <div className="space-y-3 sm:space-y-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-surface-800 p-4 sm:p-6 rounded-xl shadow-card hover:shadow-lg transition-all duration-300 ${
                      task.completed ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                          task.completed
                            ? 'bg-primary border-primary text-white'
                            : 'border-surface-300 hover:border-primary'
                        }`}
                      >
                        {task.completed && <ApperIcon name="Check" className="h-3 w-3" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-surface-900 dark:text-surface-100 ${
                          task.completed ? 'line-through' : ''
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                            <ApperIcon name="Calendar" className="h-4 w-4" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium w-fit ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Expenses Tab */}
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
                <button
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300 w-fit"
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                  Add Expense
                </button>
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
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MainFeature