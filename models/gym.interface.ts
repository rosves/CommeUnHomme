export interface Gym {
    _id?: string;
    name: string;
    address: {
        street: string;
        zipCode: string;
        city: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
    };
    description: string;
    capacity: number;
    installations: string[]; 
    equipment: string[];
    activities: string[];
    isApproved: boolean;
    ownerId: string;
}