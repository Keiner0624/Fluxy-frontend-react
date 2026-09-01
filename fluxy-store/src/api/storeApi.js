const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getCompanyInfo(slug) {
    const res = await fetch(`${API_URL}/store/slug/${slug}/info`);
    if (!res.ok) throw new Error('Tienda no encontrada');
    return res.json();
}

export async function getProducts(slug) {
    const res = await fetch(`${API_URL}/store/slug/${slug}/products`);
    if (!res.ok) throw new Error('Error al cargar productos');
    return res.json();
}

export async function createOrder(companyId, orderData) {
    const res = await fetch(`${API_URL}/store/${companyId}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Error al crear el pedido');
    return res.json();
}
