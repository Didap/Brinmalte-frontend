const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN not found in .env');
    process.exit(1);
}

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
