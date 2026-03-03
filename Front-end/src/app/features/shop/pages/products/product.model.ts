export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  _id: string;
  title: string;
  image: string;
  price: number;
  details: string;
  quantity: number;
  category?: Category | string;
  lowStockThreshold?: number;
  createdBy?: string;
  wattage?: string;
  voltage?: string;
  batteryType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupedProducts {
  _id: string;
  category: {
    id: string;
    name: string;
    slug?: string;
  };
  products: Product[];
}
