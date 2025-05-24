import { BaseTimestamps } from "./baseTimestamps.model";

export enum EmailTemplateType {
    EMAIL = 'email',
    PUSH = 'push'
}

export interface EmailTemplate extends BaseTimestamps {

    code: string,
    title: string,
    message: string,
    blocked: boolean

    route: string | null,

    type: EmailTemplateType
};

export interface EmailTemplateCreation {
    code: string,
    title: string,
    message: string
};