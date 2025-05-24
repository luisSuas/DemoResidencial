import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NavController,
  IonContent, IonHeader, IonTitle, IonInputPasswordToggle, IonToolbar, IonGrid, IonRow, IonCol, IonLabel, IonItem, IonInput, IonList, IonButton, IonSpinner
} from '@ionic/angular/standalone';
import { FormValidationService } from 'src/app/services/utilities/formValidation';
import { AuthService } from 'src/app/services/auth.service';
import { Role } from 'src/interfaces/User.model';
import { AlertsService } from '../../services/utilities/alerts.service';
import { ActivatedRoute } from '@angular/router';

import { LoadingService } from 'src/app/services/utilities/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonSpinner, IonButton, IonList,
    IonInput, IonItem, IonLabel, IonCol, IonRow, IonGrid,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonInputPasswordToggle,
    FormsModule]
})
export class LoginPage {

  private authService: AuthService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute)
  private alertService = inject(AlertsService);
  private formValidationService: FormValidationService = inject(FormValidationService);
  private nav: NavController = inject(NavController);

  private loadingService = inject(LoadingService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  processInProgress = signal(false);

  token!: string;
  redirect!: string;

  viewDidEnter = signal(false);

  ionViewDidEnter() {
    this.activatedRoute.queryParams.subscribe(async (queryParams) => {
      if (queryParams['redirect'])
        this.redirect = decodeURIComponent(queryParams['redirect'])
      this.viewDidEnter.set(true)
    });
  }

  async login() {

    try {
      this.processInProgress.set(true);
      let formValue = this.form.value;

      if (typeof formValue.email === "string" && typeof formValue.password === "string") {
        let role = await this.authService.signInWithEmailAndPassword(formValue.email, formValue.password);
        console.log(role)
        if (role) this.redirecToView(role);
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.processInProgress.set(false);
    }
  }

  async signInWithToken() {
    let l = await this.loadingService.createLoading("Wait a second...")
    try {
      if (typeof this.token === "string" && this.token.length > 0)
        try {
          this.processInProgress.set(true);
          let role = await this.authService.signInWithCustomToken(this.token);
          if (role) this.redirecToView(role);
        } catch (error) {
          this.processInProgress.set(false);
        }
    } catch (error) {

    } finally {
      l.dismiss()
    }
  }

  redirecToView(role: Role) {
    console.log(this.redirect)
    if (typeof this.redirect === "string" && this.redirect.length > 0) {
      this.nav.navigateRoot(this.redirect);
    } else
      switch (role) {
        case Role.ADMIN:
          this.nav.navigateRoot("/admin");
          break;
      }
  }

  textError(controlName: keyof typeof this.form.controls) {
    // ts-ignore
    let control: FormControl = this.form.controls[controlName]
    if (control) {
      return this.formValidationService.getErrorMessage(control)
    } else
      return ""
  }

  forgot() {
    this.alertService.presentAlert("Ask the administrator to reset your password", "If you are an administrator, you can reset your password on the administrator page, if you are a headquarters you must ask the administrator to send you a temporary login link.")
  }

}
