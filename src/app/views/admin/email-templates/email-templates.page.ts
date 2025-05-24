import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SegmentCustomEvent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonGrid, IonCol, IonRow, IonModal, IonLabel, IonSegmentButton, IonSegment
} from '@ionic/angular/standalone';
import { DataTableComponent } from 'src/app/components/tables/table/table.component';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { SearchbarTable } from 'src/app/components/tables/searchbar/searchbar.component';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import { FormInput } from 'src/interfaces/interface/FormInput';
import { DataTableService } from 'src/app/services/utilities/dataTable.service';

import { ToastService } from 'src/app/services/utilities/toast.service';
import { ActionTable } from 'src/interfaces/interface/SelectableOption.model';
import { lastValueFrom } from 'rxjs';
import { EmailTemplate, EmailTemplateCreation, EmailTemplateType } from 'src/interfaces/EmailTemplate.model';
import { EmailTemplateService } from 'src/app/services/api/emailTemplate.service';
@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonSegment, IonSegmentButton, IonLabel,
    IonModal,
    IonRow, IonCol, IonGrid,
    IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    DataTableComponent,
    SearchbarTable,
    FormComponent
],
  providers: [
  ]
})
export class EmailTemplatePage {


  dataTable = viewChild.required<DataTableComponent<EmailTemplate>>("dataTable");

  pageSize = 50;

  nameElement: string = 'Email/Push Templates';
  descriptionElement = 'Email/Push templates are used to send emails/push to users, you can only edit them, please be careful with the changes this can affect the app behavior. To use variables you need to use the following format: {{variable}}. For example: Hello {{name}}. Varabiales are case sensitive and limitated contcat the developer for more information.';

  canCreate = true;

  modalCreateEdit = viewChild.required<IonModal>("modalCreateEdit");


  private emailService = inject(EmailTemplateService);
  private dataTableService = inject(DataTableService);
  private toastService = inject(ToastService);


  segment = signal<EmailTemplateType>(EmailTemplateType.EMAIL);
  extraQueries = computed<{ [key: string]: string | number }>(() => {
    console.log("extraQueries" + this.segment())
    return {
      segment: this.segment()
    }
  })

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");

  fields: FormInput<EmailTemplate>[] = [
    { key: 'code', label: "Email code", editable: false, type: ColumnType.String, required: true, canShowField: false, default: '' },
    { key: 'title', label: 'Title', type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required] },
    { key: 'message', label: 'Message', type: ColumnType.String, required: true, canShowField: true, default: '', validators: [Validators.required] },
    {
      key: 'type', label: 'Type', type: ColumnType.Select, required: true, canShowField: false, default: EmailTemplateType.EMAIL, options: [
        { label: EmailTemplateType.EMAIL, value: EmailTemplateType.EMAIL },
        { label: EmailTemplateType.PUSH, value: EmailTemplateType.PUSH }
      ]
    }, {
      key: 'route', label: 'Route', type: ColumnType.String, required: false, canShowField: false, default: ''
    }
  ];

  columns: ColumnDataTable<EmailTemplate>[] = []

  actionOptions: ActionTable[] = [ActionTable.Edit];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

  sortColumn = signal<keyof EmailTemplate>("code");
  sortDirection = signal<'desc' | 'asc'>("asc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions: (keyof EmailTemplate)[] = ['code', 'title', 'message'];

  emailInUpdate = signal<EmailTemplate | null>(null)

  constructor() {
    this.columns = this.dataTableService.convertFieldsToColumns(this.fields)
    this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });

  }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }

  async save(event: EmailTemplateCreation) {
    this.processInProgress.set(true);
    if (this.emailInUpdate()) {
      try {
        await lastValueFrom(this.emailService.update(event.code, event))
        this.modalCreateEdit().dismiss()
        this.toastService.presentToast("Update done!");
      } catch (error) {

      } finally {
        this.processInProgress.set(false);
      }

    } else {
      event.code = event.code.toUpperCase();

      this.emailService.create(event).subscribe({
        next: (response) => {
          this.modalCreateEdit().dismiss();
          this.toastService.presentToast("Email/Push created correctly");
          this.dataTable().reload();
        },
        complete: () => {
          this.processInProgress.set(false);
        }
      })
    }
  }

  async performAction(action: ActionTable, email: EmailTemplate) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {
        case ActionTable.Edit:
          this.processInProgress.set(false);
          this.emailInUpdate.set(email);
          this.actionName.set("Edit");
          this.isUpdating.set(true);
          await this.modalCreateEdit().present();
          await this.modalCreateEdit().onWillDismiss();
          this.dataTable().reload();
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
    this.segment.set(event.detail.value as EmailTemplateType)
  }
}
