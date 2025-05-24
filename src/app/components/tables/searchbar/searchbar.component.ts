import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IonSearchbar, SearchbarCustomEvent } from "@ionic/angular/standalone";

@Component({
  selector: 'searchbar-table',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
  standalone: true,
  imports: [
    IonSearchbar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarTable {

  placeholder = input<string>('Search...');
  disabled = input<boolean>(false);

  searchText = model<string>("");

  constructor() {


    this.searchText.subscribe((value) => {
      console.log(value);
    })
  }

  searchTextChanged(event: SearchbarCustomEvent) {

    if (typeof event.detail.value === "string") {
      let newSearch = event.detail.value.trim();
      this.searchText.set(newSearch);
    }
  }

}
