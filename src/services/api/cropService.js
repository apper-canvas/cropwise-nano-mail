import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class CropService {
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
      const tableName = 'crop'
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'variety', 'planting_date', 'status', 'area', 'expected_harvest_date', 'assigned_farm', 'harvest_date', 'yield_lbs']
      }

      const response = await this.apperClient.fetchRecords(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data?.map(crop => ({
        id: crop.Id,
        name: crop.Name || '',
        variety: crop.variety || '',
        plantingDate: crop.planting_date || '',
        status: crop.status || 'Planning',
        area: crop.area || 0,
        expectedHarvestDate: crop.expected_harvest_date || '',
        assignedFarm: crop.assigned_farm || '',
        harvestDate: crop.harvest_date || '',
        yield: crop.yield_lbs || 0,
        tags: crop.Tags || '',
        owner: crop.Owner || ''
      })) || []
    } catch (error) {
      console.error("Error fetching crops:", error)
      toast.error("Failed to load crops")
      return []
    }
  }

  async create(cropData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'crop'
      // Only include Updateable fields
      const params = {
        records: [{
          Name: cropData.name,
          Tags: cropData.tags || '',
          Owner: cropData.owner || null,
          variety: cropData.variety,
          planting_date: cropData.plantingDate,
          status: cropData.status || 'Planning',
          area: parseFloat(cropData.area),
          expected_harvest_date: cropData.expectedHarvestDate,
          assigned_farm: cropData.assignedFarm,
          harvest_date: cropData.harvestDate || null,
          yield_lbs: cropData.yield ? parseInt(cropData.yield) : 0
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
          toast.success('Crop created successfully!')
          return successfulRecords[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating crop:", error)
      toast.error("Failed to create crop")
      return null
    }
  }

  async update(id, cropData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'crop'
      const params = {
        records: [{
          Id: parseInt(id),
          Name: cropData.name,
          Tags: cropData.tags || '',
          Owner: cropData.owner || null,
          variety: cropData.variety,
          planting_date: cropData.plantingDate,
          status: cropData.status,
          area: parseFloat(cropData.area),
          expected_harvest_date: cropData.expectedHarvestDate,
          assigned_farm: cropData.assignedFarm,
          harvest_date: cropData.harvestDate || null,
          yield_lbs: cropData.yield ? parseInt(cropData.yield) : 0
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
          toast.success('Crop updated successfully!')
          return successfulUpdates[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating crop:", error)
      toast.error("Failed to update crop")
      return null
    }
  }

  async delete(recordIds) {
    await delay(300)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'crop'
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
          toast.success('Crop(s) deleted successfully!')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("Error deleting crop:", error)
      toast.error("Failed to delete crop")
      return false
    }
  }
}

export default new CropService()