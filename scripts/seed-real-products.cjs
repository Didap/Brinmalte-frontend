// Native fetch is used
// Native FormData is used
const fs = require('fs');
const path = require('path');

const API_TOKEN = '1715e0aef3f2f3117cd0e7d5bd8430964bc30a9f7559ad38be0b0b0798cf844efbd78fbcad60058bbf6c7284272e0d51b8eb3a585fd80d4b4c305df9f1c730004b9ce177b8b0b592ba0ed2791d509417bc1abc1b1c064c675d43a5acb7da02c416180df0347a34076ef3e4ce2c2fb774f78e2797a74ff44b69c327ea6615e65e';

// Mapping categories to IDs (assuming standard seeding order, but we will fetch them first to be safe)
// colorificio, cappotto-termico, cartongesso, resina, piscine, edilizia

const products = [
    // Colorificio
    {
        name: "Sikagard®-550 W Elastic",
        subtitle: "Rivestimento protettivo per calcestruzzo con capacità di crack-bridging",
        sku: "SKU: GARD550W",
        price: "115.00",
        unit: "Lattha 15L",
        stock: 45,
        categorySlug: "colorificio",
        description: "Rivestimento protettivo plasto-elastico, monocomponente, indurente ai raggi UV, per la protezione e il miglioramento estetico delle strutture in calcestruzzo a rischio di fessurazione.",
        technicalData: [
            { label: "Base chimica", value: "Acrilato stirene disperso in acqua" },
            { label: "Colore", value: "Disponibile in varie tinte RAL" },
            { label: "Allungamento a rottura", value: "~ 120% a 23°C" }
        ],
        imageType: "paint" // placeholder mapping
    },
    {
        name: "SikaMur® Color E",
        subtitle: "Pittura murale silossanica traspirante e idrorepellente",
        sku: "SKU: MURCOLORE",
        price: "85.50",
        unit: "Lattha 14L",
        stock: 60,
        categorySlug: "colorificio",
        description: "Idropittura a base di resine silossaniche per esterni e interni, ad elevata traspirabilità e idrorepellenza. Ideale per la finitura di intonaci deumidificanti come SikaMur.",
        technicalData: [
            { label: "Base chimica", value: "Resina silossanica" },
            { label: "Permeabilità al vapore", value: "Classe V1 (Alta)" },
            { label: "Assorbimento d'acqua", value: "Classe W3 (Basso)" }
        ],
        imageType: "paint"
    },

    // Cappotto Termico
    {
        name: "Sika ThermoCoat®-1/3",
        subtitle: "Malta cementizia per incollaggio e rasatura pannelli isolanti",
        sku: "SKU: THERMO13",
        price: "15.90",
        unit: "Sacco 25kg",
        stock: 150,
        categorySlug: "cappotto-termico",
        description: "Malta monocomponente per l'incollaggio e la rasatura di pannelli isolanti in polistirene (EPS/XPS), lana di roccia e sughero nei sistemi a cappotto.",
        technicalData: [
            { label: "Granulometria", value: "0-0.6 mm" },
            { label: "Spessore applicazione", value: "3-5 mm come rasante" },
            { label: "Consumo incollaggio", value: "4-5 kg/mq" }
        ],
        imageType: "mortar"
    },
    {
        name: "Sika ThermoCoat®-5 HS",
        subtitle: "Rivestimento acril-silossanico a spessore",
        sku: "SKU: THERMO5HS",
        price: "65.00",
        unit: "Fusto 25kg",
        stock: 80,
        categorySlug: "cappotto-termico",
        description: "Rivestimento murale a spessore, fibrorinforzato, a base di resine acriliche e silossaniche, con protezione antialga e antimuffa, per finiture di sistemi a cappotto.",
        technicalData: [
            { label: "Granulometria", value: "1.0 / 1.2 / 1.5 mm" },
            { label: "Permeabilità vapore", value: "V2" },
            { label: "Assorbimento acqua", value: "W3" }
        ],
        imageType: "bucket"
    },

    // Cartongesso (SikaWall for fillers/finishers)
    {
        name: "SikaWall®-350 Joint",
        subtitle: "Stucco in pasta per giunti cartongesso",
        sku: "SKU: WALL350",
        price: "22.50",
        unit: "Secchio 20kg",
        stock: 40,
        categorySlug: "cartongesso",
        description: "Stucco pronto all'uso per la stuccatura dei giunti tra lastre di cartongesso con banda di rinforzo e per la rasatura completa.",
        technicalData: [
            { label: "Colore", value: "Bianco" },
            { label: "Tempo di essiccazione", value: "24-48 ore" },
            { label: "Tipo", value: "Stucco in pasta" }
        ],
        imageType: "bucket"
    },

    // Pavimenti in Resina
    {
        name: "Sikafloor®-2640",
        subtitle: "Resina epossidica bicomponente per pavimentazioni",
        sku: "SKU: FLOOR2640",
        price: "240.00",
        unit: "Kit 30kg (A+B)",
        stock: 25,
        categorySlug: "resina",
        description: "Rivestimento epossidico colorato, bicomponente, per pavimentazioni industriali, magazzini e officine. Elevata resistenza meccanica e chimica.",
        technicalData: [
            { label: "Base chimica", value: "Epossidica" },
            { label: "Finitura", value: "Lucida" },
            { label: "Resistenza abrasione", value: "Alta" }
        ],
        imageType: "resin_kit"
    },
    {
        name: "Sikafloor®-2540 W",
        subtitle: "Vernice epossidica all'acqua per pavimenti e pareti",
        sku: "SKU: FLOOR2540W",
        price: "185.00",
        unit: "Kit 18kg",
        stock: 35,
        categorySlug: "resina",
        description: "Rivestimento epossidico bicomponente in dispersione acquosa, colorato, a basse emissioni. Ideale per aree di produzione, magazzini e parcheggi.",
        technicalData: [
            { label: "Base chimica", value: "Epossidica all'acqua" },
            { label: "Certificazioni", value: "AgBB - Basse emissioni" },
            { label: "Aspetto", value: "Semi-opaco" }
        ],
        imageType: "resin_kit"
    },

    // Piscine
    {
        name: "SikaTop® Seal-107 Bianco",
        subtitle: "Malta impermeabilizzante per piscine",
        sku: "SKU: SEAL107W",
        price: "45.00",
        unit: "Kit 25kg",
        stock: 60,
        categorySlug: "piscine",
        description: "Malta cementizia bicomponente impermeabilizzante, flessibile, idonea al contatto con acqua potabile e per l'impermeabilizzazione di piscine prima della posa di piastrelle o mosaico.",
        technicalData: [
            { label: "Colore", value: "Bianco" },
            { label: "Spessore", value: "Min 1.5 mm" },
            { label: "Adesione", value: "> 1.5 N/mm2" }
        ],
        imageType: "mortar"
    },
    {
        name: "Sikasil® Pool",
        subtitle: "Sigillante siliconico per piscine",
        sku: "SKU: SILPOOL",
        price: "12.50",
        unit: "Cartuccia 300ml",
        stock: 200,
        categorySlug: "piscine",
        description: "Sigillante siliconico neutro monocomponente per giunti in piscine e aree permanentemente bagnate. Elevata resistenza al cloro e alla formazione di funghi.",
        technicalData: [
            { label: "Base chimica", value: "Silicone neutro" },
            { label: "Movimento capacità", value: "25%" },
            { label: "Resistenza funghi", value: "Eccellente" }
        ],
        imageType: "cartridge"
    },

    // Edilizia Pesante
    {
        name: "Sika MonoTop®-440 Agile",
        subtitle: "Malta strutturale rapida R4",
        sku: "SKU: MONO440",
        price: "21.00",
        unit: "Sacco 25kg",
        stock: 120,
        categorySlug: "edilizia",
        description: "Malta cementizia strutturale monocomponente, fibrorinforzata, a presa semi-rapida, per il ripristino del calcestruzzo. Classe R4.",
        technicalData: [
            { label: "Classe", value: "R4 (EN 1504-3)" },
            { label: "Spessore", value: "Fino a 50 mm per mano" },
            { label: "Presa", value: "Semi-rapida" }
        ],
        imageType: "mortar"
    },
    {
        name: "SikaGrout®-312 RFA",
        subtitle: "Malta colabile fibrorinforzata",
        sku: "SKU: GROUT312",
        price: "19.50",
        unit: "Sacco 25kg",
        stock: 90,
        categorySlug: "edilizia",
        description: "Malta cementizia colabile, espansiva, fibrorinforzata per ancoraggi di precisione e ripristini strutturali di pilastri e travi.",
        technicalData: [
            { label: "Fluidità", value: "Ottima" },
            { label: "Resistenza a compressione", value: "> 60 MPa a 28gg" },
            { label: "Espansione", value: "Controllata" }
        ],
        imageType: "mortar"
    }
];

// Helper to map imageType to file path
function getImagePath(type) {
    const map = {
        'paint': './public/img/cat_paint.png', // Fallback/reuse
        'mortar': './public/img/prod_mortar.png',
        'bucket': './public/img/cat_insulation.png', // Reuse bucket image
        'resin_kit': './public/img/prod_sealant.png', // Reuse kit image
        'cartridge': './public/img/prod_sealant.png' // Reuse sealant
    };
    return map[type] || './public/img/prod_mortar.png';
}

async function seed() {
    try {
        console.log('Fetching Categories...');
        const catRes = await fetch(`${STRAPI_URL}/api/categories`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const catData = await catRes.json();
        const categories = catData.data;

        console.log(`Found ${categories.length} categories.`);

        for (const product of products) {
            // Find category ID
            const category = categories.find(c => c.slug === product.categorySlug);
            if (!category) {
                console.warn(`Category ${product.categorySlug} not found for ${product.name}`);
                continue;
            }

            console.log(`Creating product: ${product.name}`);

            // 1. Create Product Entry
            const productPayload = {
                data: {
                    name: product.name,
                    subtitle: product.subtitle,
                    sku: product.sku,
                    price: parseFloat(product.price),
                    stock: product.stock,
                    description: product.description,
                    technical_data: product.technicalData,
                    category: category.id,
                    availability: "Disponibile",
                    slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                }
            };

            const prodRes = await fetch(`${STRAPI_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify(productPayload)
            });

            if (!prodRes.ok) {
                console.error(`Failed to create product ${product.name}: ${await prodRes.text()}`);
                continue;
            }

            const prodJson = await prodRes.json();
            const productId = prodJson.data.documentId || prodJson.data.id; // Compatibility
            console.log(`Created product ID: ${productId}`);

            // 2. Upload Image
            const imagePath = getImagePath(product.imageType);
            if (fs.existsSync(imagePath)) {
                // Node 18+ native FormData requires Blob
                const fileBlob = await fs.openAsBlob(imagePath);

                const form = new FormData();
                form.append('files', fileBlob, path.basename(imagePath));
                form.append('ref', 'api::product.product');
                form.append('refId', prodJson.data.id);
                form.append('field', 'image');

                const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        // Native fetch sets Content-Type automatically for FormData
                    },
                    body: form
                });

                if (uploadRes.ok) {
                    console.log(`Image uploaded for ${product.name}`);
                } else {
                    console.error(`Image upload failed: ${await uploadRes.text()}`);
                }
            } else {
                console.warn(`Image file not found: ${imagePath}`);
            }
        }

        console.log('Seeding completed!');

    } catch (error) {
        console.error('Seeding error:', error);
    }
}

seed();
