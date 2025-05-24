import { BaseTimestamps } from "./baseTimestamps.model";

export enum OrderStatus {
    DRAFT = "DRAFT",
    CREATED = "CREATED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED", // When the worker rejects the order

    "ON THE WAY" = "ON THE WAY",
    IN_PROGRESS = "IN_PROGRESS",
    FINISHED = "FINISHED",
    REVIEWED = "REVIEWED",

    RESCHDULED_BY_WORKER = "RESCHDULED_BY_WORKER",
    RESCHDULED_BY_HOME_OWNER = "RESCHDULED_BY_HOME_OWNER",

    CANCELED_NOT_REFUNDED = "CANCELED_NOT_REFUNDED", // When the order is canceled by the home owner or system, but the payment is not refunded
    CANCELED_REFUNDED = "CANCELED_REFUNDED" // When the order is canceled by the home owner or system, and the payment is refunded
}

export interface Order extends BaseTimestamps {
    id: number;
    description: string;
    date: Date;
    status: OrderStatus;

    requiredHours: number;
    priceRate: number;
    estimatedPrice: number;
};

export interface CategoryCreation {
    name: string;
    photoURL: string;
};

export interface OrderAsReport extends Order {
    category: string;
}