import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
    IonList, IonItem, IonContent
} from "@ionic/angular/standalone";
import { ActionTable, SelectableOption } from 'src/interfaces/interface/SelectableOption.model';

@Component({
    selector: 'data-actions',
    templateUrl: './data-actions.component.html',
    standalone: true,
    imports: [IonContent, IonItem, IonList
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataActionsComponent {

    actionSelected = output<ActionTable>();

    options = input.required<SelectableOption<ActionTable>[]>();

    select(option: ActionTable) {
        this.actionSelected.emit(option);
    }

}
