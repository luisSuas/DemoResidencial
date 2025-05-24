import { ZipCode } from "./ZipCode.model"

export interface Price {
    price: number,
    categoryId: number,
    zipCode: string

    ZipCode?: ZipCode
};