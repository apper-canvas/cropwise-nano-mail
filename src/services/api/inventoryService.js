// Mock delay function for realistic API simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock inventory data
const mockInventoryData = [
  {
    id: 1,
    name: "Organic Tomato Seeds",
    brand: "Burpee",
    category: "Seeds",
    quantity: 50,
    unitOfMeasure: "packet",
    unitPrice: 3.99,
    purchaseDate: "2024-01-15",
    supplier: "Garden Supply Co",
    location: "Seed Storage Room",
    description: "Heritage variety tomato seeds, organic certified"
  },
  {
    id: 2,
    name: "NPK Fertilizer 10-10-10",
    brand: "Miracle-Gro",
    category: "Fertilizer",
    quantity: 25,
    unitOfMeasure: "bag",
    unitPrice: 24.99,
    purchaseDate: "2024-02-10",
    supplier: "Farm & Garden Center",
    location: "Fertilizer Shed",
    description: "Balanced fertilizer for general crop nutrition"
  },
  {
    id: 3,
    name: "Irrigation Tubing",
    brand: "Rain Bird",
    category: "Equipment",
    quantity: 500,
    unitOfMeasure: "feet",
    unitPrice: 0.75,
    purchaseDate: "2024-01-25",
    supplier: "Irrigation Solutions",
    location: "Equipment Barn",
    description: "1/2 inch drip irrigation tubing"
  },
  {
    id: 4,
    name: "Organic Pest Control Spray",
    brand: "Neem Gold",
    category: "Pest Control",
    quantity: 12,
    unitOfMeasure: "bottle",
    unitPrice: 15.99,
    purchaseDate: "2024-03-05",
    supplier: "Organic Solutions Inc",
    location: "Chemical Storage",
    description: "Natural neem oil based pest control"
  },
  {
    id: 5,
    name: "Hand Pruning Shears",
    brand: "Fiskars",
    category: "Tools",
    quantity: 6,
    unitOfMeasure: "each",
    unitPrice: 18.99,
    purchaseDate: "2024-02-20",
    supplier: "Tool Depot",
    location: "Tool Shed",
    description: "Professional grade bypass pruning shears"
  },
  {
    id: 6,
    name: "Compost Accelerator",
    brand: "Dr. Earth",
    category: "Soil Amendment",
    quantity: 15,
    unitOfMeasure: "box",
    unitPrice: 12.99,
    purchaseDate: "2024-01-30",
    supplier: "Organic Farm Supply",
    location: "Compost Area",
    description: "Organic compost starter and accelerator"
  },
  {
    id: 7,
    name: "Mulch Film",
    brand: "Filmtech",
    category: "Field Supplies",
    quantity: 10,
    unitOfMeasure: "roll",
    unitPrice: 45.00,
    purchaseDate: "2024-02-15",
    supplier: "Agricultural Plastics",
    location: "Equipment Barn",
    description: "Black plastic mulch film, 4ft x 100ft"
  },
  {
    id: 8,
    name: "Greenhouse Thermometer",
    brand: "AcuRite",
    category: "Monitoring",
    quantity: 4,
    unitOfMeasure: "each",
    unitPrice: 25.99,
    purchaseDate: "2024-03-01",
    supplier: "Weather Instruments Co",
    location: "Greenhouse #1",
    description: "Digital min/max thermometer with humidity"
  },
  {
    id: 9,
    name: "Lettuce Seeds - Buttercrunch",
    brand: "Johnny's Seeds",
    category: "Seeds",
    quantity: 30,
    unitOfMeasure: "packet",
    unitPrice: 4.50,
    purchaseDate: "2024-02-05",
    supplier: "Johnny's Selected Seeds",
    location: "Seed Storage Room",
    description: "Premium butterhead lettuce variety"
  },
  {
    id: 10,
    name: "Calcium Chloride",
    brand: "Haifa",
    category: "Fertilizer",
    quantity: 5,
    unitOfMeasure: "bag",
    unitPrice: 32.99,
    purchaseDate: "2024-01-20",
    supplier: "Specialty Fertilizers Ltd",
    location: "Fertilizer Shed",
    description: "Foliar calcium supplement for plants"
  },
  {
    id: 11,
    name: "Harvest Crates",
    brand: "Macro Plastics",
    category: "Harvest Supplies",
    quantity: 20,
    unitOfMeasure: "each",
    unitPrice: 15.99,
    purchaseDate: "2024-02-25",
    supplier: "Harvest Equipment Co",
    location: "Packing Shed",
    description: "Ventilated plastic harvest crates, 20L capacity"
  },
  {
    id: 12,
    name: "pH Test Strips",
    brand: "Hanna Instruments",
    category: "Testing",
    quantity: 8,
    unitOfMeasure: "pack",
    unitPrice: 9.99,
    purchaseDate: "2024-03-10",
    supplier: "Lab Equipment Supply",
    location: "Testing Lab",
    description: "Soil pH test strips, range 4.0-9.0"
  },
  {
    id: 13,
    name: "Organic Potting Mix",
    brand: "Fox Farm",
    category: "Growing Media",
    quantity: 40,
    unitOfMeasure: "bag",
    unitPrice: 8.99,
    purchaseDate: "2024-01-10",
    supplier: "Growing Media Specialists",
    location: "Greenhouse #2",
    description: "Premium organic potting soil blend"
  },
  {
    id: 14,
    name: "Row Cover Fabric",
    brand: "Agribon",
    category: "Field Supplies",
    quantity: 3,
    unitOfMeasure: "roll",
    unitPrice: 89.99,
    purchaseDate: "2024-02-28",
    supplier: "Agricultural Fabrics Inc",
    location: "Equipment Barn",
    description: "Lightweight row cover, 10ft x 250ft"
  },
  {
    id: 15,
    name: "Drip Irrigation Emitters",
    brand: "Netafim",
    category: "Equipment",
    quantity: 100,
    unitOfMeasure: "each",
    unitPrice: 1.25,
    purchaseDate: "2024-03-15",
    supplier: "Irrigation Solutions",
    location: "Equipment Barn",
    description: "Pressure compensating drip emitters, 2 GPH"
  }
];

// Mock inventory service
const inventoryService = {
  async getAll(filters = {}) {
    await delay(300);
    
    let filteredData = [...mockInventoryData];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filteredData = filteredData.filter(item => item.category === filters.category);
    }
    
    // Apply unit filter
    if (filters.unit) {
      filteredData = filteredData.filter(item => item.unitOfMeasure === filters.unit);
    }
    
    // Apply date range filter
    if (filters.dateFrom) {
      filteredData = filteredData.filter(item => new Date(item.purchaseDate) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filteredData = filteredData.filter(item => new Date(item.purchaseDate) <= new Date(filters.dateTo));
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filteredData.sort((a, b) => {
        const aVal = a[filters.sortBy];
        const bVal = b[filters.sortBy];
        
        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }
    
    return filteredData;
  },

  async getById(id) {
    await delay(200);
    return mockInventoryData.find(item => item.id === parseInt(id));
  },

  async create(itemData) {
    await delay(400);
    const newItem = {
      id: Math.max(...mockInventoryData.map(item => item.id)) + 1,
      ...itemData
    };
    mockInventoryData.push(newItem);
    return newItem;
  },

  async update(id, itemData) {
    await delay(400);
    const index = mockInventoryData.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      mockInventoryData[index] = { ...mockInventoryData[index], ...itemData };
      return mockInventoryData[index];
    }
    throw new Error('Item not found');
  },

  async delete(id) {
    await delay(300);
    const index = mockInventoryData.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      const deletedItem = mockInventoryData.splice(index, 1)[0];
      return deletedItem;
    }
    throw new Error('Item not found');
  }
};

export default inventoryService;