import { BaseTimestamps } from "./baseTimestamps.model";

export interface Category extends BaseTimestamps {
    id: number;
    name: string;
    photoURL: string;
    defaultOrderPhotoURL: string;
    defaultPrice: number;
    maxPrice: number;
    creator: string; // IMPLICIT RELATION WITH USER
};

export interface CategoryCreation {
    name: string;
    photoURL: string;
};