const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN not found in .env');
    process.exit(1);
}

async function inspect() {
    // Fetch Categories
    const catRes = await fetch(`${STRAPI_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    const catData = await catRes.json();
    console.log('--- Categories ---');
    catData.data.forEach(c => console.log(`${c.id}: ${c.name} (${c.slug})`));

    // Fetch Products with category
    const prodRes = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[pageSize]=100`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    const prodData = await prodRes.json();
    console.log('\n--- Products ---');
    prodData.data.forEach(p => {
        const catName = p.category ? `${p.category.name} (${p.category.slug})` : 'NULL';
        console.log(`${p.id}: ${p.name} -> Category: ${catName}`);
    });
}

inspect();
