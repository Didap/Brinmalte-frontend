const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN not found in .env');
    process.exit(1);
}

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
