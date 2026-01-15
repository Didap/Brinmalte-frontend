export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    heroImage: string;
    relatedProducts: number[];
    colSpan?: string;
}

export const categories: Category[] = [
    {
        id: 'colorificio',
        name: "Colorificio",
        slug: "colorificio",
        description: "Il vostro punto di riferimento per la colorazione e la protezione. Rivenditori ufficiali Sika, offriamo un'ampia gamma di soluzioni per impermeabilizzazione, sigillatura e una vasta selezione di vernici per interni ed esterni.",
        heroImage: "/img/cat_paint.png",
        relatedProducts: [1, 2],
        colSpan: 'lg:col-span-2'
    },
    {
        id: 'cappotto-termico',
        name: "Cappotto Termico",
        slug: "cappotto-termico",
        description: "Soluzione all'avanguardia per l'isolamento che garantisce prestazioni energetiche ottimali. Materiali isolanti di ultima generazione che riducono i consumi e valorizzano l'immobile.",
        heroImage: "/img/cat_insulation.png",
        relatedProducts: [1, 4],
        colSpan: 'lg:col-span-1'
    },
    {
        id: 'cartongesso',
        name: "Cartongesso",
        slug: "cartongesso",
        description: "Soluzioni rapide e pulite per la ridistribuzione degli spazi, controsoffitti e pareti. Flessibilità progettuale, isolamento termo-acustico e finiture estetiche impeccabili.",
        heroImage: "/img/cat_drywall.png",
        relatedProducts: [1],
        colSpan: 'lg:col-span-1'
    },
    {
        id: 'resina',
        name: "Pavimenti in Resina",
        slug: "resina",
        description: "Pavimentazioni d'avanguardia che uniscono estetica e funzionalità. Soluzione duratura, elegante e senza fughe, ideale per qualsiasi ambiente con resistenza superiore.",
        heroImage: "/img/cat_resin.png",
        relatedProducts: [2, 3],
        colSpan: 'lg:col-span-1'
    },
    {
        id: 'piscine',
        name: "Piscine",
        slug: "piscine",
        description: "Costruzione di piscine con cura di ogni dettaglio, dalla progettazione alla posa. Migliori tecnologie per il trattamento dell'acqua e l'impermeabilizzazione Sika.",
        heroImage: "/img/cat_pool.png",
        relatedProducts: [2],
        colSpan: 'lg:col-span-1'
    },
    {
        id: 'edilizia',
        name: "Edilizia Pesante",
        slug: "edilizia",
        description: "Riferimento per materiali edili di qualità. Soluzioni all'avanguardia per l'edilizia e la manutenzione industriale, dai cementi ai collanti, garantendo innovazione e affidabilità.",
        heroImage: "/img/prod_mortar.png",
        relatedProducts: [1, 2, 4],
        colSpan: 'lg:col-span-2'
    }
];
