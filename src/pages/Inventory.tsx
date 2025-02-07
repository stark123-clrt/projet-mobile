import React, { useState } from 'react';
import { Plus, QrCode, Search, Filter, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';
import ProductForm from '../components/ProductForm';
import InventoryStats from '../components/InventoryStats';
import { useTheme } from '../context/ThemeContext';

const Inventory: React.FC = () => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const deleteProduct = useStore((state) => state.deleteProduct);
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const handleScan = async () => {
    try {
      // TODO: Implement actual barcode scanning
      const mockBarcode = Date.now().toString();
      setShowAddProduct(true);
    } catch (error) {
      console.error('Error scanning barcode:', error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(productId);
    }
  };
  
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Inventaire
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'text-gray-300 hover:text-gray-100 bg-gray-700 hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Filter size={24} />
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
      
      {showStats && (
        <div className="mb-6">
          <InventoryStats />
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 text-gray-900'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className={`absolute left-3 top-2.5 ${
            darkMode ? 'text-gray-400' : 'text-gray-400'
          }`} size={20} />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`w-full p-2 rounded-lg ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className={`${
              darkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            } p-4 rounded-lg shadow border`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {product.name}
                </h3>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {product.price.toFixed(2)} €
                </p>
                <p className={`text-sm ${
                  product.stock > (product.minStock || 5)
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                  Stock: {product.stock}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {categories.find(c => c.id === product.categoryId)?.name}
                </p>
              </div>
              <div className="flex space-x-2">
                {product.barcode && (
                  <button className={`p-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}>
                    <QrCode size={20} />
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showAddProduct && (
        <ProductForm onClose={() => setShowAddProduct(false)} />
      )}
    </div>
  );
};

export default Inventory;