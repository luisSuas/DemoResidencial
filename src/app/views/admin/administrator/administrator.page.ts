import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SegmentCustomEvent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonGrid, IonCol, IonRow, IonModal, IonIcon, IonLabel, IonSegmentButton, IonSegment
} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import { FormInput } from 'src/interfaces/interface/FormInput';
import { DataTableService } from 'src/app/services/utilities/dataTable.service';
import { Role, User, UserCreation } from 'src/interfaces/User.model';
import { AdminService } from 'src/app/services/api/administrators.service';
import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.page.html',
  styleUrls: ['./administrator.page.scss'],
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
    FormComponent
],
  providers: [
  ]
})
export class AdministratorPage {

  segment = signal<"unblocked" | "blocked">("unblocked");

  dataTable = viewChild.required<DataTableComponent<User>>("dataTable");

  pageSize = 20;

  nameElement: string = 'General Administrators';
  descriptionElement = 'Users with all privileges, including the ability to manage other administrators, they CANT NOT BE USED ON THE APP';

  canCreate = true;

  modalCreateEdit = viewChild.required<IonModal>("modalCreateEdit");


  private adminService = inject(AdminService);
  private dataTableService = inject(DataTableService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");

  fields: FormInput<User>[] = [
    { key: 'uid', label: "User code", type: ColumnType.String, required: true, canShowField: true, editable: false, default: '', validators: [Validators.required, Validators.minLength(6)] },
    { key: 'displayName', label: 'Name', type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required] },
    { key: 'email', label: 'Email', editable: false, type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required, Validators.email] },
    { key: 'createdAt', label: 'Created at', type: ColumnType.Date, canShowField: false, required: false },
    { key: 'updatedAt', label: 'Updated at', type: ColumnType.Date, canShowField: false, required: false },
    { key: 'blocked', label: 'Blocked?', type: ColumnType.Boolean, canShowField: false, required: false }
  ];

  columns: ColumnDataTable<User>[] = []

  extraQueries = computed<{ [key: string]: string | number }>(() => {
    console.log("extraQueries" + this.segment())
    return {
      role: Role.ADMIN,
      segment: this.segment()
    }
  })

  actionOptions: ActionTable[] = [ActionTable.Edit, ActionTable.Delete, ActionTable.Block, ActionTable.Unblock];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

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

  async save(event: UserCreation) {
    this.processInProgress.set(true);
    if (this.userInUpdate()) {
      try {
        await lastValueFrom(this.adminService.update(event.uid, event))
        this.modalCreateEdit().dismiss()
        this.toastService.presentToast("Administrator updated correctly");
      } catch (error) {

      } finally {
        this.processInProgress.set(false);
      }

    } else {
      event.uid = event.uid.toUpperCase();

      this.adminService.create(event).subscribe({
        next: (response) => {
          this.modalCreateEdit().dismiss();
          this.toastService.presentToast("Administrator created correctly");
          this.dataTable().reload();
        },
        complete: () => {
          this.processInProgress.set(false);
        }
      })
    }
  }

  async performAction(action: ActionTable, user: User) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {
        case ActionTable.Edit:
          this.processInProgress.set(false);
          this.userInUpdate.set(user);
          this.actionName.set("Edit");
          this.isUpdating.set(true);
          await this.modalCreateEdit().present();
          await this.modalCreateEdit().onWillDismiss();
          this.dataTable().reload();
          break;
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

  presentCreationModal() {
    this.actionName.set("Create");
    this.isUpdating.set(false);
    this.modalCreateEdit().present();
  }

  segmentChanged(event: SegmentCustomEvent) {
    this.segment.set(event.detail.value as "unblocked" | "blocked")
  }
}
