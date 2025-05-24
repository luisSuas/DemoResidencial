import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Category, CategoryCreation } from 'src/interfaces/Category.model';

import { CategoryService } from 'src/app/services/api/category.service';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
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
export class CategoriesPage {

  nextId = signal<number>(0);

  dataTable = viewChild.required<DataTableComponent<Category>>("dataTable");

  pageSize = 100;

  nameElement: string = 'Work Categories';
  descriptionElement = 'Work categories are used to determine the type of work that the worker user can perform, within a radius of longitude and latitude relative to the area code. Please, try to be as specific as possible and not repeat, ambiguous or generic categories.';

  canCreate = true;

  modalCreateEdit = viewChild.required<IonModal>("modalCreateEdit");


  private categoryService = inject(CategoryService);
  private dataTableService = inject(DataTableService);
  private toastService = inject(ToastService);

  processInProgress = signal<boolean>(false);

  searchText = signal<string>("");

  fields: FormInput<Category>[] = [
    { key: "name", label: "Name", editable: true, type: ColumnType.String, canShowField: true, required: true, validators: [Validators.required] },
    { key: "defaultPrice", label: "Default price for category", editable: true, type: ColumnType.Number, canShowField: true, required: true, validators: [Validators.required, Validators.min(0)] },
    { key: "maxPrice", label: "Max price for category", editable: true, type: ColumnType.Number, canShowField: true, required: true, validators: [Validators.required, Validators.min(0)] },
    { key: "photoURL", label: "Photo - only PNG", editable: true, type: ColumnType.Image, canShowField: true, required: true, validators: [Validators.required] },
    { key: "defaultOrderPhotoURL", formatsAccepted: ["png", "jpg", "jpeg"], label: "Default photo on order - PNG", helperText: "This is displayed by default on order", editable: true, type: ColumnType.Image, canShowField: true, required: true, validators: [Validators.required] },
  ];

  columns: ColumnDataTable<Category>[] = []

  actionOptions: ActionTable[] = [ActionTable.Edit, ActionTable.Delete];

  actionName = signal<"Create" | "Edit">("Create");
  isUpdating = signal<boolean>(false);

  sortColumn = signal<keyof Category>("name");
  sortDirection = signal<'desc' | 'asc'>("asc");
  sortDirectionLabel = computed(() => this.sortDirection() === "asc" ? "ascendente" : "descendente");

  showSelectOptions = signal<boolean>(false);
  orderOptions: (keyof Category)[] = ['name'];

  categoryInUpdate = signal<Category | null>(null)

  constructor() {
    this.columns = this.dataTableService.convertFieldsToColumns(this.fields)
    this.columns.push({ title: "Actions", key: "actions", type: ColumnType.Action });

  }

  changeSearthTextToTable(event: any) {
    this.searchText.set(event);
  }

  async save(event: CategoryCreation) {
    this.processInProgress.set(true);
    let category = this.categoryInUpdate();
    if (category) {
      try {
        await lastValueFrom(this.categoryService.update(category.id, event))
        this.modalCreateEdit().dismiss()
        this.toastService.presentToast("Update done!");
      } catch (error) {

      } finally {
        this.processInProgress.set(false);
      }

    } else {
      this.categoryService.create(event).subscribe({
        next: (response) => {
          this.modalCreateEdit().dismiss();
          this.toastService.presentToast("Category created correctly");
          this.dataTable().reload();
        },
        complete: () => {
          this.processInProgress.set(false);
        }
      })
    }
  }

  async performAction(action: ActionTable, zip: Category) {
    try {
      this.processInProgress.set(true);
      let message = "";
      switch (action) {
        case ActionTable.Edit:
          this.processInProgress.set(false);
          this.categoryInUpdate.set(zip);
          this.actionName.set("Edit");
          this.isUpdating.set(true);
          await this.modalCreateEdit().present();
          await this.modalCreateEdit().onWillDismiss();
          this.dataTable().reload();
          break;
        case ActionTable.Delete:
          let response = await lastValueFrom(this.categoryService.delete(zip.id))
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
