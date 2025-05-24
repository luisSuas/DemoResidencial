import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  
  IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonCol, IonRow, IonProgressBar
} from '@ionic/angular/standalone';
import { ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import { FormInput } from 'src/interfaces/interface/FormInput';

import { ToastService } from 'src/app/services/utilities/toast.service';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ref, onValue, Database, DatabaseReference, update } from '@angular/fire/database';

export interface ActualVariablesSystem {
  XJobsFee: number;
  baseRadius: number;
  increaseRadius: number;
  maxRadius: number;
  maxHours: number;
  expectedHoursBetweenServices: number;
  termsPDF?: string;
  privacyPDF?: string;
}

@Component({
  selector: 'app-variables',
  templateUrl: './variables.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonProgressBar,
    ReactiveFormsModule,
    IonRow, IonCol, IonGrid,
    IonContent, IonHeader, IonTitle, IonToolbar, FormsModule,
    FormComponent,
    MatTableModule,
    MatPaginatorModule],
  providers: [
  ]
})
export class VariablesPage {

  private database = inject(Database);
  private toastService = inject(ToastService);

  nameElement: string = 'System Variables';
  descriptionElement = 'Variables are used to determine the user and worker experience, within the system.';

  fields: FormInput<ActualVariablesSystem>[] = [
    {
      key: 'XJobsFee',
      label: 'X Jobs Fee',
      helperText: 'Fee for X Jobs, every time a worker gets a job, the system will charge this fee',
      type: ColumnType.Number,
      default: 1.5,
      required: true,
      canShowField: true,
      editable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(10000)]
    },
    {
      key: 'baseRadius',
      label: 'Base Radius',
      type: ColumnType.Number,
      default: 2,
      required: true,
      canShowField: true,
      editable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)]
    },
    {
      key: 'increaseRadius',
      label: 'Increase Radius',
      type: ColumnType.Number,
      default: 2,
      required: true,
      canShowField: true,
      editable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)]
    },
    {
      key: 'maxRadius',
      label: 'Max Radius',
      type: ColumnType.Number,
      default: 10,
      required: true,
      canShowField: true,
      editable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)]
    },
    {
      key: 'maxHours',
      label: 'Max Hours',
      helperText: 'Max hours to work in a service',
      type: ColumnType.Number,
      default: 10,
      required: true,
      canShowField: true,
      editable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)]
    }, {
      key: 'expectedHoursBetweenServices',
      label: 'Expected Hours Between Services',
      helperText: 'Expected hours between services',
      type: ColumnType.Number,
      default: 2,
      required: true,
      canShowField: true,
      editable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)]
    },
    {
      key: 'termsPDF',
      label: 'Terms PDF',
      helperText: 'Terms and conditions PDF URL',
      type: ColumnType.File,
      default: '',
      required: false,
      canShowField: true,
      editable: true,
      validators: []
    },
    {
      key: 'privacyPDF',
      label: 'Privacy PDF',
      helperText: 'Privacy policy PDF URL',
      type: ColumnType.File,
      default: '',
      required: false,
      canShowField: true,
      editable: true,
      validators: []
    },
  ];

  model = signal<Partial<ActualVariablesSystem>>({})
  processInProgress = signal<boolean>(false);
  modelRef!: DatabaseReference

  constructor() {

    this.modelRef = ref(this.database, '/variables/');
    this.processInProgress.set(true);
    onValue(this.modelRef, (snapshot) => {
      this.model.set(snapshot.val());
      this.processInProgress.set(false);
    }, error => {
      console.log('Error: ', error);
    });
  }

  async save(event: ActualVariablesSystem) {
    this.processInProgress.set(true);
    try {
      await update(this.modelRef, event)
      this.toastService.presentToast("Update done!");
    } catch (error) {
      this.toastService.presentToast("Error updating the variables, contact and administrator");
    } finally {
      setTimeout(() => {
        this.processInProgress.set(false);
      }, 300);
    }
  }
}
