const API_TOKEN = '39162420c895ebc9232f864ab196ac5ca890983b6282c716d36a78ad8931e13db2761c22195442a7bfbd84b58711f6ca54504ffa16666603fd86453f25d52accef78679f5c7b0c876d1805153e7ce5109cc02cce6538e93eb0a38796e468e5c5137e214a86b6327cfcb314715009289fa014223dc63a2026921f24e8d497efff';

async function clearProducts() {
    console.log('🗑️ Clearing all products...');

    // 1. Fetch all products
    try {
        const res = await fetch(`${STRAPI_URL}/api/products?pagination[limit]=100`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const data = await res.json();
        const products = data.data || [];

        console.log(`Found ${products.length} products to delete.`);

        // 2. Delete each
        for (const p of products) {
            const delRes = await fetch(`${STRAPI_URL}/api/products/${p.documentId || p.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            });
            if (delRes.ok) console.log(`Deleted: ${p.name || p.id}`);
            else console.error(`Failed to delete ${p.id}`);
        }
    } catch (e) {
        console.error('Error clearing products', e);
    }
    console.log('✅ Done clearing.');
}

clearProducts();
