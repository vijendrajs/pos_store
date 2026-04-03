import {useEffect, useState } from "react";
interface Product {
  id: number | string;
  name: string;
  image: string;
  mrp: number;
  sale_price: number;
  qty: number;
  short_description: string;
  selectRef?: HTMLSelectElement;
}

interface CartItem {
  product_id: number | string;
  qty: number;
}

import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

export default function Home() {
  const BASE_URL = import.meta.env.VITE_POS_STORE_BASE_URL;
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async (value='') => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}product/list?name=${encodeURIComponent(value)}`,
        {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("userToken")
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.data);
    } catch (err) {
      setError("Error check console");
      setProducts([]);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchProducts("");
  }, []);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(new Set(cart.map((item: CartItem) => item.product_id)).size);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    fetchProducts(value);
  };

const handleAddToCart = (productId: string, selectElement: HTMLSelectElement, name: string, short_description: string, mrp: number, sale_price: number) => {
    const qty = parseInt(selectElement.value);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: CartItem) => item.product_id === productId);
    if (existingIndex > -1) {
      cart[existingIndex].qty = qty;
    } else {
      cart.push({ product_id: productId, qty, name: name, short_description: short_description, mrp: mrp, sale_price:sale_price});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(new Set(cart.map((item: CartItem) => item.product_id)).size);
    console.log('Added to cart:', { productId, qty, totalItems: cart.length });
  };

  return (
    <>
      <PageMeta
        title="POS STORE"
        description="Dashboard"
      />

      
        <div className="grid grid-cols-12">
          <div className="col-span-8 space-y-8 xl:col-span-8">
            <form action="https://formbold.com/s/unique_form_id" method="POST">
                <div className="relative">
                  <button className="absolute -translate-y-1/2 left-4 top-1/2">
                    <svg
                      className="fill-gray-500 dark:fill-gray-400"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                        fill=""
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    name="search"
                    onChange={handleSearch}
                    value={search}
                    placeholder="Search by product name or SKU"
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[100%]"
                  />
                </div>
              </form> 
            </div>
           
            <div className="col-span-3 space-y-6 xl:col-span-3">
                <Button className="w-10 h-10 float-right rounded-full bg-blue-500 text-white relative flex items-center justify-center" size="sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5A2 2 0 005.5 18H16a2 2 0 002-2v-.5a1 1 0 00-1-1H4" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </Button>
            </div>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7 mt-4 mb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 dark:bg-gray-700"></div>
                  <div className="h-8 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full p-6 text-center text-gray-500 dark:text-gray-400">
                Error loading products: {error}. Check console.
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full p-6 text-center text-gray-500 dark:text-gray-400">
                No products found.
              </div>
            ) : (
              products.slice(0, 4).map((product, index) => (
                <div key={product.id || index} className="group rounded-2xl border border-gray-200 bg-white p-2 sm:p-2 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer">
                  <h5 className="font-semibold text-md text-gray-800 dark:text-white/95 mb-2 truncate pr-8">
                    {product.name || 'Unnamed Product'}
                  </h5>
                  <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                    <div className="flex-shrink-0">
                      <img 
                        className="w-24 h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-cover rounded-xl border shadow-sm group-hover:scale-[1.02] group-hover:shadow-md transition-all duration-300 bg-gray-100 dark:bg-gray-800" 
                        src={`${BASE_URL}uploads/${product.image}`} 
                        alt={product.name}
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none';
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
                      <select className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-sm focus:ring-brand-500 focus:border-brand-500 min-w-[80px]">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                      </select>
                      <Button size="sm" className="flex-1 font-medium shadow-sm hover:shadow-md" variant="primary" onClick={(e) => {
                          const button = e.currentTarget;
                          const select = button.previousElementSibling as HTMLSelectElement;
                          if (select) handleAddToCart(product.id as string, select, product.name as string, product.short_description as string, product.mrp as number, product.sale_price as number);
                        }}>
                        <svg className="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5A2 2 0 005.5 18H16a2 2 0 002-2v-.5a1 1 0 00-1-1H4" />
                        </svg>
                        Add to Cart
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
              ))
            )}
          </div>
        </div>

     
    </>
  );
}
