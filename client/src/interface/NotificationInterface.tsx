import { UserInterface } from "./UserInterface"

export interface NotificationInterface{
    _id?: string,
    from: UserInterface,
    to: UserInterface,
    type: string,
    read: boolean
}