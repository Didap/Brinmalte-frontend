export interface Product {
    id: number;
    name: string;
    subtitle: string;
    sku: string;
    price: string;
    unit: string;
    availability: string;
    image: string;
    description: string;
    features: string[];
    technicalData: { label: string; value: string }[];
    documents: { name: string; size?: string; type?: string; url?: string }[];
    stock: number;
    categoryId?: number;
    category?: {
        slug: string;
        name: string;
    } | null;
}

export const products: Product[] = [
    {
        id: 1,
        name: "Sika MonoTop®-627 HP",
        subtitle: "Malta strutturale R4 ad alte prestazioni, fibrorinforzata",
        sku: "SKU: 627HP-25",
        price: "24.50",
        unit: "Sacco 25kg",
        availability: "Disponibile (20 pz)",
        stock: 20,
        image: "/img/prod_mortar.png",
        description: "Malta cementizia monocomponente, fibrorinforzata, a ritiro compensato e alte prestazioni meccaniche. Ideale per il ripristino strutturale del calcestruzzo.",
        features: [
            "Classe R4 secondo EN 1504-3",
            "Alta resistenza ai solfati",
            "Applicabile a spruzzo o cazzuola",
            "Ottima lavorabilità"
        ],
        technicalData: [
            { label: "Base chimica", value: "Cemento Portland, additivi, fibre" },
            { label: "Granulometria", value: "3 mm" },
            { label: "Spessore strato", value: "Min 10 mm / Max 80 mm" },
            { label: "Temp. applicazione", value: "+5°C / +35°C" }
        ],
        documents: [
            { name: "Scheda Dati Prodotto", size: "PDF - 450 KB", type: "PDS" },
            { name: "Scheda di Sicurezza", size: "PDF - 280 KB", type: "SDS" }
        ]
    },
    {
        id: 2,
        name: "SikaTop® Seal-107",
        subtitle: "Malta impermeabilizzante bicomponente elastica",
        sku: "SKU: SEAL107-25",
        price: "42.00",
        unit: "Kit 25kg (A+B)",
        availability: "Disponibile (50 pz)",
        stock: 50,
        image: "/img/prod_sealant.png",
        description: "Malta cementizia bicomponente a basso modulo elastico, contenente polimeri liquidi e additivi speciali. Ideale per impermeabilizzare balconi, terrazze, bagni e piscine.",
        features: [
            "Impermeabile all'acqua",
            "Permeabile al vapore acqueo",
            "Ottima adesione su calcestruzzo",
            "Protegge dai sali disgelanti"
        ],
        technicalData: [
            { label: "Base chimica", value: "Comp A: Liquido / Comp B: Polvere" },
            { label: "Densità malta fresca", value: "~ 2.0 kg/l" },
            { label: "Spessore strato", value: "Min 1.5 mm / Max 3.0 mm (in 2 mani)" },
            { label: "Temp. applicazione", value: "+8°C / +35°C" }
        ],
        documents: [
            { name: "Scheda Dati Prodotto", size: "PDF - 520 KB", type: "PDS" },
            { name: "Dichiarazione di Prestazione", size: "PDF - 150 KB", type: "DoP" }
        ]
    },
    {
        id: 3,
        name: "Sikalastic®-612",
        subtitle: "Membrana liquida poliuretanica monocomponente",
        sku: "SKU: L612-5",
        price: "68.90",
        unit: "Lattha 5L",
        availability: "Disponibile (12 pz)",
        stock: 12,
        image: "/img/prod_sealant.png", // Reusing image placeholder
        description: "Membrana liquida impermeabilizzante poliuretanica, monocomponente, igro-innescata, applicabile a freddo. Forma un rivestimento continuo e senza giunzioni.",
        features: [
            "Resistente ai raggi UV e all'ingiallimento",
            "Nessuna miscelazione richiesta",
            "Elastico anche a basse temperature",
            "Permeabile al vapore"
        ],
        technicalData: [
            { label: "Base chimica", value: "Poliuretano aromatico monocomponente" },
            { label: "Allungamento a rottura", value: "~ 150%" },
            { label: "Resistenza alla trazione", value: "~ 4 N/mm²" },
            { label: "Tempo fuori pioggia", value: "~ 3-4 ore" }
        ],
        documents: [
            { name: "Scheda Dati Prodotto", size: "PDF - 600 KB", type: "PDS" }
        ]
    },
    {
        id: 4,
        name: "Sika® Ceram-255 StarFlex",
        subtitle: "Adesivo cementizio deformabile ad alte prestazioni",
        sku: "SKU: CER255-25",
        price: "18.50",
        unit: "Sacco 25kg",
        availability: "Disponibile (100 pz)",
        stock: 100,
        image: "/img/prod_mortar.png", // Reusing image
        description: "Adesivo cementizio monocomponente, polimerico, deformabile, a scivolamento verticale nullo e tempo aperto prolungato. Classe C2TE S1.",
        features: [
            "Deformabile (S1)",
            "Tempo aperto prolungato",
            "Dust reduced (bassa emissione polvere)",
            "Per grandi formati e pavimenti riscaldanti"
        ],
        technicalData: [
            { label: "Classificazione", value: "C2 TE S1 secondo EN 12004" },
            { label: "Colore", value: "Grigio o Bianco" },
            { label: "Spessore strato", value: "Fino a 15 mm" },
            { label: "Pedonabilità", value: "Dopo 24-36 ore" }
        ],
        documents: [
            { name: "Scheda Tecnica", size: "PDF - 300 KB", type: "PDS" },
            { name: "DoP", size: "PDF - 100 KB", type: "DoP" }
        ]
    }
];
