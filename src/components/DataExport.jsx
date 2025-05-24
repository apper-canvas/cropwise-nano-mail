import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import ApperIcon from './ApperIcon'

const DataExport = ({ isOpen, onClose, farms, crops, tasks, expenses }) => {
  const [exportConfig, setExportConfig] = useState({
    dataTypes: {
      crops: true,
      tasks: true,
      expenses: true
    },
    format: 'excel',
    dateRange: {
      start: '',
      end: ''
    },
    includeHeaders: true,
    separateSheets: true
  })
  
  const [isExporting, setIsExporting] = useState(false)

  const formatCropData = (cropData) => {
    return cropData.map(crop => ({
      'Crop Name': crop.name,
      'Variety': crop.variety,
      'Planting Date': crop.plantingDate,
      'Status': crop.status,
      'Area (acres)': crop.area,
      'Expected Harvest': crop.expectedHarvest || 'Not set',
      'Harvest Date': crop.harvestDate || 'Not harvested',
      'Yield (lbs)': crop.yield || 'Not recorded'
    }))
  }

  const formatTaskData = (taskData) => {
    return taskData.map(task => ({
      'Task Title': task.title,
      'Due Date': task.dueDate,
      'Priority': task.priority,
      'Status': task.completed ? 'Completed' : 'Pending',
      'Completion Date': task.completionDate || 'Not completed',
      'Description': task.description || '',
      'Location': task.location || 'General',
      'Assigned To': task.assignedTo || 'Unassigned'
    }))
  }

  const formatExpenseData = (expenseData) => {
    return expenseData.map(expense => ({
      'Description': expense.description,
      'Amount': expense.amount,
      'Category': expense.category,
      'Date': expense.date,
      'Payment Method': expense.paymentMethod || 'Not specified',
      'Vendor': expense.vendor || 'Not specified',
      'Receipt Number': expense.receiptNumber || 'Not recorded'
    }))
  }

  const filterDataByDateRange = (data, dateField) => {
    if (!exportConfig.dateRange.start && !exportConfig.dateRange.end) {
      return data
    }

    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      const startDate = exportConfig.dateRange.start ? new Date(exportConfig.dateRange.start) : null
      const endDate = exportConfig.dateRange.end ? new Date(exportConfig.dateRange.end) : null

      if (startDate && itemDate < startDate) return false
      if (endDate && itemDate > endDate) return false
      return true
    })
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.warning(`No data available for ${filename}`)
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      exportConfig.includeHeaders ? headers.join(',') : '',
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].filter(Boolean).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportToExcel = (datasets) => {
    const workbook = XLSX.utils.book_new()
    
    datasets.forEach(({ data, sheetName }) => {
      if (data && data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data, {
          header: exportConfig.includeHeaders ? Object.keys(data[0]) : undefined
        })
        
        // Auto-adjust column widths
        const colWidths = Object.keys(data[0]).map(key => ({
          wch: Math.max(
            key.length,
            ...data.map(row => String(row[key] || '').length)
          )
        }))
        worksheet['!cols'] = colWidths
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      }
    })

    if (workbook.SheetNames.length === 0) {
      toast.error('No data to export')
      return
    }

    const filename = `farm_data_export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const selectedData = []
      
      if (exportConfig.dataTypes.crops) {
        const filteredCrops = filterDataByDateRange(crops, 'plantingDate')
        const formattedCrops = formatCropData(filteredCrops)
        selectedData.push({ data: formattedCrops, sheetName: 'Crops', filename: 'crops' })
      }
      
      if (exportConfig.dataTypes.tasks) {
        const filteredTasks = filterDataByDateRange(tasks, 'dueDate')
        const formattedTasks = formatTaskData(filteredTasks)
        selectedData.push({ data: formattedTasks, sheetName: 'Tasks', filename: 'tasks' })
      }
      
      if (exportConfig.dataTypes.expenses) {
        const filteredExpenses = filterDataByDateRange(expenses, 'date')
        const formattedExpenses = formatExpenseData(filteredExpenses)
        selectedData.push({ data: formattedExpenses, sheetName: 'Expenses', filename: 'expenses' })
      }

      if (selectedData.length === 0) {
        toast.error('Please select at least one data type to export')
        return
      }

      if (exportConfig.format === 'excel') {
        if (exportConfig.separateSheets) {
          exportToExcel(selectedData)
          toast.success('Excel file exported successfully!')
        } else {
          // Combine all data into single sheet
          const combinedData = selectedData.reduce((acc, { data, sheetName }) => {
            return acc.concat(data.map(row => ({ ...row, 'Data Type': sheetName })))
          }, [])
          exportToExcel([{ data: combinedData, sheetName: 'Farm Data' }])
          toast.success('Combined Excel file exported successfully!')
        }
      } else {
        // Export as separate CSV files
        selectedData.forEach(({ data, filename }) => {
          exportToCSV(data, filename)
        })
        toast.success('CSV files exported successfully!')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleConfigChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setExportConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setExportConfig(prev => ({ ...prev, [field]: value }))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Export Farm Data
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Data Types Selection */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  Select Data Types
                </h3>
                <div className="space-y-2">
                  {Object.entries(exportConfig.dataTypes).map(([type, checked]) => (
                    <label key={type} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleConfigChange(`dataTypes.${type}`, e.target.checked)}
                        className="w-4 h-4 text-primary focus:ring-primary border-surface-300 rounded"
                      />
                      <span className="text-surface-700 dark:text-surface-300 capitalize">
                        {type} ({type === 'crops' ? crops.length : type === 'tasks' ? tasks.length : expenses.length} records)
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Format */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  Export Format
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      value="excel"
                      checked={exportConfig.format === 'excel'}
                      onChange={(e) => handleConfigChange('format', e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-surface-700 dark:text-surface-300">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportConfig.format === 'csv'}
                      onChange={(e) => handleConfigChange('format', e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-surface-700 dark:text-surface-300">CSV</span>
                  </label>
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  Date Range Filter (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exportConfig.dateRange.start}
                      onChange={(e) => handleConfigChange('dateRange.start', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exportConfig.dateRange.end}
                      onChange={(e) => handleConfigChange('dateRange.end', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                    />
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  Export Options
                </h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeHeaders}
                    onChange={(e) => handleConfigChange('includeHeaders', e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-surface-300 rounded"
                  />
                  <span className="text-surface-700 dark:text-surface-300">Include column headers</span>
                </label>
                {exportConfig.format === 'excel' && (
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportConfig.separateSheets}
                      onChange={(e) => handleConfigChange('separateSheets', e.target.checked)}
                      className="w-4 h-4 text-primary focus:ring-primary border-surface-300 rounded"
                    />
                    <span className="text-surface-700 dark:text-surface-300">Use separate sheets</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 border-t border-surface-200 dark:border-surface-700 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Download" className="h-5 w-5" />
                    Export Data
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DataExport