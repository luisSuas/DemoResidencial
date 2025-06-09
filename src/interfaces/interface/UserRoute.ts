export interface UserRoute {
    icon: string;
    title: string;
    route: string;
     children?: UserRoute[];
}