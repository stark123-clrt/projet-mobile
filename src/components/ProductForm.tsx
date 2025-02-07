import React, { useState } from 'react';
import { X, Loader2, QrCode, Package, Euro, Archive, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';

interface ProductFormProps {
  onClose: () => void;
  initialBarcode?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose, initialBarcode }) => {
  const { darkMode } = useTheme();
  const categories = useStore((state) => state.categories);
  const addProduct = useStore((state) => state.addProduct);
  const addCategory = useStore((state) => state.addCategory);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    minStock: '',
    barcode: initialBarcode || ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [step, setStep] = useState(1);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await addProduct({
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: formData.categoryId,
        minStock: Number(formData.minStock) || 5,
        barcode: formData.barcode
      });
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateCategory = () => {
    if (newCategory.trim()) {
      const category = {
        name: newCategory.trim(),
        description: ''
      };
      addCategory(category);
      setFormData(prev => ({ ...prev, categoryId: category.id }));
      setNewCategory('');
      setShowNewCategory(false);
    }
  };
  
  const inputClasses = `w-full rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900'
  }`;
  
  const labelClasses = `block text-sm font-medium ${
    darkMode ? 'text-gray-300' : 'text-gray-700'
  } mb-1`;

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.categoryId !== '';
      case 2:
        return formData.price !== '' && Number(formData.price) >= 0;
      case 3:
        return formData.stock !== '' && Number(formData.stock) >= 0;
      default:
        return true;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg w-full max-w-md max-h-[90vh] flex flex-col`}>
        <div className={`flex justify-between items-center p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ajouter un produit
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Étape {step} sur 3
            </p>
          </div>
          <button 
            onClick={onClose} 
            className={`rounded-full p-1 transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex mb-6">
            <div className="flex-1 relative">
              <div className={`h-1 ${step >= 1 ? 'bg-blue-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`absolute -top-2 left-0 w-6 h-6 rounded-full flex items-center justify-center ${
                step >= 1 
                  ? 'bg-blue-500 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
            </div>
            <div className="flex-1 relative">
              <div className={`h-1 ${step >= 2 ? 'bg-blue-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`absolute -top-2 left-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                step >= 2 
                  ? 'bg-blue-500 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
            <div className="flex-1 relative">
              <div className={`h-1 ${step >= 3 ? 'bg-blue-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`absolute -top-2 right-0 w-6 h-6 rounded-full flex items-center justify-center ${
                step >= 3 
                  ? 'bg-blue-500 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Package size={18} />
                        <span>Nom du produit</span>
                      </div>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={inputClasses}
                      placeholder="ex: Café Arabica 250g"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Code-barres (optionnel)</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        className={inputClasses}
                        placeholder="Scanner ou saisir le code-barres"
                      />
                      <button
                        type="button"
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <QrCode size={24} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Catégorie</label>
                    {!showNewCategory ? (
                      <div className="flex space-x-2">
                        <select
                          required
                          value={formData.categoryId}
                          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className={inputClasses}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewCategory(true)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          Nouvelle
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className={inputClasses}
                          placeholder="Nom de la nouvelle catégorie"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                        >
                          Créer
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewCategory(false)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Euro size={18} />
                      <span>Prix de vente (€)</span>
                    </div>
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className={inputClasses}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Archive size={18} />
                      <span>Stock initial</span>
                    </div>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className={inputClasses}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle size={18} />
                      <span>Stock minimum</span>
                    </div>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                    className={inputClasses}
                    placeholder="5"
                  />
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Une alerte sera affichée quand le stock sera inférieur à cette valeur
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
              }`}
            >
              Précédent
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                  isStepValid() 
                    ? 'hover:bg-blue-700' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !isStepValid()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
              >
                {isLoading && <Loader2 size={20} className="animate-spin" />}
                <span>Ajouter le produit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;