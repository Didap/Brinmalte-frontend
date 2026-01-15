
import { categories } from '../src/data/categories';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN not found in .env');
    process.exit(1);
}

async function seedCategories() {
    console.log('🚀 Starting Category Seeding...');

    for (const cat of categories) {
        try {
            // 1. Check if category exists
            console.log(`Checking category: ${cat.name}...`);
            const checkRes = await fetch(`${STRAPI_URL}/api/categories?filters[slug][$eq]=${cat.slug}`, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            });
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
                    'Authorization': `Bearer ${API_TOKEN}`
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
