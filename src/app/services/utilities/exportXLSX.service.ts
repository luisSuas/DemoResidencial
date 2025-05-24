import { Injectable } from '@angular/core';
import { read, utils, WorkBook, WorkSheet, writeFile } from 'xlsx';


@Injectable({
    providedIn: 'root'
})
export class ExportXLSXService {
    exportXLSX(header: string[], data: any[], name: string) {
        const wb = utils.book_new();
        const ws: WorkSheet = utils.json_to_sheet([]);

        // Header are keys of data, but they could be in different order, so we need to sort them to match the header order to the data order
        const dataSorted = data.map((item) => {
            const newItem: any = {};
            header.forEach((key) => {
                newItem[key] = item[key];
            });
            return newItem;
        });

        utils.sheet_add_aoa(ws, [header], { origin: 'A1' });
        utils.sheet_add_json(ws, dataSorted, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, name);
        writeFile(wb, name + ".xlsx")
    }


    async importXLSX<T extends any>(
        file: File,
        header: string[],
        fileInput: HTMLInputElement | undefined) {
        return new Promise<T[]>(async (resolve, reject) => {
            if (fileInput)
                fileInput.value = "";
            const reader: FileReader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async (e: any) => {

                const binarystr: string = e.target.result
                const wb: WorkBook = read(binarystr, {
                    type: 'buffer', cellDates: true,
                });

                const wsname: string = wb.SheetNames[0];
                const ws: WorkSheet = wb.Sheets[wsname];

                var list: T[] = utils.sheet_to_json(ws, {
                    header,
                });

                list.splice(0, 1)
                resolve(list);
            };
        });
    }
}