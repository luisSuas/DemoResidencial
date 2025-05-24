export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    WORKER = 'worker',
}
export enum UserMode {
    "Home Owner" = "homeOwner",
    "Worker" = "worker",
}

export type ContactInfo = 'email' | 'phoneNumber';

export type User = {
    [key in ContactInfo]: string;
} & {
    displayName: string;
    photoURL?: string;
    kind: ContactInfo; role: Role;

    createdAt?: Date
    updatedAt?: Date

    blocked: boolean;
    uid: string;

};

export interface UserAsHomeOwnerForReport extends User {
    defaultAddress: string;
    defaultZipCode: string;
    defaultGeoloc: [number, number];
}

export interface UserAsWorkerForReport extends UserAsHomeOwnerForReport {
    // Woker fields
    experience?: number;
    reviewsCount?: number;
    reviewsSum?: number;
    rating?: number;
    workingCategories?: string;
    servicesNumber?: number;
}

export interface UserAsWorker extends User {
    experience: number; // in years
}

export interface UserCreation {
    name: string;
    email: string;
    role: Role;

    blocked?: boolean;
    uid: string;
}

export interface UserCreationRequest {
    uid: string,
    name: string,
    email: string
}
export interface UserUpdateRequest {
    name: string,
    email: string
}