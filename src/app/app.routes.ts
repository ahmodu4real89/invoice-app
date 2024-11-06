import { Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { CreateComponent } from './components/create/create.component';

export const routes: Routes = [
    {path:'', pathMatch:'full', component:CreateComponent},
    {path:'invoice', component:ListComponent},
    {path:'invoice/create', component:CreateComponent},
    {path:'invoice/edit/:invoiceno', component:CreateComponent}
];
