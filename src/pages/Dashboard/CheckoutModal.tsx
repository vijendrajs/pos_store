import { useState } from 'react';
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";


interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cartItems}) => {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    customer_id: '',
    payment_method: '',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
  const discount = cartItems.reduce((sum, item) => sum + ((item.mrp - item.sale_price) * item.qty), 0);
  const total = cartItems.reduce((sum, item) => sum + (item.sale_price * item.qty), 0);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_POS_STORE_BASE_URL;
  const fetchCustomer = async (value='') => {
    try {
      const response = await fetch(
        `${BASE_URL}customer/check?mobile=${encodeURIComponent(value)}&name=${encodeURIComponent(customer.name)}`,
        {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("userToken")
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        if (data.data){
          setCustomer({
            ...customer,
            name: data.data.first_name,
            customer_id: data.data.id,
          });
          if (data.data.new == 1){
            toast.success('Customer created');
          } else {
            toast.success('Customer already exist');
          }
          
        }
          

    } catch (err) {
      console.error(err);
      toast.error('Error Check Console');
    } 
  };

  
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.name === 'phone' && value.length > 10) return;
    setCustomer({
      ...customer,
      [e.target.name]: value,
    });
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    
    if (!customer.phone ) {
      toast.error('Enter mobile number');
      return;
    }

    if (phone && (phone.length !== 10 || !/^[0-9]{10}$/.test(phone))) {
      toast.error('Please enter valid 10 digit mobile number');
    } else {
      fetchCustomer(phone)
    }
  };

  const placeOrder =  async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const payload = {
      customer_id:customer.customer_id,
      payment_method:customer.payment_method,
      items:cart
    };

    try{
      const url = `${BASE_URL}sales/order`;
      const response = await fetch(
        url,
        {
          method:"POST",
          headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("userToken")
          },
          body:JSON.stringify(payload)
        }
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      if (data.status == 1){
        toast.success('Order placed successfully!');
        setCustomer({
            ...customer,
            name: '',
            customer_id: '',
            phone:'',
            payment_method:""
          });
        onClose();
        localStorage.removeItem('cart');
        navigate(`/order-summary/${data.data}`);
      } else {
        toast.error("Error");
      }
    } catch (err){
      console.error(err);
      toast.error('Error Check Console');
    }

  };

  const handlePlaceOrder = () => {

    if (!customer.name ) {
      toast.error('Enter customer name');
      return;
    }

    if (!customer.phone || customer.phone.length !== 10 || !/^[0-9]{10}$/.test(customer.phone)) {
      toast.error('Please fill valid 10 digit mobile number');
      return;
    }

    
    console.log(customer.payment_method)
    if (!customer.payment_method ) {
      toast.error('Select Payment method');
      return;
    }
    placeOrder()
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Details</h3>
            <div className="space-y-3">
              <input type="hidden"
                name="customer_id"
                value={customer.customer_id}
                onChange={handleCustomerChange}
              />
              
              <input
                name="name"
                placeholder="Customer Name"
                value={customer.name}
                onChange={handleCustomerChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600"
              />

              <input
                name="phone"
                placeholder="Phone Number (10 digits)"
                value={customer.phone}
                onChange={handleCustomerChange}
                onBlur={handlePhoneBlur}
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600"
              />
              
              <select value={customer.payment_method || ""} onChange={handleCustomerChange} name="payment_method" className="w-full mt-10 px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-sm focus:ring-brand-500 focus:border-brand-500 min-w-[80px]">
                  <option value=''>Payment Method</option>
                  <option value="cash on delivery">COD</option>
                  <option value="Online">Online</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h3>
            
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <p className="font-semibold">₹{(item.sale_price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount:</span>
                <span>- ₹{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Button size="lg" className="w-full" variant="primary" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;

