import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';

@Injectable({
    providedIn: 'root'
})
export class ErrorAuthMessageService {

    // Rewrite errorAuth method to use message on english
    errorAuth(e: FirebaseError): string {
        let errorCode = e.code,
            message = typeof e === "object"
                ? "Something went wrong"
                : typeof e === "string" ? e : "";
        switch (errorCode) {
            case "auth/too-many-requests":
                message = "You have made too many requests, try again later";
                break;
            case "auth/email-already-in-use":
                message = "There is already an account with that email.";
                break;
            case "auth/claims-too-large":
                message = "The claim is too large to be saved.";
                break;
            case "auth/invalid-argument":
                message =
                    "An invalid argument was provided for the authentication method.";
                break;
            case "auth/invalid-display-name":
                message = "The user name is not allowed.";
                break;
            case "auth/invalid-credential":
                message = "Your email or password do not match, check the fields.";
                break;
            case "auth/invalid-email-verified":
                message =
                    "The value provided for the user emailVerified property is invalid.";
                break;
            case "auth/invalid-email":
                message = "The entered email is incorrect.";
                break;
            case "auth/invalid-password":
                message = "The password provided is incorrect.";
                break;
            case "auth/invalid-photo-url":
                message = "The photo provided is incorrect.";
                break;
            case "auth/missing-uid":
                message = "The UID has not been provided.";
                break;
            case "auth/invalid-uid":
                message = "The provided UID is incorrect.";
                break;
            case "auth/uid-alread-exists":
                message = "There is already a user with that Alias ID.";
                break;
            case "auth/email-already-exists":
                message = "You have already registered with that email, log in with your previous account.";
                break;
            case "auth/user-not-found":
                message = "The user has not been found.";
                break;
            case "auth/internal-error":
                if (e.message.indexOf('Cloud Function') !== -1 && e.message.indexOf('You have an active session on another device, please close the session on the other device to access from this point') !== -1) {
                    message = "You have an active session on another device, please close the session on the other device to access from this point.";
                    break;
                }
                message = "An error with the server has been found.";
                break;
            case "auth/wrong-password":
                message =
                    "The password is not valid or the user does not have a password.";
                break;
            case "auth/uid-already-exists":
                message = "The Alias ID has already been taken, please use another."
                break;
            case "auth/user-mismatch":
                message = "The credentials do not match the user."
                break;
            case "auth/user-disabled":
                message = "The user is temporarily disabled."
                break;
            case "AUTHORIZATION.invalid-phone-number":
            case "auth/invalid-phone-number":
                message = "The phone number provided is not valid."
                break

        }
        return message

    }
}
