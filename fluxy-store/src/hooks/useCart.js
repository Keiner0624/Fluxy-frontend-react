import { useState } from 'react';

export function useCart() {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(i =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    const increaseQty = (productId) => {
        setCart(prev => prev.map(i =>
            i.product.id === productId && i.quantity < i.product.stock
                ? { ...i, quantity: i.quantity + 1 }
                : i
        ));
    };

    const decreaseQty = (productId) => {
        setCart(prev => prev
            .map(i => i.product.id === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i)
            .filter(i => i.quantity > 0)
        );
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);

    return { cart, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart, total, count };
}