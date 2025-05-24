import { ChangeDetectionStrategy, Component, input, model, output, viewChild } from '@angular/core';

import {
    IonPopover, IonList, IonItem, IonContent
} from "@ionic/angular/standalone";
import { SelectableOption } from 'src/interfaces/interface/SelectableOption.model';

@Component({
    selector: 'select-options',
    templateUrl: './select-options.component.html',
    standalone: true,
    imports: [IonContent, IonItem, IonList, IonPopover,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectOptionsComponent {

    dataActionPopover = viewChild.required<IonPopover>("dataActionPopover");

    optionSelected = output<string>();

    options = input.required<SelectableOption<string>[]>();

    select(option: string) {
        this.optionSelected.emit(option);
    }

}
