import React, { useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, Upload, X } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'Electronics',
    stock: 0,
    image_url: '',
    additional_images: [] as string[],
    delivery_info: '',
    warranty_info: '',
    return_policy: '',
    isFeatured: false,
    isTrending: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      ...initialFormState,
      ...product
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'price' || name === 'discount' || name === 'stock' ? Number(value) : value)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          additional_images: [...(prev.additional_images || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone and it will be removed from the store immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Products</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required rows={3} name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label>
              <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input required type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500">
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Information</label>
              <input type="text" name="delivery_info" value={formData.delivery_info || ''} onChange={handleChange} placeholder="e.g., Free delivery on orders over ৳5000" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Information</label>
              <input type="text" name="warranty_info" value={formData.warranty_info || ''} onChange={handleChange} placeholder="e.g., 1 Year Warranty included" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label>
              <input type="text" name="return_policy" value={formData.return_policy || ''} onChange={handleChange} placeholder="e.g., 30 Day Return Policy" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input 
                type="checkbox" 
                id="isFeatured" 
                name="isFeatured" 
                checked={formData.isFeatured} 
                onChange={handleChange} 
                className="h-4 w-4 text-slate-900 focus:ring-slate-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured Product (Show in Slider)</label>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input 
                type="checkbox" 
                id="isTrending" 
                name="isTrending" 
                checked={formData.isTrending} 
                onChange={handleChange} 
                className="h-4 w-4 text-slate-900 focus:ring-slate-500 border-gray-300 rounded"
              />
              <label htmlFor="isTrending" className="text-sm font-medium text-gray-700">Trending Product</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Product Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-slate-400 transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  {formData.image_url ? (
                    <div className="flex flex-col items-center">
                      <img src={formData.image_url} alt="Preview" className="h-40 object-cover rounded-md mb-3 shadow-sm" />
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-3 py-1 border border-gray-200">
                        <span>Change Main Image</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                      </label>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center mt-2">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2">
                          <span>Upload main image</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} required={!editingId} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images (Optional)</label>
              <div className="mt-1 p-4 border-2 border-gray-300 border-dashed rounded-md hover:border-slate-400 transition-colors bg-gray-50">
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.additional_images?.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Additional ${index + 1}`} className="h-24 w-24 object-cover rounded-md shadow-sm border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label className="h-24 w-24 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add More</span>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={handleMultipleImageUpload} />
                  </label>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium transition-colors"
              >
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mb-3" />
            <p>No products found. Add a new product to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  if (!product) return null;
                  const price = Number(product.price) || 0;
                  const stock = Number(product.stock) || 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={product.image_url || 'https://picsum.photos/seed/product/100/100'} alt={product.name || 'Product'} className="h-12 w-12 rounded-md object-cover border border-gray-200" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name || 'Unknown Product'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || 'Uncategorized'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">৳{price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stock > 10 ? 'bg-green-100 text-green-800' : stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.isFeatured ? (
                          <span className="text-emerald-600 font-bold text-xs uppercase">Yes</span>
                        ) : (
                          <span className="text-gray-300 text-xs uppercase">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"><Edit className="h-4 w-4 inline mr-1" />Edit</button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 transition-colors"><Trash2 className="h-4 w-4 inline mr-1" />Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
