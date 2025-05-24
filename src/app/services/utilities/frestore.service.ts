import { Injectable } from "@angular/core";
import { Timestamp } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class FirestoreUtilitiesService {

    convertTimestampToDate<T = object>(data: T[]) {
        if (!data || data.length === 0) return data;
        let keys: (keyof T)[] = Object.keys(data[0] as any) as (keyof T)[]
        data.map((item) => {
            for (const key of keys) {
                const element = item[key];
                if (element instanceof Timestamp) {
                    item[key] = element.toDate() as any;
                }
            }
            return item;
        })
        return data;
    }
}