import { Injectable } from '@angular/core';
import { ToastButton, ToastController } from '@ionic/angular/standalone';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController
  ) { }


  presentToast(message: string, duration: number = 5000, icon?: string | undefined, buttonMore: string | null = null):
    Promise<boolean> {
    return new Promise(async (res, rej) => {
      let buttons: ToastButton[] | undefined = undefined
      if (buttonMore) {
        buttons = [
          {
            text: buttonMore,
            role: "info",
            handler: () => {

            }
          }
        ]
      }
      const toast = await this.toastController.create({
        message,
        duration,
        icon,
        buttons
      });
      await toast.present();

      if (buttonMore) {
        const { role } = await toast.onDidDismiss();
        if (role === "info") {
          res(true)
        } else
          res(false)
      } else res(true)
    })
  }

}
