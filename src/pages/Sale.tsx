import React, { useState, useRef } from 'react';
import { QrCode, Trash2, CreditCard, Wallet, Contact as ContactlessPayment, History, Plus, Minus, Printer, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PaymentMethod, SaleFilters } from '../types';
import { useTheme } from '../context/ThemeContext';

const Sale: React.FC = () => {
  const { darkMode } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [historyFilters, setHistoryFilters] = useState<SaleFilters>({});
  
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartItemQuantity,
    products,
    completeSale,
    getSales,
    updateSalePrintStatus,
    devices
  } = useStore();
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = cashReceived ? parseFloat(cashReceived) - total : 0;
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );
  
  const handleCompleteSale = async () => {
    if (!selectedPaymentMethod) return;
    
    if (selectedPaymentMethod === 'card') {
      const paymentTerminal = devices.find(d => d.id === 'payment');
      if (!paymentTerminal?.connected) {
        alert('Le terminal de paiement n\'est pas connecté');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    completeSale(
      selectedPaymentMethod,
      selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) : undefined
    );
    
    setShowPaymentModal(false);
    setCashReceived('');
    setSelectedPaymentMethod(null);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (showHistory) {
    const sales = getSales(historyFilters);
    
    return (
      <div className="pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Historique des Ventes
          </h1>
          <button
            onClick={() => setShowHistory(false)}
            className={`text-blue-500 hover:text-blue-600`}
          >
            Retour
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Date début
              </label>
              <input
                type="date"
                onChange={(e) => setHistoryFilters(prev => ({ 
                  ...prev, 
                  startDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className={`w-full p-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Date fin
              </label>
              <input
                type="date"
                onChange={(e) => setHistoryFilters(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className={`w-full p-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Montant min
              </label>
              <input
                type="number"
                step="0.01"
                onChange={(e) => setHistoryFilters(prev => ({ 
                  ...prev, 
                  minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className={`w-full p-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Montant max
              </label>
              <input
                type="number"
                step="0.01"
                onChange={(e) => setHistoryFilters(prev => ({ 
                  ...prev, 
                  maxAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className={`w-full p-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Mode de paiement
            </label>
            <select
              onChange={(e) => setHistoryFilters(prev => ({ 
                ...prev, 
                paymentMethod: e.target.value as PaymentMethod | undefined 
              }))}
              className={`w-full p-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Tous les paiements</option>
              <option value="cash">Espèces</option>
              <option value="card">Carte</option>
              <option value="nfc">Sans contact</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {sales.map((sale) => (
            <div 
              key={sale.id} 
              className={`${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              } p-4 rounded-lg shadow border`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(sale.createdAt)}
                  </p>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sale.total.toFixed(2)} €
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {sale.paymentMethod === 'cash' ? 'Espèces' :
                     sale.paymentMethod === 'card' ? 'Carte' : 'Sans contact'}
                  </p>
                  {sale.cashReceived && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Reçu : {sale.cashReceived.toFixed(2)} € 
                      (Rendu : {sale.cashChange?.toFixed(2)} €)
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    const printer = devices.find(d => d.id === 'printer');
                    if (!printer?.connected) {
                      alert('L\'imprimante n\'est pas connectée');
                      return;
                    }
                    updateSalePrintStatus(sale.id, true);
                  }}
                  className={`p-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={sale.printed ? 'Réimprimer' : 'Imprimer'}
                >
                  <Printer size={20} />
                </button>
              </div>
              <div className="space-y-1">
                {sale.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex justify-between`}
                  >
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Vente</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowHistory(true)}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Historique"
          >
            <History size={24} />
          </button>
          <button
            onClick={() => setShowProductSearch(true)}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Rechercher un produit"
          >
            <Search size={24} />
          </button>
          <button 
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
            onClick={() => setShowProductSearch(true)}
            title="Scanner un code-barres"
          >
            <QrCode size={24} />
          </button>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div 
            key={item.id} 
            className={`${
              darkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            } p-4 rounded-lg shadow border`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {item.name}
                </h3>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {item.price.toFixed(2)} €
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    className={`p-1 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Minus size={20} />
                  </button>
                  <span className={`w-8 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    className={`p-1 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button 
                  className="p-2 text-red-400 hover:text-red-300"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`fixed bottom-16 left-0 right-0 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-t p-4`}>
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Total
            </span>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {total.toFixed(2)} €
            </span>
          </div>
          <button 
            className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600"
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
          >
            <CreditCard size={20} />
            <span>Payer</span>
          </button>
        </div>
      </div>
      
      {showProductSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg w-full max-w-md p-4`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Rechercher un produit
              </h2>
              <button
                onClick={() => setShowProductSearch(false)}
                className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}
              >
                ×
              </button>
            </div>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Nom ou code-barres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border text-gray-900'
                }`}
                autoFocus
              />
              <Search className={`absolute left-3 top-2.5 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} size={20} />
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    addToCart(product);
                    setShowProductSearch(false);
                    setSearchTerm('');
                  }}
                  className={`w-full p-3 text-left rounded-lg flex justify-between items-center ${
                    darkMode 
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {product.price.toFixed(2)} €
                    </p>
                  </div>
                  <Plus size={20} className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg w-full max-w-md p-4`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Choisir le mode de paiement
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setSelectedPaymentMethod('nfc')}
                className={`w-full p-4 rounded-lg border flex items-center space-x-3 ${
                  darkMode
                    ? selectedPaymentMethod === 'nfc'
                      ? 'bg-blue-900/50 border-blue-700 text-white'
                      : 'border-gray-600 text-gray-300'
                    : selectedPaymentMethod === 'nfc'
                      ? 'bg-blue-50 border-blue-500'
                      : ''
                }`}
              >
                <ContactlessPayment size={24} />
                <span>Sans contact</span>
              </button>
              
              <button
                onClick={() => setSelectedPaymentMethod('card')}
                className={`w-full p-4 rounded-lg border flex items-center space-x-3 ${
                  darkMode
                    ? selectedPaymentMethod === 'card'
                      ? 'bg-blue-900/50 border-blue-700 text-white'
                      : 'border-gray-600 text-gray-300'
                    : selectedPaymentMethod === 'card'
                      ? 'bg-blue-50 border-blue-500'
                      : ''
                }`}
              >
                <CreditCard size={24} />
                <span>Carte bancaire</span>
              </button>
              
              <button
                onClick={() => setSelectedPaymentMethod('cash')}
                className={`w-full p-4 rounded-lg border flex items-center space-x-3 ${
                  darkMode
                    ? selectedPaymentMethod === 'cash'
                      ? 'bg-blue-900/50 border-blue-700 text-white'
                      : 'border-gray-600 text-gray-300'
                    : selectedPaymentMethod === 'cash'
                      ? 'bg-blue-50 border-blue-500'
                      : ''
                }`}
              >
                <Wallet size={24} />
                <span>Espèces</span>
              </button>
              
              {selectedPaymentMethod === 'cash' && (
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Montant reçu
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={total}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className={`w-full p-2 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border text-gray-900'
                    }`}
                    placeholder="0.00"
                    autoFocus
                  />
                  {parseFloat(cashReceived) >= total && (
                    <p className="text-green-500">
                      Monnaie à rendre : {change.toFixed(2)} €
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod(null);
                  setCashReceived('');
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
                onClick={handleCompleteSale}
                disabled={
                  !selectedPaymentMethod || 
                  (selectedPaymentMethod === 'cash' && parseFloat(cashReceived) < total) ||
                  (selectedPaymentMethod === 'card' && !devices.find(d => d.id === 'payment')?.connected)
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sale;