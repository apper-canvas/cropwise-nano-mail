import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class CropHistoryService {
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
      const tableName = 'crop_history'
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'farm_name', 'crop_name', 'variety', 'planting_date', 'harvest_date', 'area', 'yield_amount', 'yield_unit', 'season', 'status', 'notes', 'pest_issues', 'fertilizer_used', 'irrigation_method', 'soil_condition', 'weather_conditions', 'farm_id']
      }

      const response = await this.apperClient.fetchRecords(tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data?.map(cropHistory => ({
        id: cropHistory.Id,
        farmId: cropHistory.farm_id || null,
        farmName: cropHistory.farm_name || '',
        cropName: cropHistory.crop_name || cropHistory.Name || '',
        variety: cropHistory.variety || '',
        plantingDate: cropHistory.planting_date || '',
        harvestDate: cropHistory.harvest_date || '',
        area: cropHistory.area || 0,
        yieldAmount: cropHistory.yield_amount || 0,
        yieldUnit: cropHistory.yield_unit || 'lbs',
        season: cropHistory.season || '',
        status: cropHistory.status || '',
        notes: cropHistory.notes || '',
        pestIssues: cropHistory.pest_issues || '',
        fertilizerUsed: cropHistory.fertilizer_used || '',
        irrigationMethod: cropHistory.irrigation_method || '',
        soilCondition: cropHistory.soil_condition || '',
        weatherConditions: cropHistory.weather_conditions || '',
        tags: cropHistory.Tags || '',
        owner: cropHistory.Owner || ''
      })) || []
    } catch (error) {
      console.error("Error fetching crop history:", error)
      toast.error("Failed to load crop history")
      return []
    }
  }

  async create(cropHistoryData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'crop_history'
      const params = {
        records: [{
          Name: cropHistoryData.cropName,
          Tags: cropHistoryData.tags || '',
          Owner: cropHistoryData.owner || null,
          farm_name: cropHistoryData.farmName,
          crop_name: cropHistoryData.cropName,
          variety: cropHistoryData.variety || '',
          planting_date: cropHistoryData.plantingDate,
          harvest_date: cropHistoryData.harvestDate || null,
          area: parseFloat(cropHistoryData.area),
          yield_amount: cropHistoryData.yieldAmount ? parseInt(cropHistoryData.yieldAmount) : 0,
          yield_unit: cropHistoryData.yieldUnit || 'lbs',
          season: cropHistoryData.season || '',
          status: cropHistoryData.status || 'Harvested',
          notes: cropHistoryData.notes || '',
          pest_issues: cropHistoryData.pestIssues || '',
          fertilizer_used: cropHistoryData.fertilizerUsed || '',
          irrigation_method: cropHistoryData.irrigationMethod || '',
          soil_condition: cropHistoryData.soilCondition || '',
          weather_conditions: cropHistoryData.weatherConditions || '',
          farm_id: cropHistoryData.farmId ? parseInt(cropHistoryData.farmId) : null
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
          toast.success('Crop history created successfully!')
          return successfulRecords[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating crop history:", error)
      toast.error("Failed to create crop history")
      return null
    }
  }

  async update(id, cropHistoryData) {
    await delay(400)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'crop_history'
      const params = {
        records: [{
          Id: parseInt(id),
          Name: cropHistoryData.cropName,
          Tags: cropHistoryData.tags || '',
          Owner: cropHistoryData.owner || null,
          farm_name: cropHistoryData.farmName,
          crop_name: cropHistoryData.cropName,
          variety: cropHistoryData.variety || '',
          planting_date: cropHistoryData.plantingDate,
          harvest_date: cropHistoryData.harvestDate || null,
          area: parseFloat(cropHistoryData.area),
          yield_amount: cropHistoryData.yieldAmount ? parseInt(cropHistoryData.yieldAmount) : 0,
          yield_unit: cropHistoryData.yieldUnit || 'lbs',
          season: cropHistoryData.season || '',
          status: cropHistoryData.status,
          notes: cropHistoryData.notes || '',
          pest_issues: cropHistoryData.pestIssues || '',
          fertilizer_used: cropHistoryData.fertilizerUsed || '',
          irrigation_method: cropHistoryData.irrigationMethod || '',
          soil_condition: cropHistoryData.soilCondition || '',
          weather_conditions: cropHistoryData.weatherConditions || '',
          farm_id: cropHistoryData.farmId ? parseInt(cropHistoryData.farmId) : null
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
          toast.success('Crop history updated successfully!')
          return successfulUpdates[0].data
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating crop history:", error)
      toast.error("Failed to update crop history")
      return null
    }
  }

  async delete(recordIds) {
    await delay(300)
    
    if (!this.apperClient) {
      this.initializeClient()
    }

    try {
      const tableName = 'crop_history'
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
          toast.success('Crop history deleted successfully!')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error("Error deleting crop history:", error)
      toast.error("Failed to delete crop history")
      return false
    }
  }
}

export default new CropHistoryService()