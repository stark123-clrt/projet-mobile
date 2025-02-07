import React from 'react';
import { Package, AlertTriangle, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';

const InventoryStats: React.FC = () => {
  const { darkMode } = useTheme();
  const stats = useStore((state) => state.getInventoryStats());
  const categories = useStore((state) => state.categories);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className={`${
          darkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
        } p-4 rounded-lg shadow border`}>
          <div className="flex items-center space-x-2 text-blue-500 mb-2">
            <Package size={20} />
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Total Produits
            </h3>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalProducts}
          </p>
        </div>
        
        <div className={`${
          darkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
        } p-4 rounded-lg shadow border`}>
          <div className="flex items-center space-x-2 text-green-500 mb-2">
            <BarChart2 size={20} />
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Stock Total
            </h3>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalStock}
          </p>
        </div>
      </div>
      
      {stats.lowStockProducts.length > 0 && (
        <div className={`${
          darkMode 
            ? 'bg-yellow-900/50 border-yellow-800' 
            : 'bg-yellow-50 border-yellow-200'
        } p-4 rounded-lg border`}>
          <div className={`flex items-center space-x-2 ${
            darkMode ? 'text-yellow-300' : 'text-yellow-600'
          } mb-3`}>
            <AlertTriangle size={20} />
            <h3 className="font-medium">Alertes de Stock</h3>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center">
                <span className={darkMode ? 'text-yellow-200' : 'text-yellow-700'}>
                  {product.name}
                </span>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-yellow-100' : 'text-yellow-800'
                }`}>
                  Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`${
        darkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-white border-gray-200'
      } p-4 rounded-lg shadow border`}>
        <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Produits par Catégorie
        </h3>
        <div className="space-y-2">
          {stats.productsByCategory.map((stat) => {
            const category = categories.find(c => c.id === stat.categoryId);
            return (
              <div key={stat.categoryId} className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {category?.name}
                </span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;