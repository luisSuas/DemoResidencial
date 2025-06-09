import { Route } from "@angular/router";
import { AdminPage } from "./admin.page";
import { getStorage, provideStorage } from "@angular/fire/storage";

export const ADMIN_ROUTES: Route[] = [
    {
        path: '', component: AdminPage,
        children: [
            {
                path: 'dashboard',
                title: "Dashboard",
                loadComponent: () => import('./administrator/dashboard.page').then(m => m.DashboardPage)
            }, {
                path: 'administrators',
                title: "Administrators",
                loadComponent: () => import('./administrator/administrator.page').then(m => m.AdministratorPage)
            }, {
                path: 'home-owners',
                title: "Home Owners",
                loadComponent: () => import('./reports/home-owners/home-owners.page').then(m => m.HomeOwnersPage)
            }, {
                path: 'workers',
                title: "Workers",
                loadComponent: () => import('./reports/workers/workers.page').then(m => m.WorkersPage)
            }, {
                path: 'email-templates',
                title: "Email Templates",
                loadComponent: () => import('./email-templates/email-templates.page').then(m => m.EmailTemplatePage)
            }, {
                path: 'zip-codes',
                title: "Zip Codes",
                loadComponent: () => import('./zip-codes/zip-codes.page').then(m => m.ZipCodePage)
            }, {
                path: 'categories',
                title: "Work Categories",
                loadComponent: () => import('./categories/categories.page').then(m => m.CategoriesPage)
            }, {
                path: 'prices',
                title: "Prices",
                loadComponent: () => import('./prices/prices.page').then(m => m.PricesPage)
            },
            {
                path: 'factor',
                title: "Experience and Reviews Factor",
                loadComponent: () => import('./factor/factor.page').then(m => m.FactorPage)
            },
            {
                path: 'orders',
                title: "Orders",
                loadComponent: () => import('./orders/orders.page').then(m => m.OrdersPage)
            },
            {
                path: 'payments',
                title: "Payments",
                loadComponent: () => import('./payments/payments.page').then(m => m.PaymentsPage)
            },
            {
                path: "variables",
                title: "Variables",
                loadComponent: () => import('./variables/variables.page').then(m => m.VariablesPage)
            },
            {
      
                path: '3d-modeling',
                title: "3D Modeling",
                loadComponent: () => import('./administrator/modelado3d/modelado3d.page').then(m => m.Modelado3dPage)
            },
            {
                path: '',
                redirectTo: '/admin/administrators',
                pathMatch: 'full'
            }
        ]
    }
];