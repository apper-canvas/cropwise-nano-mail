import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const CalendarView = ({ tasks, setTasks, addWeatherTask, onExport }) => {
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [farmLocations] = useState(['North Field', 'South Field', 'Greenhouse A', 'Greenhouse B'])
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    priority: 'Medium',
    location: 'North Field',
    notes: '',
    recurring: false,
    recurringType: 'weekly',
    recurringEnd: '',
    taskType: 'watering',
    assignedCropFarm: ''
  })

  // Convert tasks to calendar events
  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.dueDate),
    end: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000), // 1 hour duration
    resource: {
      priority: task.priority,
      location: task.location || 'North Field',
      completed: task.completed,
      notes: task.notes || '',
      recurring: task.recurring || false,
      taskType: task.taskType || 'watering',
      assignedCropFarm: task.assignedCropFarm || ''
    }
  }))

  const eventStyleGetter = (event) => {
    const { priority, location, completed } = event.resource
    
    let backgroundColor = '#22c55e' // default green
    let borderColor = '#16a34a'

    // Priority-based colors
    if (priority === 'High') {
      backgroundColor = '#ef4444'
      borderColor = '#dc2626'
    } else if (priority === 'Medium') {
      backgroundColor = '#f59e0b'
      borderColor = '#d97706'
    } else if (priority === 'Low') {
      backgroundColor = '#22c55e'
      borderColor = '#16a34a'
    }

    // Location-based opacity variations
    const locationOpacity = {
      'North Field': 1,
      'South Field': 0.8,
      'Greenhouse A': 0.9,
      'Greenhouse B': 0.7
    }

    const style = {
      backgroundColor,
      borderColor,
      opacity: completed ? 0.5 : (locationOpacity[location] || 1),
      textDecoration: completed ? 'line-through' : 'none',
      border: `2px solid ${borderColor}`,
      borderRadius: '6px',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '500'
    }

    return { style }
  }

  const handleSelectSlot = useCallback(({ start, end }) => {
    setSelectedSlot({ start, end })
    setNewEvent({
      title: '',
      start,
      end,
      priority: 'Medium',
      location: 'North Field',
      notes: '',
      recurring: false,
      recurringEnd: '',
      taskType: 'watering',
      assignedCropFarm: ''
      recurringEnd: ''
    })
    setShowEventModal(true)
  }, [])

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event)
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      priority: event.resource.priority,
      location: event.resource.location,
      notes: event.resource.notes,
      recurring: event.resource.recurring,
      recurringType: 'weekly',
      recurringEnd: '',
      taskType: event.resource.taskType || 'watering',
      assignedCropFarm: event.resource.assignedCropFarm || ''
    })
    setShowEventModal(true)
  }, [])

  const handleEventDrop = useCallback(({ event, start, end }) => {
    const updatedTasks = tasks.map(task => 
      task.id === event.id 
        ? { ...task, dueDate: start.toISOString().split('T')[0] }
        : task
    )
    setTasks(updatedTasks)
    toast.success('Task rescheduled successfully!')
  }, [tasks, setTasks])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newEvent.title) {
      toast.error('Please enter a task title')
      return
    }

    if (selectedEvent) {
      // Update existing task
      const updatedTasks = tasks.map(task =>
        task.id === selectedEvent.id
          ? {
              ...task,
              title: newEvent.title,
              dueDate: newEvent.start.toISOString().split('T')[0],
              priority: newEvent.priority,
              location: newEvent.location,
              notes: newEvent.notes,
              recurring: newEvent.recurring,
              taskType: newEvent.taskType,
              assignedCropFarm: newEvent.assignedCropFarm
            }
          : task
      )
      setTasks(updatedTasks)
      toast.success('Task updated successfully!')
    } else {
      // Create new task(s)
      const baseTask = {
        id: Date.now(),
        title: newEvent.title,
        dueDate: newEvent.start.toISOString().split('T')[0],
        priority: newEvent.priority,
        location: newEvent.location,
        notes: newEvent.notes,
        completed: false,
        recurring: newEvent.recurring,
        taskType: newEvent.taskType,
        assignedCropFarm: newEvent.assignedCropFarm
      }

      if (newEvent.recurring && newEvent.recurringEnd) {
        // Generate recurring tasks
        const recurringTasks = generateRecurringTasks(baseTask, newEvent.recurringType, newEvent.recurringEnd)
        setTasks([...tasks, ...recurringTasks])
        toast.success(`${recurringTasks.length} recurring tasks created!`)
      } else {
        setTasks([...tasks, baseTask])
        toast.success('Task created successfully!')
      }
    }

    closeModal()
  }

  const generateRecurringTasks = (baseTask, type, endDate) => {
    const tasks = []
    let currentDate = new Date(baseTask.dueDate)
    const end = new Date(endDate)
    let counter = 1

    while (currentDate <= end && counter <= 52) { // Limit to 52 occurrences
      tasks.push({
        ...baseTask,
        id: baseTask.id + counter,
        dueDate: currentDate.toISOString().split('T')[0],
        title: `${baseTask.title} (Week ${counter})`
      })

      if (type === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (type === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else if (type === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      counter++
    }

    return tasks
  }

  const handleDelete = () => {
    if (selectedEvent) {
      const updatedTasks = tasks.filter(task => task.id !== selectedEvent.id)
      setTasks(updatedTasks)
      toast.success('Task deleted successfully!')
      closeModal()
    }
  }

  const closeModal = () => {
    setShowEventModal(false)
    setShowRecurringModal(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
    setNewEvent({
      title: '',
      start: new Date(),
      end: new Date(),
      priority: 'Medium',
      location: 'North Field',
      notes: '',
      recurring: false,
      recurringType: 'weekly',
      recurringEnd: '',
      taskType: 'watering',
      assignedCropFarm: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Task Calendar
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addWeatherTask}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-300 text-sm"
          >
            <ApperIcon name="Cloud" className="h-4 w-4" />
            Weather Task
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-300 text-sm"
          >
            <ApperIcon name="Download" className="h-4 w-4" />
            Export Tasks
          </button>
          
          <div className="flex rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
            {['month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors duration-300 ${
                  view === viewType
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden">
        <div style={{ height: '600px' }} className="p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            eventPropGetter={eventStyleGetter}
            selectable
            resizable
            popup
            step={60}
            showMultiDayTimes
            className="calendar-custom"
          />
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
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
                    {selectedEvent ? 'Edit Task' : 'New Task'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
                  >
                    <ApperIcon name="X" className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Type
                    </label>
                    <select
                      value={newEvent.taskType}
                      onChange={(e) => setNewEvent({...newEvent, taskType: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                    >
                      <option value="watering">Watering</option>
                      <option value="fertilizing">Fertilizing</option>
                      <option value="weeding">Weeding</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="planting">Planting</option>
                      <option value="pest_control">Pest Control</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inspection">Inspection</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="pruning">Pruning</option>
                      <option value="soil_testing">Soil Testing</option>
                      <option value="equipment_maintenance">Equipment Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Assigned Crop/Farm
                    </label>
                    <select
                      value={newEvent.assignedCropFarm}
                      onChange={(e) => setNewEvent({...newEvent, assignedCropFarm: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                    >
                      <option value="">Select Crop/Farm</option>
                      <optgroup label="Farm Locations">
                        {farmLocations.map(location => (
                          <option key={`farm-${location}`} value={`Farm: ${location}`}>
                            Farm: {location}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="General Areas">
                        <option value="All Farms">All Farms</option>
                        <option value="Main Field">Main Field</option>
                        <option value="Secondary Field">Secondary Field</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                        onChange={(e) => setNewEvent({...newEvent, start: new Date(e.target.value)})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                        onChange={(e) => setNewEvent({...newEvent, end: new Date(e.target.value)})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newEvent.priority}
                        onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Location
                      </label>
                      <select
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      >
                        {farmLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-700 dark:text-surface-100"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={newEvent.recurring}
                      onChange={(e) => setNewEvent({...newEvent, recurring: e.target.checked})}
                      className="rounded border-surface-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="recurring" className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Make this a recurring task
                    </label>
                  </div>

                  {newEvent.recurring && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-surface-50 dark:bg-surface-700 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Repeat
                        </label>
                        <select
                          value={newEvent.recurringType}
                          onChange={(e) => setNewEvent({...newEvent, recurringType: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Until
                        </label>
                        <input
                          type="date"
                          value={newEvent.recurringEnd}
                          onChange={(e) => setNewEvent({...newEvent, recurringEnd: e.target.value})}
                          className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      {selectedEvent ? 'Update Task' : 'Create Task'}
                    </button>
                    {selectedEvent && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeModal}
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

      {/* Legend */}
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4">
        <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-3">Task Legend</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-surface-600 dark:text-surface-400">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-surface-600 dark:text-surface-400">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-surface-600 dark:text-surface-400">Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-surface-300 rounded"></div>
            <span className="text-sm text-surface-600 dark:text-surface-400">Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView