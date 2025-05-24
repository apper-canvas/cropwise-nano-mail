import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const KanbanView = ({ tasks, setTasks, addWeatherTask, onExport }) => {
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [filters, setFilters] = useState({
    priority: 'all',
    search: '',
    dateRange: 'all',
    assignee: 'all'
  })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    status: 'todo',
    assignee: '',
    location: 'North Field'
  })

  const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800', headerColor: 'bg-gray-500' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900', headerColor: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100 dark:bg-yellow-900', headerColor: 'bg-yellow-500' },
    { id: 'done', title: 'Done', color: 'bg-green-100 dark:bg-green-900', headerColor: 'bg-green-500' }
  ]

  const farmLocations = ['North Field', 'South Field', 'Greenhouse A', 'Greenhouse B']
  const assignees = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson']

  useEffect(() => {
    applyFilters()
  }, [tasks, filters])

  const applyFilters = () => {
    let filtered = [...tasks]

    // Add status field to tasks if not present
    filtered = filtered.map(task => ({
      ...task,
      status: task.status || 'todo',
      assignee: task.assignee || '',
      location: task.location || 'North Field'
    }))

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      )
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.dueDate)
        const diffTime = taskDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (filters.dateRange) {
          case 'today':
            return task.dueDate === todayStr
          case 'week':
            return diffDays >= 0 && diffDays <= 7
          case 'overdue':
            return diffDays < 0
          default:
            return true
        }
      })
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      filtered = filtered.filter(task => task.assignee === filters.assignee)
    }

    setFilteredTasks(filtered)
  }

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const taskId = parseInt(draggableId)
    const newStatus = destination.droppableId
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, completed: newStatus === 'done' }
        : task
    )

    setTasks(updatedTasks)
    toast.success(`Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`)
  }

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => (task.status || 'todo') === status)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSubmitTask = (e) => {
    e.preventDefault()
    if (!newTask.title || !newTask.dueDate) {
      toast.error('Please fill in required fields')
      return
    }

    if (editingTask) {
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...newTask }
          : task
      )
      setTasks(updatedTasks)
      toast.success('Task updated successfully!')
      setEditingTask(null)
    } else {
      const task = {
        id: Date.now(),
        ...newTask,
        completed: newTask.status === 'done'
      }
      setTasks([...tasks, task])
      toast.success('Task created successfully!')
    }

    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      status: 'todo',
      assignee: '',
      location: 'North Field'
    })
    setShowTaskForm(false)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status || 'todo',
      assignee: task.assignee || '',
      location: task.location || 'North Field'
    })
    setShowTaskForm(true)
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully!')
    }
  }

  const closeTaskForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      status: 'todo',
      assignee: '',
      location: 'North Field'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Kanban Task Board
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            Add Task
          </button>
          
          <button
            onClick={addWeatherTask}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <ApperIcon name="Cloud" className="h-4 w-4" />
            Weather Task
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <ApperIcon name="Download" className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Search Tasks
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
              placeholder="Search by title or description..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Due Date
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
            >
              <option value="all">All Dates</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Assignee
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({...filters, assignee: e.target.value})}
              className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
            >
              <option value="all">All Assignees</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {statusColumns.map((column) => (
            <div key={column.id} className={`${column.color} rounded-xl shadow-card overflow-hidden`}>
              <div className={`${column.headerColor} text-white p-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
                    {getTasksByStatus(column.id).length}
                  </span>
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[500px] transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-primary/10' : ''
                    }`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white dark:bg-surface-800 rounded-lg shadow-card p-4 mb-3 transition-all duration-200 ${
                              snapshot.isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:shadow-lg'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">
                                {task.title}
                              </h4>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                >
                                  <ApperIcon name="Edit2" className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <ApperIcon name="Trash2" className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-surface-600 dark:text-surface-400 text-xs mb-3">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              
                              {(() => {
                                const daysUntil = getDaysUntilDue(task.dueDate)
                                return (
                                  <span className={`text-xs font-medium ${
                                    daysUntil < 0 ? 'text-red-500' : 
                                    daysUntil === 0 ? 'text-yellow-500' : 
                                    'text-surface-600 dark:text-surface-400'
                                  }`}>
                                    {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` :
                                     daysUntil === 0 ? 'Due today' :
                                     `${daysUntil}d left`}
                                  </span>
                                )
                              })()}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
                              <div className="flex items-center gap-1">
                                <ApperIcon name="MapPin" className="h-3 w-3" />
                                {task.location || 'North Field'}
                              </div>
                              {task.assignee && (
                                <div className="flex items-center gap-1">
                                  <ApperIcon name="User" className="h-3 w-3" />
                                  {task.assignee}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeTaskForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {editingTask ? 'Edit Task' : 'New Task'}
                  </h3>
                  <button
                    onClick={closeTaskForm}
                    className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
                  >
                    <ApperIcon name="X" className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      rows={3}
                      placeholder="Task description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Status
                      </label>
                      <select
                        value={newTask.status}
                        onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      >
                        {statusColumns.map(column => (
                          <option key={column.id} value={column.id}>{column.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Location
                      </label>
                      <select
                        value={newTask.location}
                        onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      >
                        {farmLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Assignee
                      </label>
                      <select
                        value={newTask.assignee}
                        onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      >
                        <option value="">Unassigned</option>
                        {assignees.map(assignee => (
                          <option key={assignee} value={assignee}>{assignee}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={closeTaskForm}
                      className="bg-surface-200 hover:bg-surface-300 text-surface-700 px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default KanbanView