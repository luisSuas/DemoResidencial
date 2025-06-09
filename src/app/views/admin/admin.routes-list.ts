import { UserRoute } from "src/interfaces/interface/UserRoute";

export const AdminRoutesList: UserRoute[] = [
     {
        icon: 'grid',
        title: 'Dashboard',
        route: 'dashboard',
        
        children: [
      {
        icon: 'cube',
        title: '3D Modeling',
        route: '3d-modeling'
      }
    ]
    },
    
    {
        icon: 'key',
        title: 'Administrators',
        route: 'administrators'
    },
    {
        icon: 'person-circle',
        title: 'Home Owners',
        route: 'home-owners'
    },
    {
        icon: 'briefcase',
        title: 'Workers',
        route: 'workers'
    },
    {
        icon: 'mail',
        title: 'Email/Push Templates',
        route: 'email-templates'
    },
    {
        icon: 'location',
        title: 'Zip Codes',
        route: 'zip-codes'
    },
    {
        icon: 'bookmark',
        title: 'Work Categories',
        route: 'categories'
    },
    {
        icon: 'cash',
        title: 'Prices',
        route: 'prices'
    },
    {
        icon: 'flag',
        title: 'Experience and Reviews Factor',
        route: 'factor'
    },
    {
        icon: 'key',
        title: 'Variables',
        route: 'variables'
    }, {
        icon: 'list',
        title: 'Orders',
        route: 'orders'
    }, {
        icon: 'wallet',
        title: 'Payments',
        route: 'payments'
    }
]