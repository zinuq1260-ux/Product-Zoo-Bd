import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export const Inventory: React.FC = () => {
  const { products, updateProduct } = useProducts();

  const handleStockUpdate = (id: string, newStock: string) => {
    const stock = Number(newStock);
    if (!isNaN(stock)) {
      updateProduct(id, { stock });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Inventory Management</h2>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No products found in inventory.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Update Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((item) => {
                if (!item) return null;
                const stock = Number(item.stock) || 0;

                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name || 'Unknown Product'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock} units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {stock > 20 ? (
                        <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> In Stock</span>
                      ) : stock > 0 ? (
                        <span className="flex items-center text-yellow-600"><AlertTriangle className="h-4 w-4 mr-1" /> Low Stock</span>
                      ) : (
                        <span className="flex items-center text-red-600"><AlertTriangle className="h-4 w-4 mr-1" /> Out of Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <input 
                          type="number" 
                          defaultValue={stock} 
                          onBlur={(e) => handleStockUpdate(item.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" 
                        />
                        <button className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100">Update</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
