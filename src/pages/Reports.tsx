import React, { useState } from 'react';
import { Calendar, TrendingUp, Package } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const { darkMode } = useTheme();
  
  return (
    <div className="pb-20">
      <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Rapports</h1>
      
      <div className="flex space-x-2 mb-6">
        {['day', 'week', 'month'].map((p) => (
          <button
            key={p}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === p 
                ? 'bg-blue-600 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setPeriod(p as 'day' | 'week' | 'month')}
          >
            {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
          </button>
        ))}
      </div>
      
      <div className="space-y-6">
        <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-4 rounded-lg shadow border`}>
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="text-blue-500" size={24} />
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Ventes Totales
            </h2>
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            2,450.00 €
          </p>
          <p className="text-sm text-green-500">+15% vs période précédente</p>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-4 rounded-lg shadow border`}>
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="text-green-500" size={24} />
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Transactions
            </h2>
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            127
          </p>
          <p className="text-sm text-green-500">+8% vs période précédente</p>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-4 rounded-lg shadow border`}>
          <div className="flex items-center space-x-3 mb-4">
            <Package className="text-orange-500" size={24} />
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Produits Populaires
            </h2>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Produit A', sales: 45 },
              { name: 'Produit B', sales: 32 },
              { name: 'Produit C', sales: 28 }
            ].map((product) => (
              <div key={product.name} className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {product.name}
                </span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.sales} ventes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;