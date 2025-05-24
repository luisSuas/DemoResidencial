import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class FormValidationService {

    constructor() { }



    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string') {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null
        }
    }


    validatePhoneForE164(phoneNumber: string) {
        const regEx = /^\+[1-9]\d{10,14}$/;
        return regEx.test(phoneNumber);
    };

    validateEmail(email: string): boolean {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    getErrorMessage(control: FormControl): string {
        if (control.hasError('required')) {
            return 'This field is required';
        } else if (control.hasError('email')) {
            return 'Not a valid email';
        } else if (control.hasError('minlength')) {
            return 'Min length required is ' + control.getError('minlength').requiredLength;
        } else if (control.hasError('maxlength')) {
            return 'Max length required is ' + control.getError('maxlength').requiredLength;
        } else if (control.hasError('uidAlreadyTaken')) {
            return 'This code/id/uid is already taken';
        } else if (control.errors && Object.keys(control.errors).length > 0)
            return "Please enter a valid value or remove the invalid characters";
        return "";
    }
}

export const EmailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;