
import { categories } from '../src/data/categories';

const STRAPI_URL = 'http://localhost:1337';

async function seedCategories() {
    console.log('🚀 Starting Category Seeding...');

    for (const cat of categories) {
        try {
            // 1. Check if category exists
            console.log(`Checking category: ${cat.name}...`);
            const checkRes = await fetch(`${STRAPI_URL}/api/categories?filters[slug][$eq]=${cat.slug}`);
            const checkData = await checkRes.json();

            if (checkData.data && checkData.data.length > 0) {
                console.log(`⚠️ Category ${cat.name} already exists. Skipping.`);
                continue;
            }

            // 2. Create category
            const payload = {
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                    // Images: Strapi handles media separately. We'll skip image binding in this script 
                    // or we would need to upload files first.
                    // For now, we seed text content.
                }
            };

            const res = await fetch(`${STRAPI_URL}/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(JSON.stringify(error));
            }

            console.log(`✅ Created category: ${cat.name}`);

        } catch (err) {
            console.error(`❌ Error creating ${cat.name}:`, err);
        }
    }

    console.log('🎉 Seeding completed!');
}

seedCategories();
