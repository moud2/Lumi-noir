export type CartItem = {
  productId: string;
  title: string;
  priceCents: number;
  currency: string;
  coverImagePath?: string | null;
  quantity: number;
};

const KEY_PREFIX = "lumi_noir_cart_v1_";
const OWNER_KEY = "lumi_noir_cart_owner";

function getOwnerKey() {
  if (typeof window === "undefined") return "guest";
  return window.localStorage.getItem(OWNER_KEY) || "guest";
}

function getKey() {
  return `${KEY_PREFIX}${getOwnerKey()}`;
}

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("lumi-cart-changed"));
}

export function setCartOwner(userId: string | null) {
  if (typeof window === "undefined") return;
  const owner = userId || "guest";
  window.localStorage.setItem(OWNER_KEY, owner);
  emitChange();
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(getKey()) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(getKey(), JSON.stringify(items));
  emitChange();
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = getCart();
  const existing = cart.find((x) => x.productId === item.productId);
  if (existing) existing.quantity += qty;
  else cart.push({ ...item, quantity: qty });
  saveCart(cart);
}

export function updateQty(productId: string, quantity: number) {
  const cart = getCart().map((x) =>
    x.productId === productId ? { ...x, quantity } : x
  );
  saveCart(cart.filter((x) => x.quantity > 0));
}

export function removeItem(productId: string) {
  saveCart(getCart().filter((x) => x.productId !== productId));
}

export function clearCart() {
  saveCart([]);
}
  
