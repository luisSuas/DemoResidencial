import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SegmentCustomEvent,
  
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonGrid, IonCol, IonRow, IonModal, IonIcon, IonLabel, IonSegmentButton, IonSegment} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import { FormInput } from 'src/interfaces/interface/FormInput';
import { DataTableService } from 'src/app/services/utilities/dataTable.service';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';
import { lastValueFrom } from 'rxjs';
import { ZipCode } from 'src/interfaces/ZipCode.model';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Factor, FactorCreation, FactorType } from 'src/interfaces/Factor.model';
import { FactorService } from 'src/app/services/api/factor.service';

type PriceOnTable = {
  ZipCode: ZipCode;
  zipCode: string;
  [key: string]: number | string | ZipCode;
}

@Component({
  selector: 'app-factor',
  templateUrl: './factor.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonSegment, IonSegmentButton, IonLabel,
    IonIcon, IonModal,
    IonRow, IonCol, IonGrid,
    IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    DataTableComponent,
    SearchbarTable,
    FormComponent,
    MatTableModule,
    MatPaginatorModule],
  providers: [
  ]
})
export class FactorPage {

  segment = signal<FactorType>(FactorType.Experience);

  extraQueries = computed<{ [key: string]: string | number }>(() => {
    console.log("extraQueries" + this.segment())
    return {
      segment: this.segment()
    }
  })

  nextId = signal<number>(0);

  dataTable = viewChild.required<DataTableComponent<Factor>>("dataTable");

  pageSize = 100;

  nameElement: string = 'Factors';
  descriptionElement = 'Factors are values that affect unitary price for a service, it can be a range of values or a single value. Please, try to be as specific as possible and not repeat, ambiguous or generic factors, system will not review the factors, so be careful with the values you add.';

  canCreate = true;

  modalCreateEdit = viewChild.required<IonModal>("modalCreateEdit");


  private factorService = inject(FactorService);
  private dataTableService = inject(DataTableService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");

  fields: FormInput<Factor>[] = [
    // Create form inputs here, for Factor Attributes, with the following fields: code (a reference string), minValue (if necessary the left value for range), maxValue (if necessary the right value for range), factor (0 to 1 as percentage) and type (Experience or Reviews)
    {
      key: "code",
      label: "Code (Reference)",
      helperText: "This is the reference code for the factor",
      type: ColumnType.String,
      required: true,
      canShowField: true,
      validators: [Validators.required]
    },
    {
      key: "minValue",
      label: "Min Value (Optional)",
      helperText: "This is the minimum value for the range, if it is not a range, leave it empty",
      type: ColumnType.Number,
      required: false,
      canShowField: true,
      validators: [Validators.min(0)]
    },
    {
      key: "maxValue",
      label: "Max Value (Optional)",
      helperText: "This is the maximum value for the range, if it is not a range, leave it empty",
      type: ColumnType.Number,
      required: false,
      canShowField: true,
      validators: [Validators.min(0)]
    },
    {
      key: "factor",
      label: "Factor to Add",
      helperText: "This is the factor to add to the unitary price, it must be between 0 and 1",
      type: ColumnType.Number,
      required: true,
      canShowField: true,
      validators: [Validators.required, Validators.min(-1), Validators.max(1)]
    },
    {
      key: "type",
      label: "Type",
      type: ColumnType.Select,
      required: true,
      canShowField: true,
      validators: [Validators.required],
      options: [
        { value: FactorType.Experience, label: "Experience" },
        { value: FactorType.Reviews, label: "Reviews" }
      ]
    }
  ];

  columns: ColumnDataTable<Factor>[] = []

  actionOptions: ActionTable[] = [ActionTable.Edit, ActionTable.Delete];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

  sortColumn = signal<keyof Factor>("code");
  sortDirection = signal<'desc' | 'asc'>("asc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions: (keyof Factor)[] = ['code', 'minValue', 'maxValue', 'factor'];

  factorInUpdate = signal<Factor | null>(null)

  constructor() {
    this.columns = this.dataTableService.convertFieldsToColumns(this.fields)
    this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });

  }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }

  async save(event: FactorCreation) {
    this.processInProgress.set(true);
    let category = this.factorInUpdate();
    if (category) {
      try {
        await lastValueFrom(this.factorService.update(category.id, event))
        this.modalCreateEdit().dismiss()
        this.toastService.presentToast("Update done!");
      } catch (error) {

      } finally {
        this.processInProgress.set(false);
      }

    } else {
      this.factorService.create(event).subscribe({
        next: (response) => {
          this.modalCreateEdit().dismiss();
          this.toastService.presentToast("Created correctly");
          this.dataTable().reload();
        },
        complete: () => {
          this.processInProgress.set(false);
        }
      })
    }
  }

  async performAction(action: ActionTable, factor: Factor) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {
        case ActionTable.Edit:
          this.processInProgress.set(false);
          this.factorInUpdate.set(factor);
          this.actionName.set("Edit");
          this.isUpdating.set(true);
          await this.modalCreateEdit().present();
          await this.modalCreateEdit().onWillDismiss();
          this.dataTable().reload();
          break;
        case ActionTable.Delete:
          let response = await lastValueFrom(this.factorService.delete(factor.id))
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
    this.segment.set(event.detail.value as FactorType)
  }
}
