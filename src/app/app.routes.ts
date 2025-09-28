import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Seeker } from './pages/seeker/seeker'
import { Sponsor } from './pages/sponsor/sponsor';

export const routes: Routes = [
    { path: '', component: Home, pathMatch: 'full' },
    { path: 'login', component: Login, pathMatch: 'full' },
    { path: 'seeker', component: Seeker, pathMatch: 'full' },
    { path: 'sponsor', component: Sponsor, pathMatch: 'full' }
];
