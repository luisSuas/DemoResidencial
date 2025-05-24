import { inject, Injectable } from "@angular/core";

import { getDownloadURL, ref, Storage, uploadString, uploadBytes } from '@angular/fire/storage';


import { Camera, CameraPermissionType, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';

import { Platform } from '@ionic/angular/standalone';

@Injectable({
    providedIn: 'root',
})
export class PhotoService {

    private platform: Platform = inject(Platform);
    private storage = inject(Storage);

    async uploadPhoto(dataUrl: string, path: string, filneName: string,
        /**
         * The format of the image, ex: jpeg, png, gif.
         *
         * iOS and Android only support jpeg.
         * Web supports jpeg, png and gif, but the exact availability may vary depending on the browser.
         * gif is only supported if `webUseInput` is set to `true` or if `source` is set to `Photos`.
         *
         * @since 1.0.0
         */
        format: string
    ) {
        const photoFef = ref(this.storage, path + "/" + filneName + "." + format);

        const task = await uploadString(photoFef, dataUrl, "base64", {
            contentType: "image/" + format
        });

        return getDownloadURL(task.ref);

    }


    async takePicture(): Promise<{
        base64: string,
        /**
         * The format of the image, ex: jpeg, png, gif.
         *
         * iOS and Android only support jpeg.
         * Web supports jpeg, png and gif, but the exact availability may vary depending on the browser.
         * gif is only supported if `webUseInput` is set to `true` or if `source` is set to `Photos`.
         *
         * @since 1.0.0
         */
        format: string
    }> {
        let status: PermissionStatus | null = null;
        let isCapacitor = this.platform.is("capacitor");
        if (isCapacitor) {
            status = await Camera.checkPermissions();
            if (status.camera !== "granted" || status.photos !== "granted") {
                let permissions: CameraPermissionType[] = []
                if (status.camera !== "granted") permissions.push("camera")
                if (status.photos !== "granted") permissions.push("photos")
                status = await Camera.requestPermissions({ permissions })

                if (status.camera !== "granted" && status.photos !== "granted") {
                    throw new Error("You need to grant permissions to use the camera")
                }
            }
        }
        try {
            let image = await Camera.getPhoto({
                quality: 30,
                webUseInput: true,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Photos,
                promptLabelHeader: "Select a file",
                promptLabelCancel: "Cancel",
                promptLabelPhoto: "Photo Library",
                promptLabelPicture: "Cámara",
                correctOrientation: true,
            })
            if (image && typeof image === "object" && image.base64String)
                return {
                    base64: image.base64String,
                    format: image.format
                }
        } catch (error) {

        }
        throw new Error("Error taking the picture, maybe you canceled the action or the image is not valid")
    }



    async uploadFile(file: File, path: string, fileName: string): Promise<string> {
        // Validate file type (optional, adjust based on allowed types)
        const allowedExtensions = ['pdf']; // Example allowed extensions
        let extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
            throw new Error('Invalid file type. Only PDF files are allowed.');
        }

        try {
            // Get a reference to the storage location

            const storageRef = ref(this.storage, path + '/' + fileName + '.' + extension);

            // Upload the file with progress tracking (optional)
            const uploadTask = await uploadBytes(storageRef, file);
            // Get the download URL after successful upload
            const downloadURL = await getDownloadURL(uploadTask.ref);
            return downloadURL;
        } catch (error) {
            console.error('An error occurred:', error);
            throw error; // Re-throw the error for handling in the component
        }
    }
}