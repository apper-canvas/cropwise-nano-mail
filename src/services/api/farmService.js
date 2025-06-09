import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class FarmService {
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
      const tableName = 'farm'
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'location', 'size', 'type', 'established']
      }

      const response = await this.apperClient.fetchRecords(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data?.map(farm => ({
        id: farm.Id,
        name: farm.Name || '',
        location: farm.location || '',
        size: farm.size || 0,
        type: farm.type || '',
        established: farm.established || '',
        tags: farm.Tags || '',
        owner: farm.Owner || '',
        createdOn: farm.CreatedOn,
        createdBy: farm.CreatedBy,
        modifiedOn: farm.ModifiedOn,
        modifiedBy: farm.ModifiedBy
      })) || []
    } catch (error) {
      console.error("Error fetching farms:", error)
      toast.error("Failed to load farms")
      return []
    }
  }

  async getById(id) {
    await delay(200)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'farm'
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'location', 'size', 'type', 'established']
      }

      const response = await this.apperClient.getRecordById(tableName, id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      const farm = response.data
      return {
        id: farm.Id,
        name: farm.Name || '',
        location: farm.location || '',
        size: farm.size || 0,
        type: farm.type || '',
        established: farm.established || '',
        tags: farm.Tags || '',
        owner: farm.Owner || ''
      }
    } catch (error) {
      console.error(`Error fetching farm with ID ${id}:`, error)
      toast.error("Failed to load farm")
      return null
    }
  }

  async create(farmData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'farm'
      // Only include Updateable fields
      const params = {
        records: [{
          Name: farmData.name,
          Tags: farmData.tags || '',
          Owner: farmData.owner || null,
          location: farmData.location,
          size: parseFloat(farmData.size),
          type: farmData.type,
          established: farmData.established
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
          toast.success('Farm created successfully!')
          return successfulRecords[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating farm:", error)
      toast.error("Failed to create farm")
      return null
    }
  }

  async update(id, farmData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'farm'
      // Only include Updateable fields plus ID
      const params = {
        records: [{
          Id: parseInt(id),
          Name: farmData.name,
          Tags: farmData.tags || '',
          Owner: farmData.owner || null,
          location: farmData.location,
          size: parseFloat(farmData.size),
          type: farmData.type,
          established: farmData.established
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
          toast.success('Farm updated successfully!')
          return successfulUpdates[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating farm:", error)
      toast.error("Failed to update farm")
      return null
    }
  }

  async delete(recordIds) {
    await delay(300)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'farm'
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
          toast.success('Farm(s) deleted successfully!')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("Error deleting farm:", error)
      toast.error("Failed to delete farm")
      return false
    }
  }
}

export default new FarmService()