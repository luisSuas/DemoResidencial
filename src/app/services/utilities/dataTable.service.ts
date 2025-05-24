import { Injectable } from "@angular/core";
import { ColumnDataTable } from "src/interfaces/interface/ColumnDataTable";
import { SelectableOption } from "src/interfaces/interface/SelectableOption.model";
import { FormInput } from "src/interfaces/interface/FormInput";

@Injectable({
    providedIn: 'root'
})
export class DataTableService {

    convertFieldsToColumns<T>(fields: FormInput<T>[]): ColumnDataTable<T>[] {
        return fields.map(field => {
            let column: ColumnDataTable<T> = {
                key: field.key,
                title: field.label,
                type: field.type
            }
            return column;
        })
    }

    convertFieldsToSelectableOrderOptions<T>(keys: (keyof T)[], fields: FormInput<T>[]): SelectableOption<T>[] {
        return fields
            .filter(field => keys.includes(field.key))
            .map(field => {
                let option: SelectableOption<T> = {
                    label: field.label,
                    value: field.key
                }
                return option;
            })
    }
}