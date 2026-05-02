import Dexie, { Table } from 'dexie';

export interface PendingSale {
    id: string; // uuid
    contact_id: string;
    total_amount: number;
    items: any[]; // JSON
    sale_date: string;
    created_at: number;
    sync_status: 'pending' | 'synced' | 'failed';
}

export interface OfflineContact {
    name: string; // Frappe PK (was `id` with Supabase)
    full_name: string;
    type: string;
    city: string;
}

export class MandiDatabase extends Dexie {
    sales!: Table<PendingSale>;
    contacts!: Table<OfflineContact>;

    constructor() {
        super('MandiOS_DB');

        this.version(1).stores({
            sales: 'id, created_at, sync_status',
            contacts: 'id, name, type',
        });

        this.version(2).stores({
            sales: 'id, created_at, sync_status',
            contacts: null, // delete old table
            frappe_contacts: 'name, full_name, type', // New table with new PK
        });
        
        // Map the property to the new table
        this.contacts = this.table('frappe_contacts');
    }
}

export const db = new MandiDatabase();
