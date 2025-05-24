
import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";

import { ColumnType } from "./ColumnDataTable";

export interface FormInput<T> {
    key: keyof T;
    required: boolean;
    type: ColumnType;
    label: string;
    placeholder?: string;
    options?: FormOption[];
    textFieldType?: ColumnType
    min?: number
    max?: number
    default?: any
    validators?: ValidatorFn[] | AsyncValidatorFn[]

    helperText?: string

    multiple?: boolean

    canShowField?: boolean
    editable?: boolean
    expectedValue?: any
    expectedValueField?: string

    formatsAccepted?: string[]
}


export enum FormType {
    "Generar Orden Traída por Cliente" = "1"
}

export interface Form<T> {
    title: string;
    fields: FormInput<T>[]
}

export interface FormOption {
    value?: string | number
    label: string
}
