export interface Product {
  _id: string;
  title: string;
  image: string;
  price: number;
  details: string;
  quantity: number;
  category?: string;
  wattage?: string;
  voltage?: string;
  batteryType?: string;
}
