// Native fetch in Node 18+

const API_TOKEN = '1715e0aef3f2f3117cd0e7d5bd8430964bc30a9f7559ad38be0b0b0798cf844efbd78fbcad60058bbf6c7284272e0d51b8eb3a585fd80d4b4c305df9f1c730004b9ce177b8b0b592ba0ed2791d509417bc1abc1b1c064c675d43a5acb7da02c416180df0347a34076ef3e4ce2c2fb774f78e2797a74ff44b69c327ea6615e65e';

// Product Data
const products = [
    {
        name: "Sika MonoTop®-627 HP",
        slug: "sika-monotop-627-hp",
        subtitle: "Malta strutturale R4 ad alte prestazioni, fibrorinforzata",
        sku: "627HP-25",
        price: 24.50,
        stock: 20,
        description: "Malta cementizia monocomponente, fibrorinforzata, a ritiro compensato e alte prestazioni meccaniche. Ideale per il ripristino strutturale del calcestruzzo.",
        availability: "Disponibile",
        categorySlug: "edilizia", // Primary choice
        technical_data: [
            { label: "Base chimica", value: "Cemento Portland, additivi, fibre" },
            { label: "Granulometria", value: "3 mm" },
            { label: "Spessore strato", value: "Min 10 mm / Max 80 mm" },
            { label: "Temp. applicazione", value: "+5°C / +35°C" }
        ]
    },
    {
        name: "SikaTop® Seal-107",
        slug: "sikatop-seal-107",
        subtitle: "Malta impermeabilizzante bicomponente elastica",
        sku: "SEAL107-25",
        price: 42.00,
        stock: 50,
        description: "Malta cementizia bicomponente a basso modulo elastico, contenente polimeri liquidi e additivi speciali. Ideale per impermeabilizzare balconi, terrazze, bagni e piscine.",
        availability: "Disponibile",
        categorySlug: "colorificio", // Primary choice
        technical_data: [
            { label: "Base chimica", value: "Comp A: Liquido / Comp B: Polvere" },
            { label: "Densità malta fresca", value: "~ 2.0 kg/l" },
            { label: "Spessore strato", value: "Min 1.5 mm / Max 3.0 mm (in 2 mani)" },
            { label: "Temp. applicazione", value: "+8°C / +35°C" }
        ]
    },
    {
        name: "Sikalastic®-612",
        slug: "sikalastic-612",
        subtitle: "Membrana liquida poliuretanica monocomponente",
        sku: "L612-5",
        price: 68.90,
        stock: 12,
        description: "Membrana liquida impermeabilizzante poliuretanica, monocomponente, igro-innescata, applicabile a freddo. Forma un rivestimento continuo e senza giunzioni.",
        availability: "Disponibile",
        categorySlug: "resina", // Primary choice
        technical_data: [
            { label: "Base chimica", value: "Poliuretano aromatico monocomponente" },
            { label: "Allungamento a rottura", value: "~ 150%" },
            { label: "Resistenza alla trazione", value: "~ 4 N/mm²" },
            { label: "Tempo fuori pioggia", value: "~ 3-4 ore" }
        ]
    },
    {
        name: "Sika® Ceram-255 StarFlex",
        slug: "sika-ceram-255-starflex",
        subtitle: "Adesivo cementizio deformabile ad alte prestazioni",
        sku: "CER255-25",
        price: 18.50,
        stock: 100,
        description: "Adesivo cementizio monocomponente, polimerico, deformabile, a scivolamento verticale nullo e tempo aperto prolungato. Classe C2TE S1.",
        availability: "Disponibile",
        categorySlug: "cappotto-termico", // Primary choice
        technical_data: [
            { label: "Classificazione", value: "C2 TE S1 secondo EN 12004" },
            { label: "Colore", value: "Grigio o Bianco" },
            { label: "Spessore strato", value: "Fino a 15 mm" },
            { label: "Pedonabilità", value: "Dopo 24-36 ore" }
        ]
    }
];

async function seedProducts() {
    console.log('🚀 Starting Product Seeding...');

    // 1. Fetch Categories to Map Slug -> ID
    const catMap = new Map();
    try {
        const catRes = await fetch(`${STRAPI_URL}/api/categories`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const catData = await catRes.json();

        if (catData.data) {
            catData.data.forEach(c => {
                // Strapi v5 uses documentId, but lets assume documentId or id
                // Actually for create/update relation we usually use documentId in v5? 
                // Or ID? Let's try documentId if available, else id.
                // Wait, relationship fields usually expect documentId in v5.
                catMap.set(c.slug, c.documentId || c.id);
            });
            console.log('📂 Categories loaded:', catMap.size);
        }
    } catch (e) {
        console.error('Failed to load categories', e);
        return;
    }

    // 2. Seed Products
    for (const prod of products) {
        try {
            // Check existence
            const checkRes = await fetch(`${STRAPI_URL}/api/products?filters[sku][$eq]=${prod.sku}`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            });
            const checkData = await checkRes.json();

            if (checkData.data && checkData.data.length > 0) {
                console.log(`⚠️ Product ${prod.name} already exists. Skipping.`);
                continue;
            }

            const catId = catMap.get(prod.categorySlug);

            const payload = {
                data: {
                    name: prod.name,
                    slug: prod.slug,
                    subtitle: prod.subtitle,
                    sku: prod.sku,
                    price: prod.price,
                    stock: prod.stock,
                    description: prod.description,
                    availability: prod.availability,
                    technical_data: prod.technical_data,
                    category: catId // Relation
                }
            };

            // Note: Images are not uploaded here. user script upload-images.js was for categories.
            // We would need a separate upload logic for product images.

            const res = await fetch(`${STRAPI_URL}/api/products`, {
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

            console.log(`✅ Created product: ${prod.name}`);

        } catch (err) {
            console.error(`❌ Error creating ${prod.name}:`, err);
        }
    }
    console.log('🎉 Product Seeding completed!');
}

seedProducts();
