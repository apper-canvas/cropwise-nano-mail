import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ExpenseService {
  constructor() {
    this.apperClient = null
    this.initializeClient()
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
    }
  }

  async getAll() {
    await delay(300)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'expense'
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'description', 'amount', 'category', 'date', 'payment_method', 'vendor', 'receipt_number']
      }

      const response = await this.apperClient.fetchRecords(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data?.map(expense => ({
        id: expense.Id,
        description: expense.description || expense.Name || '',
        amount: expense.amount || 0,
        category: expense.category || '',
        date: expense.date || '',
        paymentMethod: expense.payment_method || '',
        vendor: expense.vendor || '',
        receiptNumber: expense.receipt_number || '',
        tags: expense.Tags || '',
        owner: expense.Owner || ''
      })) || []
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast.error("Failed to load expenses")
      return []
    }
  }

  async create(expenseData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'expense'
      const params = {
        records: [{
          Name: expenseData.description,
          Tags: expenseData.tags || '',
          Owner: expenseData.owner || null,
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          date: expenseData.date,
          payment_method: expenseData.paymentMethod || '',
          vendor: expenseData.vendor || '',
          receipt_number: expenseData.receiptNumber || ''
        }]
      }

      const response = await this.apperClient.createRecord(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:`, failedRecords)
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Expense created successfully!')
          return successfulRecords[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating expense:", error)
      toast.error("Failed to create expense")
      return null
    }
  }

  async update(id, expenseData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'expense'
      const params = {
        records: [{
          Id: parseInt(id),
          Name: expenseData.description,
          Tags: expenseData.tags || '',
          Owner: expenseData.owner || null,
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          date: expenseData.date,
          payment_method: expenseData.paymentMethod || '',
          vendor: expenseData.vendor || '',
          receipt_number: expenseData.receiptNumber || ''
        }]
      }

      const response = await this.apperClient.updateRecord(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:`, failedUpdates)
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Expense updated successfully!')
          return successfulUpdates[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating expense:", error)
      toast.error("Failed to update expense")
      return null
    }
  }

  async delete(recordIds) {
    await delay(300)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'expense'
      const params = {
        RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
      }

      const response = await this.apperClient.deleteRecord(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:`, failedDeletions)
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Expense(s) deleted successfully!')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast.error("Failed to delete expense")
      return false
    }
  }
}

export default new ExpenseService()