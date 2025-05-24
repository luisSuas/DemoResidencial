import { inject, Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular/standalone';

@Injectable({
    providedIn: 'root'
})
export class DirectionUtilitiesService {

    private actionSheetController = inject(ActionSheetController);

    async openWaze(lat: number, lng: number) {
        window.open(this.generateWazeLink(lat, lng), '_blank')
    }

    public generateWazeLink(lat: number, lng: number) {
        const url = `https://www.waze.com/ul?ll=${lat}%2C${lng}&navigate=yes&zoom=17`
        return url
    }

    async openGoogleMaps(lat: number, lng: number) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&dir_action=navigate`;
        window.open(url, '_blank')
    }


    async openRoute(coordinates?: [number, number]) {
        if (coordinates) {
            const actionSheet = await this.actionSheetController.create({
                header: "Select an app",
                buttons: [{
                    text: "Google Maps",
                    handler: () => this.openGoogleMaps(coordinates[0], coordinates[1])
                }, {
                    text: "Waze",
                    handler: () => this.openWaze(coordinates[0], coordinates[1])
                }, {
                    text: "Cancel",
                    role: 'cancel',
                    handler: () => { }
                }]
            });
            await actionSheet.present();
        }
    }
}
