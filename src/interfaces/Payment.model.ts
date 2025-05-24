import { BaseTimestamps } from "./baseTimestamps.model";


export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export interface Payment extends BaseTimestamps {
    id: number;
    "amount": number,
    "amount_capturable": number
    "amount_received": number
    "application_fee_amount": number
    "canceled_at": null | Date
    "cancellation_reason": string | null

    "currency": "usd",
    status: PaymentStatus

    orderId: number
}

export interface PaymentAsReport extends Payment {
}