
export enum FactorType {
    "Experience" = "Experience",
    "Reviews" = "Reviews",
}

export interface Factor {
    id: number;
    code: string;
    minValue?: number;
    maxValue?: number;
    factor: number;

    type: FactorType;
}

export interface FactorCreation {
    code: string;
    minValue?: number;
    maxValue?: number;
    factor: number;

    type: FactorType;
}