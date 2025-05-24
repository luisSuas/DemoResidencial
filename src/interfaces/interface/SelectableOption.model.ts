export interface SelectableOption<T> {
    value: keyof T | T;
    label: string;
}

export enum ActionTable {
    "Edit" = "edit",
    "Delete" = "delete",
    "Block" = "block",
    "Unblock" = "unblock",
    "Create" = "create",
    "Send Authentication Email" = "send-authentication-email",

}

export const labelsForActionTable = {
    [ActionTable.Edit]: "Modify",
    [ActionTable.Delete]: "Delete",
    [ActionTable.Block]: "Block",
    [ActionTable.Unblock]: "Unblock",
    [ActionTable.Create]: "Create",
    [ActionTable["Send Authentication Email"]]: "Send Authentication Email",
}

export const convertActionsToSelectableOptions = (actions: ActionTable[]): SelectableOption<ActionTable>[] => {
    return actions.map<SelectableOption<ActionTable>>(action => ({ value: action, label: labelsForActionTable[action] }));
}