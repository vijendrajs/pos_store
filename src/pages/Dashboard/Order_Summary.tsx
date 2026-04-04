import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

interface OrderItem {
  product_id: number;
  id: number;
  product_name: string;
  quantity: number;
  sale_price: number;
  product_uom: string;
  total_discount: number;
  image: string;
  description: string;
  mrp: number;
  discount: number;
  sub_total: number;
  total: number;
  sku_code: string;
}

interface OrderData {
  customer_id: number;
  customer_name: string;
  is_active: boolean;
  id: number;
  discount: number;
  item_count: number;
  updated_by: number;
  created_at: string;
  sub_total: number;
  sequence_number: number;
  total: number;
  created_by: number;
  payment_method: string;
  updated_at: string;
  items: OrderItem[];
}

export default function OrderSummary() {
  const { sequence_number } = useParams<{ sequence_number: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_POS_STORE_BASE_URL;

  useEffect(() => {
    if (!sequence_number) {
      setError("No sequence number provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}sales/order-summary?sequence_number=${encodeURIComponent(sequence_number)}`,
          {
            method: "GET",
            headers: {
              "Authorization": "Bearer " + sessionStorage.getItem("userToken")
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        const data = responseData.data; // status:1, message, data
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order summary");
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sequence_number]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto dark:bg-gray-700"></div>
          <div className="h-64 bg-gray-200 rounded-xl w-full max-w-md mx-auto dark:bg-gray-700"></div>
          <div className="h-12 bg-gray-200 rounded-lg w-48 mx-auto dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/20">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error || "No order data available"}</p>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Order #${order.sequence_number}`} description="Order Summary" />
      
      <div className="p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Order Number:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{order.sequence_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Order Date:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Payment Mode:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{order.payment_method}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Customer Name:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Order ID:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Items ({order.item_count}) Items
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {order.items.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <img 
                      src={item.image} 
                      alt={item.product_name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-20 h-20 object-cover rounded-xl border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">{item.product_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.sku_code}</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          ₹{item.total.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Qty:</span>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                          <p className="font-medium">₹{item.sale_price.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">MRP:</span>
                          <p className="text-sm line-through text-gray-400 dark:text-gray-500">₹{item.mrp.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                          <p className="text-green-600 font-medium">- ₹{item.discount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl p-8 shadow-2xl">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span>₹{order.sub_total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg text-brand-100">
                  <span>Discount:</span>
                  <span>- ₹{order.discount.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4 border-white/20">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total:</span>
                    <span>₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

