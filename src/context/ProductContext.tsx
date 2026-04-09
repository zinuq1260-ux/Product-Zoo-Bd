import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './CartContext';
import { supabase } from '../lib/supabase';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time changes for products
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    // Only show loading if we don't have products yet to avoid flickering
    if (products.length === 0) setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      
      if (data) {
        const formattedProducts = data.map(p => ({
          ...p,
          productCode: p.product_code,
          isFeatured: p.is_featured,
          isTrending: p.is_trending,
          image_url: p.image_url,
          additional_images: p.additional_images,
          delivery_info: p.delivery_info,
          warranty_info: p.warranty_info,
          return_policy: p.return_policy
        }));
        setProducts(formattedProducts);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const dbProduct = {
      name: product.name,
      product_code: product.productCode || '',
      description: product.description,
      price: Number(product.price) || 0,
      discount: Number(product.discount) || 0,
      category: product.category,
      stock: Number(product.stock) || 0,
      image_url: product.image_url,
      additional_images: product.additional_images || [],
      delivery_info: product.delivery_info || '',
      warranty_info: product.warranty_info || '',
      return_policy: product.return_policy || '',
      is_featured: product.isFeatured || false,
      is_trending: product.isTrending || false
    };

    const { data, error: supabaseError } = await supabase.from('products').insert([dbProduct]).select();
    if (supabaseError) {
      console.error('Error adding product:', supabaseError);
      throw supabaseError;
    } else if (data) {
      await fetchProducts();
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const dbFields: any = {};
    if ('name' in updatedFields) dbFields.name = updatedFields.name;
    if ('productCode' in updatedFields) dbFields.product_code = updatedFields.productCode;
    if ('description' in updatedFields) dbFields.description = updatedFields.description;
    if ('price' in updatedFields) dbFields.price = Number(updatedFields.price) || 0;
    if ('discount' in updatedFields) dbFields.discount = Number(updatedFields.discount) || 0;
    if ('category' in updatedFields) dbFields.category = updatedFields.category;
    if ('stock' in updatedFields) dbFields.stock = Number(updatedFields.stock) || 0;
    if ('image_url' in updatedFields) dbFields.image_url = updatedFields.image_url;
    if ('additional_images' in updatedFields) dbFields.additional_images = updatedFields.additional_images;
    if ('delivery_info' in updatedFields) dbFields.delivery_info = updatedFields.delivery_info;
    if ('warranty_info' in updatedFields) dbFields.warranty_info = updatedFields.warranty_info;
    if ('return_policy' in updatedFields) dbFields.return_policy = updatedFields.return_policy;
    if ('isFeatured' in updatedFields) dbFields.is_featured = updatedFields.isFeatured;
    if ('isTrending' in updatedFields) dbFields.is_trending = updatedFields.isTrending;

    const { error: supabaseError } = await supabase.from('products').update(dbFields).eq('id', id);
    if (supabaseError) {
      console.error('Error updating product:', supabaseError);
      throw supabaseError;
    } else {
      await fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    const { error: supabaseError } = await supabase.from('products').delete().eq('id', id);
    if (supabaseError) {
      console.error('Error deleting product:', supabaseError);
      throw supabaseError;
    } else {
      await fetchProducts();
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, updateProduct, deleteProduct, refreshProducts: fetchProducts }}>
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
