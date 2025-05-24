import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const ExpenseReport = ({ expenses = [], onExport }) => {
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)

  // Calculate date ranges
  const getDateRange = (period) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case 'week':
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start: weekStart, end: today }
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return { start: monthStart, end: today }
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        return { start: quarterStart, end: today }
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        return { start: yearStart, end: today }
      case 'custom':
        return {
          start: customDateRange.start ? new Date(customDateRange.start) : new Date(0),
          end: customDateRange.end ? new Date(customDateRange.end) : new Date()
        }
      default:
        return { start: new Date(0), end: new Date() }
    }
  }

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    const { start, end } = getDateRange(filterPeriod)
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        const matchesDate = expenseDate >= start && expenseDate <= end
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMinAmount = !minAmount || expense.amount >= parseFloat(minAmount)
        const matchesMaxAmount = !maxAmount || expense.amount <= parseFloat(maxAmount)
        
        return matchesDate && matchesCategory && matchesSearch && matchesMinAmount && matchesMaxAmount
      })
      .sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case 'amount':
            comparison = a.amount - b.amount
            break
          case 'category':
            comparison = a.category.localeCompare(b.category)
            break
          case 'description':
            comparison = a.description.localeCompare(b.description)
            break
          default: // date
            comparison = new Date(a.date) - new Date(b.date)
        }
        return sortOrder === 'asc' ? comparison : -comparison
      })
  }, [expenses, filterPeriod, filterCategory, searchTerm, sortBy, sortOrder, minAmount, maxAmount, customDateRange])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const average = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})
    
    const monthlyTotals = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    }, {})

    return {
      total,
      average,
      count: filteredExpenses.length,
      categoryTotals,
      monthlyTotals,
      topCategory: Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0] || ['N/A', 0],
      averagePerDay: total / Math.max(1, Object.keys(monthlyTotals).length * 30)
    }
  }, [filteredExpenses])

  const categories = [...new Set(expenses.map(expense => expense.category))]

  const exportReport = () => {
    const reportData = {
      summary,
      filteredExpenses,
      filters: {
        period: filterPeriod,
        category: filterCategory,
        search: searchTerm,
        dateRange: customDateRange
      },
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Expense report exported successfully!')
  }

  const resetFilters = () => {
    setFilterPeriod('all')
    setFilterCategory('all')
    setSearchTerm('')
    setMinAmount('')
    setMaxAmount('')
    setCustomDateRange({ start: '', end: '' })
    setSortBy('date')
    setSortOrder('desc')
    toast.info('Filters reset to default')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Expense Report
          </h2>
          <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">
            Comprehensive financial analysis and insights
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 px-4 py-2 rounded-xl transition-colors duration-300"
          >
            <ApperIcon name="Filter" className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl transition-colors duration-300"
          >
            <ApperIcon name="Download" className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                ${summary.total.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">Average Expense</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                ${summary.average.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {summary.count}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ApperIcon name="FileText" className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">Top Category</p>
              <p className="text-lg font-bold text-surface-900 dark:text-surface-100">
                {summary.topCategory[0]}
              </p>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                ${summary.topCategory[1].toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ApperIcon name="Tag" className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                Filters & Search
              </h3>
              <button
                onClick={resetFilters}
                className="text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 text-sm"
              >
                Reset All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                />
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Period
                </label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field)
                    setSortOrder(order)
                  }}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="amount-desc">Amount (Highest)</option>
                  <option value="amount-asc">Amount (Lowest)</option>
                  <option value="category-asc">Category (A-Z)</option>
                  <option value="description-asc">Description (A-Z)</option>
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Min Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Max Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="999999.99"
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                />
              </div>
            </div>

            {/* Custom Date Range */}
            {filterPeriod === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
        >
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Expenses by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / summary.total) * 100
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-700 dark:text-surface-300">{category}</span>
                      <span className="font-medium text-surface-900 dark:text-surface-100">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-primary h-2 rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-card"
        >
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Monthly Trends
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.monthlyTotals)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .slice(-6) // Show last 6 months
              .map(([month, amount]) => {
                const maxAmount = Math.max(...Object.values(summary.monthlyTotals))
                const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-700 dark:text-surface-300">{month}</span>
                      <span className="font-medium text-surface-900 dark:text-surface-100">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-secondary h-2 rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </motion.div>
      </div>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden"
      >
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Expense Details ({filteredExpenses.length} items)
            </h3>
            <p className="text-surface-600 dark:text-surface-400 text-sm">
              Total: ${summary.total.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center">
              <ApperIcon name="FileX" className="h-12 w-12 text-surface-400 mx-auto mb-3" />
              <p className="text-surface-600 dark:text-surface-400">No expenses found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-surface-900 dark:text-surface-100">
                        {expense.description}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded text-xs font-medium">
                          {expense.category}
                        </span>
                        <span className="text-surface-600 dark:text-surface-400 text-sm">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-surface-900 dark:text-surface-100">
                        ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ExpenseReport