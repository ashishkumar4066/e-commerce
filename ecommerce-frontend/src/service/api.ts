import axios, { AxiosInstance } from 'axios';

const baseURL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

export const getProducts = async (): Promise<any> => {
  const res = await api.get('/api/products');
  console.log('Fetched products:', res.data.data);
  return res.data.data;
};
export const fetchAllOrder = async (): Promise<any> => {
  const res = await api.get('/api/checkout/fetchAllOrder');
  console.log('Fetched all orders:', res.data.body);
  return res.data.body;
};
export const placeOrder = async (payload: any): Promise<any> => {
  const res = await api.post('/api/checkout/placeOrder', payload);
  console.log('Order placed:', res.data);
  return res.data;
};
export const checkCouponIsValid = async (payload: any): Promise<any> => {
  const res = await api.post('/api/checkout/checkIsCouponValid', payload);
  console.log('Fetched products:', res.data);
  return res.data;
};
export const generateDiscount = async (payload: any): Promise<any> => {
  const res = await api.post('/api/admin/generate-discount', payload);
  console.log('Fetched products:', res.data);
  return res.data;
};
export const getProductById = async (id: string): Promise<any> => {
  const res = await api.get(`/api/products/${id}`);
  return res.data;
};
