import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from './ApperIcon';

const InventoryForm = ({ isOpen, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    quantity: '',
    unitOfMeasure: '',
    unitPrice: '',
    purchaseDate: '',
    supplier: '',
    location: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');

  // Common brands for autocomplete
  const commonBrands = [
    'Burpee', 'Johnny\'s Seeds', 'Miracle-Gro', 'Rain Bird', 'Fiskars',
    'Dr. Earth', 'Neem Gold', 'AcuRite', 'Haifa', 'Macro Plastics',
    'Hanna Instruments', 'Fox Farm', 'Agribon', 'Netafim', 'Filmtech'
  ];

  // Common categories
  const categories = [
    'Seeds', 'Fertilizer', 'Equipment', 'Pest Control', 'Tools',
    'Soil Amendment', 'Field Supplies', 'Monitoring', 'Harvest Supplies',
    'Testing', 'Growing Media'
  ];

  // Common units of measure
  const units = [
    'each', 'box', 'bag', 'packet', 'bottle', 'roll', 'pack', 'feet',
    'kg', 'liter', 'gallon', 'pound', 'ounce', 'ton', 'yard'
  ];

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        brand: editingItem.brand || '',
        category: editingItem.category || '',
        quantity: editingItem.quantity?.toString() || '',
        unitOfMeasure: editingItem.unitOfMeasure || '',
        unitPrice: editingItem.unitPrice?.toString() || '',
        purchaseDate: editingItem.purchaseDate || '',
        supplier: editingItem.supplier || '',
        location: editingItem.location || '',
        description: editingItem.description || ''
      });
      
      // Check if unit is custom
      if (editingItem.unitOfMeasure && !units.includes(editingItem.unitOfMeasure)) {
        setShowCustomUnit(true);
        setCustomUnit(editingItem.unitOfMeasure);
        setFormData(prev => ({ ...prev, unitOfMeasure: 'custom' }));
      }
    } else {
      // Reset form for new item
      setFormData({
        name: '',
        brand: '',
        category: '',
        quantity: '',
        unitOfMeasure: '',
        unitPrice: '',
        purchaseDate: new Date().toISOString().split('T')[0], // Default to today
        supplier: '',
        location: '',
        description: ''
      });
      setShowCustomUnit(false);
      setCustomUnit('');
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.unitOfMeasure) {
      newErrors.unitOfMeasure = 'Unit of measure is required';
    }

    if (formData.unitOfMeasure === 'custom' && !customUnit.trim()) {
      newErrors.customUnit = 'Custom unit is required';
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    } else {
      const purchaseDate = new Date(formData.purchaseDate);
      const today = new Date();
      if (purchaseDate > today) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future';
      }
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        unitOfMeasure: formData.unitOfMeasure === 'custom' ? customUnit : formData.unitOfMeasure
      };

      if (editingItem) {
        await onSubmit(editingItem.id, submitData);
      } else {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle unit selection
    if (field === 'unitOfMeasure') {
      setShowCustomUnit(value === 'custom');
      if (value !== 'custom') {
        setCustomUnit('');
      }
    }
  };

  if (!isOpen) return null;

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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                    errors.name ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                  }`}
                  placeholder="Enter item name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Brand with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Brand / Manufacturer *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  list="brands"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                    errors.brand ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                  }`}
                  placeholder="Enter or select brand"
                />
                <datalist id="brands">
                  {commonBrands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              {/* Category and Quantity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                      errors.category ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                      errors.quantity ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                    }`}
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>
              </div>

              {/* Unit of Measure */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Unit of Measure *
                </label>
                <select
                  value={formData.unitOfMeasure}
                  onChange={(e) => handleChange('unitOfMeasure', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                    errors.unitOfMeasure ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                  }`}
                >
                  <option value="">Select unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                  <option value="custom">Custom unit...</option>
                </select>
                {errors.unitOfMeasure && <p className="text-red-500 text-sm mt-1">{errors.unitOfMeasure}</p>}

                {/* Custom Unit Input */}
                {showCustomUnit && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                        errors.customUnit ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                      }`}
                      placeholder="Enter custom unit"
                    />
                    {errors.customUnit && <p className="text-red-500 text-sm mt-1">{errors.customUnit}</p>}
                  </div>
                )}
              </div>

              {/* Unit Price and Purchase Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Unit Price ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleChange('unitPrice', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                      errors.unitPrice ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.unitPrice && <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                      errors.purchaseDate ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                    }`}
                  />
                  {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
                </div>
              </div>

              {/* Supplier and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                      errors.supplier ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                    }`}
                    placeholder="Enter supplier name"
                  />
                  {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Storage Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100 ${
                      errors.location ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                    }`}
                    placeholder="Enter storage location"
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-800 dark:text-surface-100"
                  placeholder="Enter item description (optional)"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {editingItem ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <ApperIcon name={editingItem ? "Save" : "Plus"} className="h-5 w-5" />
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InventoryForm;