import { Component, OnInit, ChangeDetectionStrategy, input, model, computed, viewChildren, inject, ElementRef, ViewChildren, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import {
  IonList,
  IonInput,
  IonDatetimeButton,
  IonDatetime,
  IonLabel,
  IonItem,
  IonButton,
  IonModal, IonSpinner,
  IonSelect, IonSelectOption,
  DatetimeCustomEvent, IonIcon, IonAvatar, IonChip
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';
import { PhotoService } from 'src/app/services/capacitor/photo.service';
import { AlertsService } from 'src/app/services/utilities/alerts.service';
import { ColumnType } from 'src/interfaces/interface/ColumnDataTable';
import { FormInput } from 'src/interfaces/interface/FormInput';

@Component({
  selector: 'custom-form',
  templateUrl: './form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonChip, IonAvatar, IonIcon, IonSpinner,
    FormsModule, ReactiveFormsModule,
    IonList,
    IonInput,
    IonDatetimeButton,
    IonDatetime,
    IonLabel,
    IonItem,
    IonButton,
    IonSelect, IonSelectOption,
    IonModal],
  styleUrls: ['./form.component.scss'],
})
export class FormComponent<Model> implements OnInit, OnDestroy {

  private alertService = inject(AlertsService);
  private photoService = inject(PhotoService);

  isUpdating = input<boolean>(false)

  ionDateTimes = viewChildren<IonDatetime>(IonDatetime)
  @ViewChildren('fileInput', { read: ElementRef }) fileInput!: ElementRef<HTMLInputElement>[];

  fields = input.required<FormInput<any>[]>()
  path = input<string>("");
  nextId = input<number>(0);
  fieldsToShow = computed(() => this.fields().filter(field => field.canShowField))
  data = model<Model>({} as Model)
  processInProgress = input<boolean>(false)
  inputTypes = ColumnType;

  reactiveForm!: FormGroup;

  uploadedPhotos: { [key: string]: string } = {}
  filesUploaded: { [key: string]: string } = {}

  constructor() {
    addIcons({
      camera,
    });
  }

  ngOnInit() {
    let fields = this.fields();
    console.log(fields)
    let reactiveForm = new FormGroup({})
    fields.forEach(field => {
      let validators: ValidatorFn[] = [];
      if (field.required) {
        validators.push(Validators.required)
      }
      if (field.validators && field.validators.length > 0) {
        validators = validators.concat(field.validators)
      }
      reactiveForm.addControl(field.key as any, new FormControl(field.default || null, validators))
    })
    reactiveForm.valueChanges.subscribe((form) => {
      let formValue = form as any
      fields.forEach(field => {
        if (field.expectedValue && field.expectedValueField) {
          let actualExpectedValue = formValue[field.expectedValueField];
          if (actualExpectedValue === field.expectedValue) {
            field.canShowField = true;
          }
        } else if (field.type === this.inputTypes.Image) {
          if (field.key && formValue[field.key]) {
            this.uploadedPhotos[String(field.key)] = formValue[field.key];
          }
        }

      })
    });

    let data = this.data();
    console.log(data)
    if (data) {
      reactiveForm.patchValue(data);
    } else {
      reactiveForm.reset();
    }
    this.reactiveForm = reactiveForm;

    setTimeout(() => {
      this.reviewDateTimes()
    }, 100);
  }

  ngOnDestroy(): void {
    this.reactiveForm.reset();
  }

  reviewDateTimes() {
    let data: any = this.data();
    this.ionDateTimes()?.forEach(ionDateTime => {
      if (ionDateTime) {

        console.log(ionDateTime)
        // Inicializar a la fecha actual, más 1 hora, y sin segundos o milisegundos
        let date = new Date();
        if (data[ionDateTime.name]) {
          console.log(data[ionDateTime.name])
          date = new Date(data[ionDateTime.name]);
        }
        date.setHours(date.getHours() - 5, 0, 0, 0);
        ionDateTime.value = date.toISOString();
      }
    })
  }

  action() {
    if (
      this.reactiveForm.valid
    ) {
      this.data.set(this.reactiveForm.value)
    } else {
      this.reactiveForm.markAllAsTouched()
    }
  }

  getControl(formControlName: keyof Model) {
    return this.reactiveForm.controls[formControlName as any]
  }

  errorText(control: AbstractControl) {
    if (control.dirty && control.errors) {
      if (control.errors['required']) {
        return "This field is required"
      } else if (control.errors['minlength']) {
        return "Min length required is " + control.errors['minlength'].requiredLength + " caracteres"
      } else if (control.errors['email']) {
        return "Not a valid email"
      }
    }
    return ""
  }

  dateTimeChange(event: DatetimeCustomEvent, field: string) {
    this.reactiveForm.controls[field].setValue(new Date(event.detail.value as string))
  }


  async openImagePicker(key: string, formatsAccepted: string[] = ["png"]) {
    try {
      let { base64, format } = await this.photoService.takePicture()
      if (!formatsAccepted.includes(format.toLowerCase())) {
        throw this.alertService.defaultErrorAlert("Format is not allowed")
      }
      let possibleData: any = this.data()
      let photoURL = await this.photoService.uploadPhoto(base64, this.path(), key + "" + (possibleData?.id || this.nextId()), format)
      this.reactiveForm.controls[key].setValue(photoURL)
      this.uploadedPhotos[key] = photoURL;
      this.alertService.presentAlert("Photo uploaded correctly", "The photo was uploaded correctly")
    } catch (error) {

    }
  }

  openFilePicker(key: string) {
    let fileInput = this.fileInput.find(x => x.nativeElement.id === key)
    if (fileInput) {
      fileInput.nativeElement.click()
    }
  }

  seeFile(url: string) {
    window.open(url, "_blank")
  }

  deleteFile(key: string) {
    this.reactiveForm.controls[key].setValue(null)
    delete this.filesUploaded[key]
  }

  async saveFile(event: Event, key: string) {
    let input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      try {
        console.log(this.path(), key)
        let url = await this.photoService.uploadFile(input.files[0], this.path(), "" + key)
        this.reactiveForm.controls[key].setValue(url)
        this.filesUploaded[key] = url;
        this.alertService.presentAlert("File uploaded correctly", "The file was uploaded correctly")
      } catch (error) {
        console.error(error)
        this.alertService.displayError(error)
      }
    }
  }

  openImagePicked(url: string) {
    window.open(url, "_blank")
  }
}
