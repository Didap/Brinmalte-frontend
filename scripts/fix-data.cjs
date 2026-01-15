const fs = require('fs');

const API_TOKEN = '39162420c895ebc9232f864ab196ac5ca890983b6282c716d36a78ad8931e13db2761c22195442a7bfbd84b58711f6ca54504ffa16666603fd86453f25d52accef78679f5c7b0c876d1805153e7ce5109cc02cce6538e93eb0a38796e468e5c5137e214a86b6327cfcb314715009289fa014223dc63a2026921f24e8d497efff';

async function fixData() {
    // 1. Get correct Colorificio ID
    const catRes = await fetch(`${STRAPI_URL}/api/categories?filters[slug][$eq]=colorificio`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    const catData = await catRes.json();
    const correctCategory = catData.data[0];

    if (!correctCategory) {
        console.error('Correct "colorificio" category not found!');
        return;
    }
    console.log(`Correct Category: ${correctCategory.name} (ID: ${correctCategory.id})`);

    // 2. Scan Products
    console.log('Scanning products...');
    const prodRes = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[pageSize]=100`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    const prodData = await prodRes.json();

    for (const p of prodData.data) {
        if (p.category) {
            console.log(`Checking ${p.name}: Category slug is "${p.category.slug}"`);

            if (p.category.slug === 'colorifico') {
                console.log(`Found Typo in ${p.name}! Updating to ID ${correctCategory.id}...`);

                const updateRes = await fetch(`${STRAPI_URL}/api/products/${p.documentId || p.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_TOKEN}`
                    },
                    body: JSON.stringify({
                        data: {
                            category: correctCategory.id
                        }
                    })
                });

                if (updateRes.ok) {
                    console.log(`Updated ${p.name} successfully.`);
                } else {
                    console.error(`Failed to update ${p.name}: ${await updateRes.text()}`);
                }
            }
        } else {
            console.log(`Product ${p.name} has NO category.`);
        }
    }

    console.log('Scan complete.');
}

fixData();
