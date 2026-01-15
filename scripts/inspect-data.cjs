// Native fetch in Node 22

const API_TOKEN = '1715e0aef3f2f3117cd0e7d5bd8430964bc30a9f7559ad38be0b0b0798cf844efbd78fbcad60058bbf6c7284272e0d51b8eb3a585fd80d4b4c305df9f1c730004b9ce177b8b0b592ba0ed2791d509417bc1abc1b1c064c675d43a5acb7da02c416180df0347a34076ef3e4ce2c2fb774f78e2797a74ff44b69c327ea6615e65e';

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
