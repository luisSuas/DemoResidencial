import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SegmentCustomEvent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonGrid, IonCol, IonRow, IonLabel, IonSegmentButton, IonSegment
} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';
import { FormInput } from 'src/interfaces/interface/FormInput';
import { DataTableService } from 'src/app/services/utilities/dataTable.service';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';
import { lastValueFrom } from 'rxjs';

import { Role, User, UserAsHomeOwnerForReport } from 'src/interfaces/User.model';
import { HomeOwnerService } from 'src/app/services/api/homeOwner.service';
import { ExportXLSXService } from 'src/app/services/utilities/exportXLSX.service';
@Component({
  selector: 'app-home-owners',
  templateUrl: './home-owners.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonSegment, IonSegmentButton, IonLabel,
    IonRow, IonCol, IonGrid,
    IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    DataTableComponent,
    SearchbarTable
],
  providers: [
  ]
})
export class HomeOwnersPage {

  segment = signal<"unblocked" | "blocked">("unblocked");

  dataTable = viewChild.required<DataTableComponent<User>>("dataTable");

  pageSize = 200;

  nameElement: string = 'Home Owners';
  descriptionElement = 'Users who have registered as home owners. They can request services and hire workers.';

  canCreate = true;

  private adminService = inject(HomeOwnerService);
  private dataTableService = inject(DataTableService);
  private exportXLSXService = inject(ExportXLSXService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");
  zipText = signal<string>("");

  fields: FormInput<UserAsHomeOwnerForReport>[] = [
    { key: 'uid', label: "User code", type: ColumnType.String, required: true, canShowField: true, editable: false, default: '', validators: [Validators.required, Validators.minLength(6)] },
    { key: 'displayName', label: 'Name', type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required] },
    { key: 'email', label: 'Email (optional)', editable: false, type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required, Validators.email] },
    { key: 'phoneNumber', label: 'Phone number (optional)', type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required] },
    // { key: 'photoURL', label: 'Photo (optional)', type: ColumnType.Image, required: false, canShowField: true, default: '', validators: [Validators.required] },
    { key: 'defaultAddress', label: 'Actual address', type: ColumnType.String, required: false, canShowField: true, default: '', validators: [] },
    { key: 'defaultZipCode', label: 'Actual ZipCode', type: ColumnType.String, required: false, canShowField: true, default: '', validators: [] },
    { key: 'defaultGeoloc', label: 'Actual Geolocation', type: ColumnType.Geolocation, required: false, canShowField: true, default: '', validators: [] },
    { key: 'createdAt', label: 'Created at', type: ColumnType.Date, canShowField: false, required: false },
    { key: 'updatedAt', label: 'Updated at', type: ColumnType.Date, canShowField: false, required: false },
    { key: 'blocked', label: 'Blocked?', type: ColumnType.Boolean, canShowField: false, required: false }
  ];

  columns: ColumnDataTable<UserAsHomeOwnerForReport>[] = []

  extraQueries = computed<{ [key: string]: string | number }>(() => {
    return {
      role: Role.USER,
      segment: this.segment()
    }
  })

  actionOptions: ActionTable[] = [ActionTable.Block, ActionTable.Unblock];

  sortColumn = signal<keyof User>("displayName");
  sortDirection = signal<'desc' | 'asc'>("asc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions = ['name', 'email'];

  userInUpdate = signal<User | null>(null)

  constructor() {
    this.columns = this.dataTableService.convertFieldsToColumns(this.fields)
    this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });
  }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }

  async performAction(action: ActionTable, user: User) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {
        case ActionTable.Delete:
          let response = await lastValueFrom(this.adminService.delete(user.uid))
          if (response.message) message = response.message;
          break;
        case ActionTable.Block:
          let responseBlock = await lastValueFrom(this.adminService.block(user.uid))
          if (responseBlock.message) message = responseBlock.message;
          break;
        case ActionTable.Unblock:
          let responseUnblock = await lastValueFrom(this.adminService.unblock(user.uid))
          if (responseUnblock.message) message = responseUnblock.message;
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

  segmentChanged(event: SegmentCustomEvent) {
    this.segment.set(event.detail.value as "unblocked" | "blocked")
  }

  async export() {
    let data = await this.dataTable().dataSource.data;
    this.exportXLSXService.exportXLSX(
      this.columns.map(column => column.key),
      data,
      this.nameElement
    );
  }
}
