import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SelectCustomEvent,
  IonSelect, IonSelectOption, IonInput,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonGrid, IonCol, IonRow, IonProgressBar
} from '@ionic/angular/standalone';
import { ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { firstValueFrom, map } from 'rxjs';
import { ZipCode } from 'src/interfaces/ZipCode.model';

import { ZipCodeService } from 'src/app/services/api/zipCode.service';
import { CategoryService } from 'src/app/services/api/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PriceService } from 'src/app/services/api/prices.service';
import { Price } from 'src/interfaces/Price.model';
import { Category } from 'src/interfaces/Category.model';
import { AlertsService } from 'src/app/services/utilities/alerts.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

type PriceOnTable = {
  ZipCode: ZipCode;
  zipCode: string;
  [key: string]: number | string | ZipCode;
}

@Component({
  selector: 'app-prices',
  templateUrl: './prices.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonProgressBar,
    ReactiveFormsModule,
    IonRow, IonCol, IonGrid, IonInput,
    IonButton, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    IonSelect, IonSelectOption,
    SearchbarTable,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    
  ],
  providers: [
  ]
})
export class PricesPage {


  paginator = viewChild.required<MatPaginator>("paginator");

  private alertService = inject(AlertsService);

  private categoryService = inject(CategoryService);
  private priceService = inject(PriceService);
  private toastService = inject(ToastService);
  private zipCodeService = inject(ZipCodeService);

  ColumnType = ColumnType;

  basecolumns = ["code", "city", "state"]
  columns: string[] = []

  categories = toSignal(this.categoryService.get("name", "asc", "", 1, 10000).pipe(map(x => x.rows)), {
    initialValue: []
  });
  categoriesSelected = signal<Category[]>([]);
  zipCodes = signal<ZipCode[]>([]);

  processInProgress = signal<boolean>(false);

  searchText: string = ""

  dataSource: MatTableDataSource<PriceOnTable> = new MatTableDataSource<PriceOnTable>();

  changeSearthTextToTable(event: string) {
    this.searchText = event;
    this.dataSource.paginator?.firstPage();
    this.categorySelected();
  }

  async ngOnInit() {
    this.dataSource.paginator = this.paginator();
  }

  async categorySelected(event?: SelectCustomEvent) {
    let categories: number[] = event ? event.detail.value : this.categoriesSelected().map(x => x.id);
    console
    if (event) {
      this.categoriesSelected.set(this.categories().filter(x => categories.includes(x.id)))
    }

    if (!this.searchText.length) {
      this.alertService.presentAlert("Error", "You must enter a zip code, city or state to load prices", "Ok")
      return
    }

    this.processInProgress.set(true);

    let response = await firstValueFrom(this.zipCodeService.get("code", "asc", this.searchText, 1, 2000, undefined))
    this.zipCodes.set(response.rows);


    this.columns = this.basecolumns.concat(categories.map(x => "price_" + x))
    console.log(this.columns)
    let allPrices = await firstValueFrom(this.priceService.getAll(categories, response.rows.map(x => x.code)))
    allPrices.map(x => {
      x.ZipCode = response.rows.find(y => y.code === x.zipCode)
      return x
    })

    let pricesOnTable: PriceOnTable[] = response.rows.map(x => {
      let pricesOnZipCode = allPrices.filter(y => y.zipCode === x.code)
      let data: PriceOnTable = {
        ZipCode: x,
        zipCode: x.code,
      }
      categories.forEach(category => {
        let priceCategory = pricesOnZipCode.find(y => y.categoryId === category)
        data["price_" + category] = priceCategory ? priceCategory.price : 0
      })
      return data;
    })
    this.dataSource.data = pricesOnTable;
    this.processInProgress.set(false);
  }

  async savePrice(priceOnTable: PriceOnTable, categoryId: number) {

    try {
      let priceValue = priceOnTable["price_" + categoryId]
      if (typeof priceValue !== "number" || priceValue < 0)
        throw "Price must be a number greater than 0"
      let price: Price = {
        categoryId: categoryId,
        zipCode: priceOnTable.zipCode,
        price: priceValue
      }
      this.processInProgress.set(true);
      await firstValueFrom(this.priceService.createUpdate(price))
      this.toastService.presentToast("Price saved correctly")
    } catch (error) {

      this.alertService.displayError(error)
    } finally {
      this.processInProgress.set(false);
    }
  }

  async setAllPrices(category: Category) {
    let value = await this.alertService.presentAlertPrompt<number>(`Would you like to set all prices for ${category.name} to a value?`, "Set all prices, will use the same value for every zip code, city or state, present at this moment", "number", "Value on dollars", 0)

    if (value === null || isNaN(value))
      return

    this.processInProgress.set(true);
    for (let index = 0; index < this.dataSource.data.length; index++) {
      const priceOnTable = this.dataSource.data[index];
      console.log(priceOnTable)
      let price: Price = {
        categoryId: category.id,
        zipCode: priceOnTable.zipCode,
        price: parseFloat("" + value)
      }
      try {
        await firstValueFrom(this.priceService.createUpdate(price))
        this.toastService.presentToast("Price saved correctly for " + priceOnTable.zipCode + ` (${index + 1} of ${this.dataSource.data.length})`)
      } catch (error) {
        this.alertService.displayError(error)
      }
    }
    this.processInProgress.set(false);
    this.dataSource.paginator?.firstPage();
    this.categorySelected();
  }
}
