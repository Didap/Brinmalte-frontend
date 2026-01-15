export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customer: string;
    email: string;
    status: 'Completed' | 'Processing' | 'Cancelled';
    amount: number;
    date: string;
    items: OrderItem[];
}

const today = new Date();
const getDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0] || ''; // YYYY-MM-DD
};

export const orders: Order[] = [
    {
        id: 'ORD-7829',
        customer: 'Mario Rossi',
        email: 'mario.rossi@example.com',
        status: 'Completed',
        amount: 120.50,
        date: getDate(1),
        items: [
            { name: 'Sika MonoTop®-627 HP', quantity: 2, price: 24.50 },
            { name: 'Sika® Ceram-255 StarFlex', quantity: 3, price: 18.50 },
            { name: 'Spatola', quantity: 1, price: 16.00 }
        ]
    }, // Yesterday
    {
        id: 'ORD-7830',
        customer: 'Luigi Verdi',
        email: 'luigi.verdi@example.com',
        status: 'Processing',
        amount: 450.00,
        date: getDate(3),
        items: [
            { name: 'SikaTop® Seal-107', quantity: 5, price: 42.00 },
            { name: 'Sikalastic®-612', quantity: 2, price: 68.90 },
            { name: 'Pennello', quantity: 2, price: 5.50 },
            { name: 'Tuta protettiva', quantity: 10, price: 9.12 }
        ]
    }, // 3 days ago
    {
        id: 'ORD-7831',
        customer: 'Anna Bianchi',
        email: 'anna.bianchi@example.com',
        status: 'Cancelled',
        amount: 89.90,
        date: getDate(15),
        items: [
            { name: 'Sika® Ceram-255 StarFlex', quantity: 4, price: 18.50 },
            { name: 'Secchio', quantity: 1, price: 15.90 }
        ]
    }, // 15 days ago
    {
        id: 'ORD-7832',
        customer: 'Paolo Neri',
        email: 'paolo.neri@example.com',
        status: 'Completed',
        amount: 1200.00,
        date: getDate(45),
        items: [
            { name: 'Sika MonoTop®-627 HP', quantity: 40, price: 24.50 },
            { name: 'Trasporto', quantity: 1, price: 220.00 }
        ]
    }, // 45 days ago
    {
        id: 'ORD-7833',
        customer: 'Giulia Gialli',
        email: 'giulia.gialli@example.com',
        status: 'Processing',
        amount: 340.20,
        date: getDate(200),
        items: [
            { name: 'SikaTop® Seal-107', quantity: 8, price: 42.00 },
            { name: 'Guanti', quantity: 4, price: 1.05 }
        ]
    }, // 200 days ago
];
