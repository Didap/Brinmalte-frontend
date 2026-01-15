export interface Customer {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Inactive' | 'Blocked';
    spent: number;
    orders: number;
    avatar: string;
}

export const customers: Customer[] = [
    { id: 'CST-001', name: 'Mario Rossi', email: 'mario.rossi@example.com', status: 'Active', spent: 1200.50, orders: 5, avatar: 'MR' },
    { id: 'CST-002', name: 'Luigi Verdi', email: 'luigi.verdi@example.com', status: 'Active', spent: 2450.00, orders: 12, avatar: 'LV' },
    { id: 'CST-003', name: 'Anna Bianchi', email: 'anna.bianchi@example.com', status: 'Inactive', spent: 450.00, orders: 2, avatar: 'AB' },
    { id: 'CST-004', name: 'Paolo Neri', email: 'paolo.neri@example.com', status: 'Active', spent: 890.20, orders: 8, avatar: 'PN' },
    { id: 'CST-005', name: 'Giulia Gialli', email: 'giulia.gialli@example.com', status: 'Blocked', spent: 0.00, orders: 0, avatar: 'GG' },
];
