import { useState, useEffect } from 'react';
import { getCompanyInfo, getProducts } from '../api/storeApi';

export function useStore(slug) {
    const [company, setCompany]   = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        if (!slug) return;
        async function load() {
            try {
                const [comp, prods] = await Promise.all([
                    getCompanyInfo(slug),
                    getProducts(slug)
                ]);
                console.log('=== useStore: Company desde API ===')
                console.log('comp completo:', comp)
                console.log('logoUrl:', comp?.logoUrl)
                console.log('paymentMethods:', comp?.paymentMethods)
                console.log('storeStyle:', comp?.storeStyle)
                console.log('===================================')
                setCompany(comp);
                setProducts(prods);
            } catch (e) {
                console.error('useStore error:', e)
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const reload = () => {
        setLoading(true);
        getProducts(slug)
            .then(setProducts)
            .finally(() => setLoading(false));
    };

    return { company, products, loading, error, reload };
}