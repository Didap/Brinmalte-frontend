// Native fetch in Node 18+

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = '1715e0aef3f2f3117cd0e7d5bd8430964bc30a9f7559ad38be0b0b0798cf844efbd78fbcad60058bbf6c7284272e0d51b8eb3a585fd80d4b4c305df9f1c730004b9ce177b8b0b592ba0ed2791d509417bc1abc1b1c064c675d43a5acb7da02c416180df0347a34076ef3e4ce2c2fb774f78e2797a74ff44b69c327ea6615e65e';

const categories = [
    {
        name: "Colorificio",
        slug: "colorificio",
        description: "Il vostro punto di riferimento per la colorazione e la protezione. Rivenditori ufficiali Sika, offriamo un'ampia gamma di soluzioni per impermeabilizzazione, sigillatura e una vasta selezione di vernici per interni ed esterni."
    },
    {
        name: "Cappotto Termico",
        slug: "cappotto-termico",
        description: "Soluzione all'avanguardia per l'isolamento che garantisce prestazioni energetiche ottimali. Materiali isolanti di ultima generazione che riducono i consumi e valorizzano l'immobile."
    },
    {
        name: "Cartongesso",
        slug: "cartongesso",
        description: "Soluzioni rapide e pulite per la ridistribuzione degli spazi, controsoffitti e pareti. Flessibilità progettuale, isolamento termo-acustico e finiture estetiche impeccabili."
    },
    {
        name: "Pavimenti in Resina",
        slug: "resina",
        description: "Pavimentazioni d'avanguardia che uniscono estetica e funzionalità. Soluzione duratura, elegante e senza fughe, ideale per qualsiasi ambiente con resistenza superiore."
    },
    {
        name: "Piscine",
        slug: "piscine",
        description: "Costruzione di piscine con cura di ogni dettaglio, dalla progettazione alla posa. Migliori tecnologie per il trattamento dell'acqua e l'impermeabilizzazione Sika."
    },
    {
        name: "Edilizia Pesante",
        slug: "edilizia",
        description: "Riferimento per materiali edili di qualità. Soluzioni all'avanguardia per l'edilizia e la manutenzione industriale, dai cementi ai collanti, garantendo innovazione e affidabilità."
    }
];

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
