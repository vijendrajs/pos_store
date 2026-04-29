import React, { useRef } from 'react';
import QuantityStepper, { QuantityStepperRef } from '../../components/ui/stepper/QuantityStepper';
import Button from '../ui/button/Button';

interface Product {
  id: number | string;
  name: string;
  image: string;
  mrp: number;
  sale_price: number;
  qty: number;
  short_description: string;
}

interface ProductItemProps {
  product: Product;
  BASE_URL: string;
  onAddToCart: (productId: string, qtyRef: React.RefObject<QuantityStepperRef>, name: string, short_description: string, mrp: number, sale_price: number, image: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, BASE_URL, onAddToCart }) => {
  const qtyRef = useRef<QuantityStepperRef>(null);

  const imageUrl = `${BASE_URL}uploads/${product.image}`;

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-2 sm:p-2 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer">
      <h5 className="font-semibold text-md text-gray-800 dark:text-white/95 mb-2 truncate pr-8">
        {product.name || 'Unnamed Product'}
      </h5>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        <div className="flex-shrink-0">
          <img 
            className="w-24 h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-cover rounded-xl border shadow-sm group-hover:scale-[1.02] group-hover:shadow-md transition-all duration-300 bg-gray-100 dark:bg-gray-800" 
            src={imageUrl} 
            alt={product.name}
            onError={(e) => { 
              (e.target as HTMLImageElement).style.display = 'none';
            }} 
          />
          <div className="flex flex-col gap-1 mb-3 mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-gray-500 line-through dark:text-gray-400">
                ₹{product.mrp}
              </span>
              <span className="text-md font-bold text-brand-600 dark:text-brand-400">
                ₹{product.sale_price}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-7 leading-relaxed">
            {product.short_description}
          </p>
        </div>
      </div>
      {(product.qty || 0) > 0 ? (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <QuantityStepper 
            ref={qtyRef} 
            initialValue={1} 
            min={1} 
            max={20}
            className="min-w-[200px]"
          />
          <Button 
            size="sm" 
            className="flex-1 font-medium shadow-sm hover:shadow-md" 
            variant="primary" 
            onClick={() => {
              onAddToCart(
                product.id as string, 
                qtyRef, 
                product.name as string, 
                product.short_description as string, 
                product.mrp as number, 
                product.sale_price as number, 
                imageUrl
              );
            }}
          >
            <svg className="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5A2 2 0 005.5 18H16a2 2 0 002-2v-.5a1 1 0 00-1-1H4" />
            </svg>
            Add
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button size="sm" variant="outline" className="w-full font-medium opacity-50 cursor-not-allowed" disabled>
            Out of Stock
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductItem;

