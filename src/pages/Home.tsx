import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ShoppingCart, Smartphone, BarChart2, QrCode, Plus, 
  AlertTriangle, Printer, CreditCard, TrendingUp, Target, Bell,
  AlertCircle, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';
import ProductForm from '../components/ProductForm';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'success';
    message: string;
  }>>([]);
  
  const { 
    products, 
    devices, 
    getSales,
    getInventoryStats
  } = useStore();

  // Mémoriser les statistiques pour éviter les recalculs inutiles
  const { todaySales, totalSalesAmount, stats } = useMemo(() => {
    const today = getSales({
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date()
    });
    return {
      todaySales: today,
      totalSalesAmount: today.reduce((sum, sale) => sum + sale.total, 0),
      stats: getInventoryStats()
    };
  }, [getSales, getInventoryStats]);
  
  // Objectif journalier (exemple: 1000€)
  const dailyGoal = 1000;
  const progressPercentage = Math.min((totalSalesAmount / dailyGoal) * 100, 100);

  // Mémoriser les notifications pour éviter les mises à jour en boucle
  useEffect(() => {
    const deviceNotifications = devices
      .filter(device => !device.connected)
      .map(device => ({
        id: `device-${device.id}`,
        type: 'warning' as const,
        message: `${device.name} n'est pas connecté`
      }));

    const stockNotifications = stats.lowStockProducts
      .map(product => ({
        id: `stock-${product.id}`,
        type: 'warning' as const,
        message: `Stock faible : ${product.name} (${product.stock} restants)`
      }));

    setNotifications([...deviceNotifications, ...stockNotifications]);
  }, [devices, stats.lowStockProducts]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <div className="pt-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Point de Vente
        </h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Résumé des activités */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-4 rounded-lg border`}>
          <div className="flex items-center space-x-2 text-green-500 mb-2">
            <TrendingUp size={20} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Ventes du jour
            </span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalSalesAmount.toFixed(2)} €
          </p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Objectif: {dailyGoal.toFixed(2)} €
          </p>
        </div>

        <div className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-4 rounded-lg border`}>
          <div className="flex items-center space-x-2 text-blue-500 mb-2">
            <Package size={20} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              État du stock
            </span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.lowStockProducts.length}
          </p>
          <p className="text-sm text-gray-500">
            produits en alerte
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${
                notification.type === 'warning'
                  ? darkMode 
                    ? 'bg-yellow-900/50 border-yellow-800 text-yellow-200' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : notification.type === 'error'
                  ? darkMode
                    ? 'bg-red-900/50 border-red-800 text-red-200'
                    : 'bg-red-50 border-red-200 text-red-800'
                  : darkMode
                    ? 'bg-green-900/50 border-green-800 text-green-200'
                    : 'bg-green-50 border-green-200 text-green-800'
              } px-4 py-3 rounded-lg flex justify-between items-center border`}
            >
              <div className="flex items-center space-x-2">
                {notification.type === 'warning' && <AlertTriangle size={20} />}
                {notification.type === 'error' && <AlertCircle size={20} />}
                {notification.type === 'success' && <CheckCircle2 size={20} />}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-current hover:opacity-75"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Accès rapides */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => navigate('/sale')}
          className={`${
            darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
          } p-6 rounded-lg text-white flex flex-col items-center justify-center space-y-2`}
        >
          <ShoppingCart size={32} className="animate-bounce" />
          <span className="font-medium">Nouvelle vente</span>
        </button>

        <button
          onClick={() => navigate('/inventory')}
          className={`${
            darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } p-6 rounded-lg text-white flex flex-col items-center justify-center space-y-2`}
        >
          <QrCode size={32} className="animate-pulse" />
          <span className="font-medium">Scanner un produit</span>
        </button>
      </div>

      {/* État des périphériques */}
      <div className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } p-4 rounded-lg border mb-6`}>
        <h2 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Périphériques
        </h2>
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {device.type === 'printer' ? (
                  <Printer size={20} className={device.connected ? 'text-green-500' : 'text-red-500'} />
                ) : (
                  <CreditCard size={20} className={device.connected ? 'text-green-500' : 'text-red-500'} />
                )}
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {device.name}
                </span>
              </div>
              <span className={`text-sm ${
                device.connected 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {device.connected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dernières ventes */}
      <div className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } p-4 rounded-lg border`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Dernières ventes
          </h2>
          <button
            onClick={() => navigate('/reports')}
            className={`text-sm flex items-center space-x-1 ${
              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <span>Voir tout</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {todaySales.slice(0, 3).map((sale) => (
            <div key={sale.id} className="flex justify-between items-center">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {sale.total.toFixed(2)} €
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(sale.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                sale.paymentMethod === 'cash'
                  ? darkMode
                    ? 'bg-green-900/50 text-green-200'
                    : 'bg-green-100 text-green-800'
                  : sale.paymentMethod === 'card'
                  ? darkMode
                    ? 'bg-blue-900/50 text-blue-200'
                    : 'bg-blue-100 text-blue-800'
                  : darkMode
                    ? 'bg-purple-900/50 text-purple-200'
                    : 'bg-purple-100 text-purple-800'
              }`}>
                {sale.paymentMethod === 'cash' ? 'Espèces' :
                 sale.paymentMethod === 'card' ? 'Carte' : 'Sans contact'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showAddProduct && (
        <ProductForm onClose={() => setShowAddProduct(false)} />
      )}
    </div>
  );
};

export default Home;