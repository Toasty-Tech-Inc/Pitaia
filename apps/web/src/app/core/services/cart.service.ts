import { Injectable, signal, computed } from '@angular/core';
import { Product, ModifierOption } from '../models/product.model';
import { Coupon, DiscountType, OrderType } from '../models/order.model';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedModifiers: SelectedModifier[];
  notes?: string;
  total: number;
}

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  option: ModifierOption;
}

export interface CartState {
  items: CartItem[];
  orderType: OrderType;
  coupon: Coupon | null;
  deliveryFee: number;
  serviceFee: number;
}

const CART_STORAGE_KEY = 'pitaia_cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartState = signal<CartState>({
    items: [],
    orderType: OrderType.TAKEOUT,
    coupon: null,
    deliveryFee: 0,
    serviceFee: 0,
  });

  readonly items = computed(() => this.cartState().items);
  readonly itemCount = computed(() => 
    this.cartState().items.reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly orderType = computed(() => this.cartState().orderType);
  readonly coupon = computed(() => this.cartState().coupon);
  readonly deliveryFee = computed(() => this.cartState().deliveryFee);
  readonly serviceFee = computed(() => this.cartState().serviceFee);

  readonly subtotal = computed(() =>
    this.cartState().items.reduce((sum, item) => sum + item.total, 0)
  );

  readonly discount = computed(() => {
    const coupon = this.cartState().coupon;
    if (!coupon) return 0;

    const subtotal = this.subtotal();
    
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return 0;
    }

    let discount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = subtotal * (coupon.discountValue / 100);
    } else {
      discount = coupon.discountValue;
    }

    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    return discount;
  });

  readonly total = computed(() => {
    const state = this.cartState();
    return this.subtotal() - this.discount() + state.deliveryFee + state.serviceFee;
  });

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as CartState;
        this.cartState.set(data);
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cartState()));
  }

  private generateItemId(product: Product, modifiers: SelectedModifier[]): string {
    const modifierIds = modifiers.map(m => `${m.modifierId}:${m.option.id}`).sort().join('|');
    return `${product.id}__${modifierIds}`;
  }

  addItem(product: Product, quantity: number, modifiers: SelectedModifier[] = [], notes?: string): void {
    const modifierTotal = modifiers.reduce((sum, m) => sum + m.option.price, 0);
    const unitPrice = product.price + modifierTotal;
    const itemId = this.generateItemId(product, modifiers);

    this.cartState.update((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === itemId);

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        const existing = updatedItems[existingIndex];
        const newQuantity = existing.quantity + quantity;
        updatedItems[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          total: newQuantity * unitPrice,
          notes: notes ?? existing.notes,
        };
        return { ...state, items: updatedItems };
      }

      const newItem: CartItem = {
        id: itemId,
        product,
        quantity,
        unitPrice,
        selectedModifiers: modifiers,
        notes,
        total: quantity * unitPrice,
      };

      return { ...state, items: [...state.items, newItem] };
    });

    this.saveToStorage();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.cartState.update((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      );
      return { ...state, items: updatedItems };
    });

    this.saveToStorage();
  }

  removeItem(itemId: string): void {
    this.cartState.update((state) => ({
      ...state,
      items: state.items.filter((item) => item.id !== itemId),
    }));
    this.saveToStorage();
  }

  setOrderType(type: OrderType): void {
    this.cartState.update((state) => ({
      ...state,
      orderType: type,
      deliveryFee: type === OrderType.DELIVERY ? state.deliveryFee : 0,
    }));
    this.saveToStorage();
  }

  setDeliveryFee(fee: number): void {
    this.cartState.update((state) => ({
      ...state,
      deliveryFee: fee,
    }));
    this.saveToStorage();
  }

  applyCoupon(coupon: Coupon): void {
    this.cartState.update((state) => ({
      ...state,
      coupon,
    }));
    this.saveToStorage();
  }

  removeCoupon(): void {
    this.cartState.update((state) => ({
      ...state,
      coupon: null,
    }));
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartState.set({
      items: [],
      orderType: OrderType.TAKEOUT,
      coupon: null,
      deliveryFee: 0,
      serviceFee: 0,
    });
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}
