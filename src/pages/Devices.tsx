import React, { useState, useEffect } from 'react';
import { Printer, CreditCard, Search, Battery, Signal, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';

const Devices: React.FC = () => {
  const { devices, updateDeviceConnection } = useStore();
  const { darkMode } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const checkConnections = setInterval(() => {
      devices.forEach(device => {
        if (device.connected && Math.random() < 0.01) {
          updateDeviceConnection(device.id, false);
          setNotifications(prev => [
            `${device.name} s'est déconnecté`,
            ...prev
          ]);
        }
      });
    }, 5000);

    return () => clearInterval(checkConnections);
  }, [devices, updateDeviceConnection]);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
  };

  const handleConnection = async (deviceId: string, connect: boolean) => {
    if (connect) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    updateDeviceConnection(deviceId, connect);
  };

  const handleTest = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device?.connected) {
      alert('L\'appareil n\'est pas connecté');
      return;
    }

    if (device.type === 'printer') {
      alert('Impression de test en cours...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Test d\'impression réussi !');
    } else if (device.type === 'payment') {
      alert('Test du terminal de paiement...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Terminal de paiement opérationnel !');
    }
  };

  const handleRename = (deviceId: string) => {
    if (!newDeviceName.trim()) return;
    
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      device.name = newDeviceName.trim();
      setShowRenameModal(null);
      setNewDeviceName('');
    }
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Périphériques
        </h1>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            isScanning 
              ? darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Search size={20} className={isScanning ? 'animate-spin' : ''} />
          <span>{isScanning ? 'Recherche...' : 'Rechercher'}</span>
        </button>
      </div>

      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`${
                darkMode 
                  ? 'bg-red-900/50 border-red-800 text-red-200' 
                  : 'bg-red-50 border-red-200 text-red-700'
              } px-4 py-3 rounded-lg flex justify-between items-center border`}
            >
              <span>{notification}</span>
              <button
                onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                className={darkMode ? 'text-red-300 hover:text-red-200' : 'text-red-500 hover:text-red-700'}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {devices.map((device) => (
          <div 
            key={device.id} 
            className={`${
              darkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            } p-4 rounded-lg shadow border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {device.type === 'printer' ? (
                  <Printer className={darkMode ? 'text-gray-300' : 'text-gray-600'} size={24} />
                ) : (
                  <CreditCard className={darkMode ? 'text-gray-300' : 'text-gray-600'} size={24} />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {device.name}
                    </h3>
                    {device.connected ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {device.connected && (
                      <>
                        <Battery className="text-green-500" size={16} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>98%</span>
                        <Signal className="text-green-500" size={16} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Excellent</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTest(device.id)}
                  disabled={!device.connected}
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    darkMode
                      ? 'bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500'
                      : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  Tester
                </button>
                <button
                  onClick={() => setShowRenameModal(device.id)}
                  className={`p-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={() => handleConnection(device.id, !device.connected)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    device.connected
                      ? darkMode 
                        ? 'bg-red-900/50 text-red-200 hover:bg-red-900'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                      : darkMode
                        ? 'bg-green-900/50 text-green-200 hover:bg-green-900'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {device.connected ? 'Déconnecter' : 'Connecter'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg w-full max-w-md p-4`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Renommer l'appareil
            </h2>
            <input
              type="text"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="Nouveau nom"
              className={`w-full p-2 rounded-lg mb-4 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border text-gray-900'
              }`}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRenameModal(null);
                  setNewDeviceName('');
                }}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={() => handleRename(showRenameModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Renommer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;