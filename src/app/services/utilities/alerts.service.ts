import { inject, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';


@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  private alertController = inject(AlertController);

  presentAlert(header: string, message: string, button?: string): Promise<boolean> {
    return new Promise((res, rej) => {
      this.alertController.create({
        header,
        message, backdropDismiss: false,
        buttons: [{
          text: button || "Continue",
          handler: () => {
            res(true)
          }
        }]
      }).then((alert) => {
        alert.present()
      })
    });
  }

  presentAlertConfirm(header: string, message: string, okayButton?: string, cancelButton?: string): Promise<boolean> {
    return new Promise((res, rej) => {
      this.alertController.create({
        header: header,
        message: message, backdropDismiss: false,
        buttons: [{
          text: cancelButton || "Cancel",
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { res(false) }
        }, {
          text: okayButton || "Continue",
          handler: () => { res(true) }
        }]
      }).then((alert) => alert.present())
    });
  }

  async presentAlertPrompt<T>(header?: string, message?: string, type?: 'text' | 'number' | 'checkbox' | 'radio' | 'textarea' | "tel",
    placeholder?: string, value?: T): Promise<T | null> {
    return new Promise(async (res, rej) => {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header,
        message,
        backdropDismiss: false,
        keyboardClose: false,
        inputs: [
          {
            name: 'input',
            type: type || 'text',
            placeholder,
            value
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              res(null)
            }
          }, {
            text: 'Continue',
            handler: (r: any) => {
              res(r.input as T)
            }
          }
        ]
      });
      await alert.present();
    });
  }


  displayError(error: any) {
    if (error instanceof Error) {
      this.defaultErrorAlert(error.message)
    } else if (error && error.error && error.error.message) {
      this.presentAlert("Attention", error.error.message, "Continue")
    } else if (typeof error == "string")
      this.defaultErrorAlert(error)
    else
      this.defaultErrorAlert()
  }

  defaultErrorAlert(message: string = "We are sorry, the service is not available at this time"): Promise<boolean> {
    return this.presentAlert("Attention", message, "Continue")
  }

}
