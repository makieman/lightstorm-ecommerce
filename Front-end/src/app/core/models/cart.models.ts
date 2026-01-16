import { Product } from '../../features/shop/pages/products/product.model';
export interface CartItem {
    product: Product;
    quantity: number;
}

export interface cartState {
    items: CartItem[];
    total: number;
    totalprice: number;
}
