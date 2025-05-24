import { Injectable } from '@angular/core';
import { LoadingController, ToastButton } from '@ionic/angular/standalone';


@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(
    private loadingController: LoadingController
  ) { }

  public createLoading(text?: string, duration?: number, id?: string): Promise<HTMLIonLoadingElement> {
    return new Promise((res, rej) => {
      this.loadingController.create({
        message: text || 'Please wait...',
        backdropDismiss: false,
        duration: duration || 0,
        id: id || ""
      }).then((l: HTMLIonLoadingElement) => {
        l.present();
        res(l);
      })
    })
  }

  public dissmissLoading(): Promise<HTMLIonLoadingElement> {
    return new Promise((res, rej) => {
      this.loadingController.dismiss();
    });
  }

}
