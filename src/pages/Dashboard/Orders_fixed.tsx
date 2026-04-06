import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

interface Order {
  id: number;
  sequence_number: number;
  sub_total: number;
  discount: number;
  total: number;
  created_at: string;
  payment_method: string;
  item_count: number;
}

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sequence, setSequence] = useState(searchParams.get("sequence_number") || "");
  const [mobile, setMobile] = useState(searchParams.get("mobile") || "");

  const BASE_URL = import.meta.env.VITE_POS_STORE_BASE_URL;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}sales/orders`;
      
      const params = new URLSearchParams();
      if (sequence) params.append("sequence_number", sequence);
      if (mobile) params.append("mobile", mobile);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + sessionStorage.getItem("userToken")
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sequence, mobile]);

  const updateSearch = (key: string, value: string) => {
    setSearchParams({ ...(Object.fromEntries(searchParams.entries())), [key]: value });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Orders" description="All Orders" />
      
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Sequence Number"
              value={sequence}
              onChange={(e) => {
                setSequence(e.target.value);
                updateSearch("sequence_number", e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 min-w-[200px]"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                updateSearch("mobile", e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 min-w-[200px]"
            />
            <Button onClick={fetchOrders}>Search</Button>
            {sequence || mobile ? (
              <Button variant="outline" onClick={() => {
                setSequence("");
                setMobile("");
                setSearchParams({});
              }}>Clear</Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-xl p-6 text-red-800 dark:text-red-200">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
            <Button className="mt-4" onClick={fetchOrders} variant="outline">Retry</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try different search parameters</p>
            <Button onClick={() => {
              setSequence("");
              setMobile("");
              setSearchParams({});
            }}>Clear Search</Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Sequence #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 dark:text-gray-100">
                        #{order.sequence_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          {order.item_count} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        ₹{order.sub_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-green-600">-{order.discount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.payment_method === 'Online' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {order.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mr-2"
                          onClick={() => window.open(`/order-summary/${order.sequence_number}`, '_blank')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {orders.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                  <span>Showing {orders.length} orders</span>
                  <Button variant="primary" disabled={loading}>
                    Load More
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

