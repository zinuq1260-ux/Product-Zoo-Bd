import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './CartContext';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const defaultProducts: Product[] = [];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('products');
      if (!saved) return defaultProducts;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProducts;
    } catch (e) {
      console.error('Failed to parse products from localStorage', e);
      return defaultProducts;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Some data might not be saved.');
      }
    }
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { 
      ...product, 
      id: Date.now().toString(),
      price: Number(product.price) || 0,
      discount: Number(product.discount) || 0,
      stock: Number(product.stock) || 0,
      rating: 0,
      reviews: 0
    };
    setProducts(prev => [...prev, newProduct as Product]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const sanitizedFields = { ...updatedFields };
    if ('price' in sanitizedFields) sanitizedFields.price = Number(sanitizedFields.price) || 0;
    if ('discount' in sanitizedFields) sanitizedFields.discount = Number(sanitizedFields.discount) || 0;
    if ('stock' in sanitizedFields) sanitizedFields.stock = Number(sanitizedFields.stock) || 0;

    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...sanitizedFields } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
