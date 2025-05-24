import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SegmentCustomEvent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonGrid, IonCol, IonRow, IonModal, IonIcon} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import { FormInput } from 'src/interfaces/interface/FormInput';
import { DataTableService } from 'src/app/services/utilities/dataTable.service';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';
import { lastValueFrom } from 'rxjs';
import { ZipCode, ZipCodeCreation } from 'src/interfaces/ZipCode.model';

import { ZipCodeService } from 'src/app/services/api/zipCode.service';
@Component({
  selector: 'app-zip-codes',
  templateUrl: './zip-codes.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonIcon, IonModal,
    IonRow, IonCol, IonGrid,
    IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    DataTableComponent,
    SearchbarTable,
    FormComponent
],
  providers: [
  ]
})
export class ZipCodePage {


  dataTable = viewChild.required<DataTableComponent<ZipCode>>("dataTable");

  pageSize = 100;

  nameElement: string = 'Zip Codes';
  descriptionElement = 'Zip codes are used to determine the location of the worker user, within a radius of longitude and latitude relative to the area code.';

  canCreate = true;

  modalCreateEdit = viewChild.required<IonModal>("modalCreateEdit");

  modelFormatter: (model: ZipCode) => ZipCode = zip => {
    if (zip.geoloc) {
      let [latitude, longitude] = zip.geoloc?.coordinates
      return {
        ...zip,
        latitude, longitude
      }
    }
    return zip
  }

  private zipCodeService = inject(ZipCodeService);
  private dataTableService = inject(DataTableService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");

  fields: FormInput<ZipCode>[] = [
    { key: 'code', label: "Zip Code", editable: false, type: ColumnType.String, required: true, canShowField: true, default: '' },
    { key: 'city', label: "City", editable: true, type: ColumnType.String, required: true, canShowField: true, default: '' },
    { key: 'state', label: "State", editable: true, type: ColumnType.String, required: true, canShowField: true, default: '' },
    { key: 'latitude', label: "Latitude", editable: true, type: ColumnType.Number, required: true, canShowField: true, default: '' },
    { key: 'longitude', label: "Longitude", editable: true, type: ColumnType.Number, required: true, canShowField: true, default: '' },
  ];

  columns: ColumnDataTable<ZipCode>[] = []

  actionOptions: ActionTable[] = [ActionTable.Edit, ActionTable.Delete];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

  sortColumn = signal<keyof ZipCode>("code");
  sortDirection = signal<'desc' | 'asc'>("asc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions: (keyof ZipCode)[] = ['code', 'city', 'state'];

  zipInUpdate = signal<ZipCode | null>(null)

  constructor() {
    this.columns = this.dataTableService.convertFieldsToColumns(this.fields)
    this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });

  }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }

  async save(event: ZipCodeCreation) {
    this.processInProgress.set(true);
    if (this.zipInUpdate()) {
      try {
        await lastValueFrom(this.zipCodeService.update(event.code, event))
        this.modalCreateEdit().dismiss()
        this.toastService.presentToast("Update done!");
      } catch (error) {

      } finally {
        this.processInProgress.set(false);
      }

    } else {
      event.code = event.code.toUpperCase();

      this.zipCodeService.create(event).subscribe({
        next: (response) => {
          this.modalCreateEdit().dismiss();
          this.toastService.presentToast("Zip code created correctly");
          this.dataTable().reload();
        },
        complete: () => {
          this.processInProgress.set(false);
        }
      })
    }
  }

  async performAction(action: ActionTable, zip: ZipCode) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {
        case ActionTable.Edit:
          this.processInProgress.set(false);
          this.zipInUpdate.set(zip);
          this.actionName.set("Edit");
          this.isUpdating.set(true);
          await this.modalCreateEdit().present();
          await this.modalCreateEdit().onWillDismiss();
          this.dataTable().reload();
          break;
        case ActionTable.Delete:
          let response = await lastValueFrom(this.zipCodeService.delete(zip.code))
          if (response.message) message = response.message;
          break;
      }
      if (message) {
        this.toastService.presentToast(message);
        this.dataTable().reload();
      }
    } catch (error) {

    } finally {
      this.processInProgress.set(false);
    }
  }

  presentCreationModal() {
    this.actionName.set("Create");
    this.isUpdating.set(false);
    this.modalCreateEdit().present();
  }

  segmentChanged(event: SegmentCustomEvent) {
    console.log(event.detail.value)
  }
}
