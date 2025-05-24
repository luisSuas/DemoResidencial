export enum ColumnType {
    "String" = "string",
    "Number" = "number",
    "Date" = "date",
    "Boolean" = "boolean",
    "Action" = "action",
    "Image" = "image",
    "File" = "file",
    "Select" = "select",
    "Geolocation" = "geolocation"
}

export interface ColumnDataTable<T> {
    title: string;
    key: keyof T | "actions";
    type: ColumnType;
}