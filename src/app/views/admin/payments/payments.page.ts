import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SegmentCustomEvent, DatetimeCustomEvent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonGrid, IonCol, IonRow, IonDatetimeButton, IonDatetime, IonModal
} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';

import { ExportXLSXService } from 'src/app/services/utilities/exportXLSX.service';
import { PaymentAsReport } from 'src/interfaces/Payment.model';
@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonModal, IonDatetime, IonDatetimeButton,

    ReactiveFormsModule,
    IonRow, IonCol, IonGrid,
    IonButton, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    DataTableComponent,

  ],
  providers: [
  ]
})
export class PaymentsPage {

  nextId = signal<number>(0);

  dataTable = viewChild.required<DataTableComponent<PaymentAsReport>>("dataTable");

  pageSize = 100;

  nameElement: string = 'Payments';
  descriptionElement = 'Payments that have been made by the users of the platform, after they request a service.';

  canCreate = true;

  private exportXLSXService = inject(ExportXLSXService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");

  filterDate = signal<string>((new Date()).toISOString());

  columns: ColumnDataTable<PaymentAsReport>[] = [
    { title: "ID", key: "id", type: ColumnType.String },
    { title: "Created at", key: "createdAt", type: ColumnType.Date },
    { title: "Status", key: "status", type: ColumnType.String },
    { title: "Amount", key: "amount", type: ColumnType.String },
    { title: "Amount capturable", key: "amount_capturable", type: ColumnType.String },
    { title: "Amount received", key: "amount_received", type: ColumnType.String },
    { title: "Application fee amount", key: "application_fee_amount", type: ColumnType.String },
    { title: "Currency", key: "currency", type: ColumnType.String },
    { title: "Order ID", key: "orderId", type: ColumnType.String },
  ]

  actionOptions: ActionTable[] = [ActionTable.Edit, ActionTable.Delete];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

  sortColumn = signal<keyof PaymentAsReport>("createdAt");
  sortDirection = signal<'desc' | 'asc'>("desc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions: (keyof PaymentAsReport)[] = ['id', 'createdAt', 'amount', 'orderId', 'status'];

  categoryInUpdate = signal<PaymentAsReport | null>(null)

  // constructor() {
  //   this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });
  // }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }


  async performAction(action: ActionTable, order: PaymentAsReport) {
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
      this.nameElement
    );
  }

  filterByDateChanged(event: DatetimeCustomEvent) {
    if (typeof event.detail.value === "string"){
      let date = new Date(event.detail.value);
      this.filterDate.set(date.toISOString());
    }
  }
}
