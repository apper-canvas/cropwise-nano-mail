import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva'
import { 
  Map, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  Crop,
  MapPin,
  Calendar,
  BarChart3,
  Home,
  Download,
  Upload
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const FarmMap = () => {
  const [fields, setFields] = useState([])
  const [crops, setCrops] = useState([])
  const [tasks, setTasks] = useState([])
  const [farms, setFarms] = useState([{id: 1, name: 'Main Farm'}, {id: 2, name: 'North Farm'}, {id: 3, name: 'South Farm'}])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentField, setCurrentField] = useState(null)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedField, setSelectedField] = useState(null)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showComparisonView, setShowComparisonView] = useState(false)
  const [viewMode, setViewMode] = useState('fields')
  const stageRef = useRef()

  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'cropland',
    area: '',
    soilType: '',
    notes: ''
  })

  const [cropForm, setCropForm] = useState({
    fieldId: '',
    assignedFarm: '',
    cropType: '',
    variety: '',
    plantingDate: '',
    expectedHarvestDate: '',
    notes: ''
  })

  const [taskForm, setTaskForm] = useState({
    fieldId: '',
    title: '',
    type: 'planting',
    priority: 'medium',
    dueDate: '',
    description: '',
    assignedTo: ''
  })

  const fieldTypes = ['cropland', 'pasture', 'orchard', 'greenhouse', 'storage', 'equipment']
  const cropTypes = ['corn', 'wheat', 'soybeans', 'tomatoes', 'lettuce', 'carrots', 'potatoes', 'beans']
  const taskTypes = ['planting', 'watering', 'fertilizing', 'harvesting', 'maintenance', 'pest_control']

  const handleStageMouseDown = (e) => {
    if (selectedTool === 'field') {
      const pos = e.target.getStage().getPointerPosition()
      const newField = {
        id: Date.now(),
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        name: `Field ${fields.length + 1}`,
        type: 'cropland',
        area: 0,
        soilType: '',
        notes: '',
        color: getFieldColor('cropland')
      }
      setCurrentField(newField)
      setIsDrawing(true)
    }
  }

  const handleStageMouseMove = (e) => {
    if (!isDrawing || !currentField) return
    
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const width = point.x - currentField.x
    const height = point.y - currentField.y
    
    setCurrentField({
      ...currentField,
      width,
      height,
      area: Math.abs(width * height / 1000).toFixed(2)
    })
  }

  const handleStageMouseUp = () => {
    if (isDrawing && currentField) {
      if (Math.abs(currentField.width) > 20 && Math.abs(currentField.height) > 20) {
        setFields([...fields, currentField])
        toast.success('Field created successfully!')
      }
      setCurrentField(null)
      setIsDrawing(false)
      setSelectedTool('select')
    }
  }

  const getFieldColor = (type) => {
    const colors = {
      cropland: '#22c55e',
      pasture: '#84cc16',
      orchard: '#f59e0b',
      greenhouse: '#06b6d4',
      storage: '#6b7280',
      equipment: '#ef4444'
    }
    return colors[type] || '#22c55e'
  }

  const handleFieldClick = (field) => {
    if (selectedTool === 'select') {
      setSelectedField(field)
      setFieldForm({
        name: field.name,
        type: field.type,
        area: field.area,
        soilType: field.soilType,
        notes: field.notes
      })
    }
  }

  const handleFieldSave = () => {
    if (!fieldForm.name.trim()) {
      toast.error('Please enter a field name')
      return
    }

    const updatedFields = fields.map(field => 
      field.id === selectedField.id 
        ? { 
            ...field, 
            ...fieldForm,
            color: getFieldColor(fieldForm.type)
          }
        : field
    )
    setFields(updatedFields)
    setShowFieldModal(false)
    setSelectedField(null)
    toast.success('Field updated successfully!')
  }

  const handleFieldDelete = (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setFields(fields.filter(field => field.id !== fieldId))
      setCrops(crops.filter(crop => crop.fieldId !== fieldId))
      setTasks(tasks.filter(task => task.fieldId !== fieldId))
      setSelectedField(null)
      toast.success('Field deleted successfully!')
    }
  }

  const handleCropSave = () => {
    if (!cropForm.fieldId || !cropForm.cropType || !cropForm.assignedFarm) {
      toast.error('Please select a field, crop type, and assigned farm')
      return
    }

    const newCrop = {
      id: Date.now(),
      ...cropForm,
      createdAt: new Date().toISOString()
    }
    setCrops([...crops, newCrop])
    setShowCropModal(false)
    setCropForm({
      fieldId: '',
      assignedFarm: '',
      cropType: '',
      variety: '',
      plantingDate: '',
      expectedHarvestDate: '',
      notes: ''
    })
    toast.success('Crop added successfully!')
  }

  const handleTaskSave = () => {
    if (!taskForm.fieldId || !taskForm.title.trim()) {
      toast.error('Please select a field and enter a task title')
      return
    }

    const newTask = {
      id: Date.now(),
      ...taskForm,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    setTasks([...tasks, newTask])
    setShowTaskModal(false)
    setTaskForm({
      fieldId: '',
      title: '',
      type: 'planting',
      priority: 'medium',
      dueDate: '',
      description: '',
      assignedTo: ''
    })
    toast.success('Task created successfully!')
  }

  const exportMapData = () => {
    const mapData = {
      fields,
      crops,
      tasks,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `farm-map-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Map data exported successfully!')
  }

  const getFieldCrops = (fieldId) => crops.filter(crop => crop.fieldId === fieldId)
  const getFieldTasks = (fieldId) => tasks.filter(task => task.fieldId === fieldId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Map className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Interactive Farm Map</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportMapData}
                className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-md text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Tools */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedTool('select')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    selectedTool === 'select' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedTool('field')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    selectedTool === 'field' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowCropModal(true)}
                  className="w-full flex items-center px-3 py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Add Crop
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full flex items-center px-3 py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Add Task
                </button>
                <button
                  onClick={() => setShowComparisonView(!showComparisonView)}
                  className="w-full flex items-center px-3 py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare Views
                </button>
              </div>
            </div>

            {/* Field Info */}
            {selectedField && (
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Field Details</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowFieldModal(true)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFieldDelete(selectedField.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{selectedField.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-900 capitalize">{selectedField.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Area:</span>
                    <span className="ml-2 text-gray-900">{selectedField.area} sq ft</span>
                  </div>
                  {getFieldCrops(selectedField.id).length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Crops:</span>
                      <div className="mt-1 space-y-1">
                        {getFieldCrops(selectedField.id).map(crop => (
                          <div key={crop.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                            <div className="font-medium">{crop.cropType} - {crop.variety}</div>
                            {crop.expectedHarvestDate && (
                              <div className="text-emerald-600">Expected Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</div>
                            )}
                            {crop.assignedFarm && farms.find(f => f.id === parseInt(crop.assignedFarm)) && (
                              <div className="text-emerald-600">Farm: {farms.find(f => f.id === parseInt(crop.assignedFarm)).name}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {getFieldTasks(selectedField.id).length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Tasks:</span>
                      <div className="mt-1 space-y-1">
                        {getFieldTasks(selectedField.id).map(task => (
                          <div key={task.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {task.title} ({task.status})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
              <div className="space-y-2">
                {fieldTypes.map(type => (
                  <div key={type} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getFieldColor(type) }}
                    ></div>
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg" style={{ height: '600px' }}>
                <Stage
                  width={800}
                  height={600}
                  ref={stageRef}
                  onMouseDown={handleStageMouseDown}
                  onMouseMove={handleStageMouseMove}
                  onMouseUp={handleStageMouseUp}
                >
                  <Layer>
                    {/* Render existing fields */}
                    {fields.map(field => (
                      <Group key={field.id}>
                        <Rect
                          x={field.x}
                          y={field.y}
                          width={field.width}
                          height={field.height}
                          fill={field.color}
                          opacity={0.6}
                          stroke={field.color}
                          strokeWidth={2}
                          onClick={() => handleFieldClick(field)}
                          onTap={() => handleFieldClick(field)}
                        />
                        <Text
                          x={field.x + 5}
                          y={field.y + 5}
                          text={field.name}
                          fontSize={12}
                          fill="white"
                          fontStyle="bold"
                        />
                        {/* Crop markers */}
                        {getFieldCrops(field.id).map((crop, index) => (
                          <Circle
                            key={crop.id}
                            x={field.x + 20 + (index * 25)}
                            y={field.y + field.height - 20}
                            radius={8}
                            fill="#fbbf24"
                            stroke="#f59e0b"
                            strokeWidth={2}
                          />
                        ))}
                        {/* Task markers */}
                        {getFieldTasks(field.id).map((task, index) => (
                          <Rect
                            key={task.id}
                            x={field.x + field.width - 20 - (index * 25)}
                            y={field.y + 5}
                            width={15}
                            height={15}
                            fill="#3b82f6"
                            stroke="#2563eb"
                            strokeWidth={1}
                          />
                        ))}
                      </Group>
                    ))}
                    
                    {/* Render current field being drawn */}
                    {currentField && (
                      <Rect
                        x={currentField.x}
                        y={currentField.y}
                        width={currentField.width}
                        height={currentField.height}
                        fill={currentField.color}
                        opacity={0.4}
                        stroke={currentField.color}
                        strokeWidth={2}
                        dash={[5, 5]}
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {selectedTool === 'field' ? 'Click and drag to create a new field' : 'Click on fields to view details'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Field</h2>
              <button
                onClick={() => setShowFieldModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({...fieldForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={fieldForm.type}
                  onChange={(e) => setFieldForm({...fieldForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {fieldTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <input
                  type="text"
                  value={fieldForm.soilType}
                  onChange={(e) => setFieldForm({...fieldForm, soilType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={fieldForm.notes}
                  onChange={(e) => setFieldForm({...fieldForm, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleFieldSave}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowFieldModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add Crop</h2>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Field Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                  <select
                  value={cropForm.fieldId}
                  onChange={(e) => setCropForm({...cropForm, fieldId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
                </div>
                {/* Assigned Farm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Farm</label>
                  <select
                  value={cropForm.assignedFarm}
                  onChange={(e) => setCropForm({...cropForm, assignedFarm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
                </div>
                {/* Crop Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <select
                  value={cropForm.cropType}
                  onChange={(e) => setCropForm({...cropForm, cropType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select crop type</option>
                  {cropTypes.map(crop => (
                    <option key={crop} value={crop} className="capitalize">{crop}</option>
                  ))}
                </select>
                </div>
                {/* Variety */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                  <input
                  type="text"
                  value={cropForm.variety}
                  onChange={(e) => setCropForm({...cropForm, variety: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                </div>
                {/* Planting Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                  <input
                  type="date"
                  value={cropForm.plantingDate}
                  onChange={(e) => setCropForm({...cropForm, plantingDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                </div>
                {/* Expected Harvest Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
                  <input
                  type="date"
                  value={cropForm.expectedHarvestDate}
                  onChange={(e) => setCropForm({...cropForm, expectedHarvestDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                </div>
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                  value={cropForm.notes}
                  onChange={(e) => setCropForm({...cropForm, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Additional notes about this crop..."
                ></textarea>
              </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={handleCropSave}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Add Crop
                </button>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <select
                  value={taskForm.fieldId}
                  onChange={(e) => setTaskForm({...taskForm, fieldId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                <select
                  value={taskForm.type}
                  onChange={(e) => setTaskForm({...taskForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {taskTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleTaskSave}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmMap