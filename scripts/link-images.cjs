// Native fetch in Node 18+
const fs = require('fs');
const path = require('path');
// Native FormData in Node 18+
// Actually, native FormData in Node doesn't support file from path easily without Blob.
// I'll use a helper to read file as Blob.

const API_TOKEN = '1715e0aef3f2f3117cd0e7d5bd8430964bc30a9f7559ad38be0b0b0798cf844efbd78fbcad60058bbf6c7284272e0d51b8eb3a585fd80d4b4c305df9f1c730004b9ce177b8b0b592ba0ed2791d509417bc1abc1b1c064c675d43a5acb7da02c416180df0347a34076ef3e4ce2c2fb774f78e2797a74ff44b69c327ea6615e65e';

const mappings = {
    categories: [
        { slug: "colorificio", image: "cat_paint.png" },
        { slug: "cappotto-termico", image: "cat_insulation.png" },
        { slug: "cartongesso", image: "cat_drywall.png" },
        { slug: "resina", image: "cat_resin.png" },
        { slug: "piscine", image: "cat_pool.png" },
        { slug: "edilizia", image: "prod_mortar.png" }
    ],
    products: [
        { slug: "sika-monotop-627-hp", image: "prod_mortar.png" },
        { slug: "sikatop-seal-107", image: "prod_sealant.png" },
        { slug: "sikalastic-612", image: "prod_sealant.png" },
        { slug: "sika-ceram-255-starflex", image: "prod_mortar.png" }
    ]
};

async function uploadFile(filename) {
    const filePath = path.join(__dirname, '../public/img', filename);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    const stats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    // Create Blob-like object or use FormData with buffer/stream if possible?
    // Node 18+ has Blob.
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('files', blob, filename);

    try {
        const res = await fetch(`${STRAPI_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(JSON.stringify(err));
        }

        const data = await res.json();
        return data[0]; // Returns array of uploaded files
    } catch (e) {
        console.error(`Error uploading ${filename}:`, e);
        return null;
    }
}

async function linkImages() {
    console.log('🚀 Starting Image Linking...');

    // 1. Process Categories
    for (const item of mappings.categories) {
        console.log(`Processing Category: ${item.slug}`);

        // Find Category
        const findRes = await fetch(`${STRAPI_URL}/api/categories?filters[slug][$eq]=${item.slug}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const findData = await findRes.json();
        const cat = findData.data?.[0];

        if (!cat) {
            console.log(`⚠️ Category ${item.slug} not found.`);
            continue;
        }

        // Upload Image
        const image = await uploadFile(item.image);
        if (!image) continue;

        // Update Category
        const updateRes = await fetch(`${STRAPI_URL}/api/categories/${cat.documentId || cat.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                data: {
                    heroImage: image.id
                }
            })
        });

        if (updateRes.ok) console.log(`✅ Updated ${item.slug} with image ${image.id}`);
        else console.error(`❌ Failed to update ${item.slug}`);
    }

    // 2. Process Products
    for (const item of mappings.products) {
        console.log(`Processing Product: ${item.slug}`);

        // Find Product
        const findRes = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${item.slug}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const findData = await findRes.json();
        const prod = findData.data?.[0];

        if (!prod) {
            console.log(`⚠️ Product ${item.slug} not found.`);
            continue;
        }

        // Upload Image
        const image = await uploadFile(item.image);
        if (!image) continue;

        // Update Product
        const updateRes = await fetch(`${STRAPI_URL}/api/products/${prod.documentId || prod.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                data: {
                    image: image.id // Single image for now based on Schema
                }
            })
        });

        if (updateRes.ok) console.log(`✅ Updated ${item.slug} with image ${image.id}`);
        else console.error(`❌ Failed to update ${item.slug}`);
    }

    console.log('🎉 Image linking completed!');
}

linkImages();
