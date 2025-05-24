import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SegmentCustomEvent, DatetimeCustomEvent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonGrid, IonCol, IonRow, IonLabel, IonChip, IonDatetimeButton, IonModal, IonDatetime
} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';
import { FormInput } from 'src/interfaces/interface/FormInput';
import { DataTableService } from 'src/app/services/utilities/dataTable.service';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';

import { Order, OrderAsReport } from 'src/interfaces/Order.model';
import { ExportXLSXService } from 'src/app/services/utilities/exportXLSX.service';

@Component({
  selector: 'app-orders',
  styleUrls: ['./orders.page.scss'],
  templateUrl: './orders.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonDatetime, IonModal, IonDatetimeButton, IonChip,
    ReactiveFormsModule,
    IonLabel,
    IonRow, IonCol, IonGrid,
    IonButton, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    DataTableComponent,
    SearchbarTable],
  providers: [
  ]
})
export class OrdersPage {

  nextId = signal<number>(0);

  dataTable = viewChild.required<DataTableComponent<Order>>("dataTable");

  pageSize = 100;

  nameElement: string = 'Orders';
  descriptionElement = 'Orders are used to determine the type of work that the worker user can perform, within a radius of longitude and latitude relative to the area code. Please, try to be as specific as possible and not repeat, ambiguous or generic orders.';

  canCreate = true;

  statusValueLabel = signal<{ label: string, selected: boolean, key: string }[]>([
    { label: 'Draft', selected: false, key: 'DRAFT' },
    { label: 'Created', selected: false, key: 'CREATED' },
    { label: 'Accepted', selected: false, key: 'ACCEPTED' },
    { label: 'Rejected', selected: false, key: 'REJECTED' },
    { label: 'On the way', selected: false, key: 'ON THE WAY' },
    { label: 'In progress', selected: false, key: 'IN_PROGRESS' },
    { label: 'Finished', selected: false, key: 'FINISHED' },
    { label: 'Reviewed', selected: false, key: 'REVIEWED' },
    { label: 'Rescheduled by worker', selected: false, key: 'RESCHDULED_BY_WORKER' },
    { label: 'Rescheduled by home owner', selected: false, key: 'RESCHDULED_BY_HOME_OWNER' },
    { label: 'Canceled before accepted', selected: false, key: 'CANCELED_BEFORE_ACCEPTED' },
    { label: 'Canceled not refunded', selected: false, key: 'CANCELED_NOT_REFUNDED' },
    { label: 'Canceled refunded', selected: false, key: 'CANCELED_REFUNDED' },
    { label: 'Public', selected: false, key: 'PUBLIC' }
  ]);

  statusSelected = computed(() => {
    let status = this.statusValueLabel();
    if (status.length)
      return status.filter(value => value.selected).map(value => value.key).join(",")
    return "";
  })

  private dataTableService = inject(DataTableService);
  private exportXLSXService = inject(ExportXLSXService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");
  filterDate = signal<string | null>(null);

  fields: FormInput<OrderAsReport>[] = [
    {
      key: "description",
      label: "Description",
      type: ColumnType.String,
      required: true,
      validators: []
    },
    {
      key: "date",
      label: "Date",
      type: ColumnType.Date,
      required: true,
      validators: []
    },
    {
      key: "status",
      label: "Status",
      type: ColumnType.Select,
      required: true,
      validators: [],
    },
    {
      key: "requiredHours",
      label: "Required Hours",
      type: ColumnType.Number,
      required: true,
      validators: []
    },
    {
      key: "priceRate",
      label: "Price Rate",
      type: ColumnType.Number,
      required: true,
      validators: []
    },
    {
      key: "estimatedPrice",
      label: "Estimated Price",
      type: ColumnType.Number,
      required: true,
      validators: []
    }, {
      key: "category",
      label: "Category",
      type: ColumnType.Select,
      required: true,
      validators: []
    }
  ];

  columns: ColumnDataTable<OrderAsReport>[] = []

  actionOptions: ActionTable[] = [];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

  sortColumn = signal<keyof Order>("date");
  sortDirection = signal<'desc' | 'asc'>("desc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions: (keyof Order)[] = ['id', 'date', 'status'];

  categoryInUpdate = signal<Order | null>(null)

  constructor() {

    this.columns = this.dataTableService.convertFieldsToColumns(this.fields)
    // this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });

  }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }


  async performAction(action: ActionTable, order: Order) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {

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

  // presentCreationModal() {
  //   this.actionName.set("Create");
  //   this.isUpdating.set(false);
  //   this.modalCreateEdit().present();
  // }

  segmentChanged(event: SegmentCustomEvent) {
    console.log(event.detail.value)
  }

  async export() {
    let data = await this.dataTable().dataSource.data;
    this.exportXLSXService.exportXLSX(
      this.columns.map(column => column.key).filter(key => key !== "actions"),
      data,
      "Orders"
    );
  }

  statusChanged(key: string) {
    this.statusValueLabel.update(values => {
      let index = values.findIndex(value => value.key === key);
      if (index >= 0) {
        values[index].selected = !values[index].selected;
      }
      return [...values];
    });
  }

  filterByDateChanged(event: DatetimeCustomEvent) {
    if (typeof event.detail.value === "string") {
      let date = new Date(event.detail.value);
      console.log(date.toISOString())
      this.filterDate.set(date.toISOString());
    }
  }
}
