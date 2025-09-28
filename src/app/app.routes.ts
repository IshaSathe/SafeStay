import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Seeker } from './pages/seeker/seeker'
import { Sponsor } from './pages/sponsor/sponsor';
import { HomesAvailable } from './pages/homes-available/homes-available';
import { HomeDetails } from './pages/home-details/home-details';
import { HotelRequest } from './pages/hotel-request/hotel-request';
import { GiveHomes } from './pages/give-homes/give-homes';
import { GiveHotels } from './pages/give-hotels/give-hotels';
import { Applications } from './pages/applications/applications';

export const routes: Routes = [
    { path: '', component: Home, pathMatch: 'full' },
    { path: 'login', component: Login, pathMatch: 'full' },
    { path: 'seeker', component: Seeker, pathMatch: 'full' },
    { path: 'sponsor', component: Sponsor, pathMatch: 'full' },
    { path: 'homes-available', component: HomesAvailable, pathMatch: 'full' },
    { path: 'home-details', component: HomeDetails, pathMatch: 'full' },
    { path: 'hotel-request', component: HotelRequest, pathMatch: 'full' },
    { path: 'give-homes', component: GiveHomes, pathMatch: 'full' },
    { path: 'give-hotels', component: GiveHotels, pathMatch: 'full' },
    { path: 'applications', component: Applications, pathMatch: 'full' }
];
