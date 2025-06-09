import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TaskService {
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
      const tableName = 'task'
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'due_date', 'priority', 'completed', 'completion_date', 'description', 'location', 'assigned_to']
      }

      const response = await this.apperClient.fetchRecords(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data?.map(task => ({
        id: task.Id,
        title: task.title || task.Name || '',
        dueDate: task.due_date || '',
        priority: task.priority || 'Medium',
        completed: task.completed || false,
        completionDate: task.completion_date || '',
        description: task.description || '',
        location: task.location || '',
        assignedTo: task.assigned_to || '',
        tags: task.Tags || '',
        owner: task.Owner || ''
      })) || []
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks")
      return []
    }
  }

  async create(taskData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'task'
      const params = {
        records: [{
          Name: taskData.title,
          Tags: taskData.tags || '',
          Owner: taskData.owner || null,
          title: taskData.title,
          due_date: taskData.dueDate,
          priority: taskData.priority || 'Medium',
          completed: taskData.completed || false,
          completion_date: taskData.completionDate || null,
          description: taskData.description || '',
          location: taskData.location || '',
          assigned_to: taskData.assignedTo || ''
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
          toast.success('Task created successfully!')
          return successfulRecords[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
      return null
    }
  }

  async update(id, taskData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'task'
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.title,
          Tags: taskData.tags || '',
          Owner: taskData.owner || null,
          title: taskData.title,
          due_date: taskData.dueDate,
          priority: taskData.priority,
          completed: taskData.completed,
          completion_date: taskData.completionDate || null,
          description: taskData.description || '',
          location: taskData.location || '',
          assigned_to: taskData.assignedTo || ''
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
          toast.success('Task updated successfully!')
          return successfulUpdates[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
      return null
    }
  }

  async delete(recordIds) {
    await delay(300)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'task'
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
          toast.success('Task(s) deleted successfully!')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
      return false
    }
  }
}

export default new TaskService()