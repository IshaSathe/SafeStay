import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HomesService {
  private http = inject(HttpClient);

  // Sponsor create listing
  createListing(body: {
    title: string; description?: string | null; city: string; state?: string | null;
    maxGuests: number; nightlyCents?: number | null; availableFrom?: string | null; availableTo?: string | null;
  }) {
    return this.http.post<{ listing: any }>('/api/homes', body);
  }

  // Seeker browse open listings
  listOpen(city?: string) {
    const qs = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.http.get<{ listings: any[] }>(`/api/homes${qs}`);
  }

  // Sponsor: my listings
  listMine() {
    return this.http.get<{ listings: any[] }>('/api/homes/mine');
  }

  // Sponsor: toggle status
  setStatus(id: number, status: 'OPEN' | 'CLOSED') {
    return this.http.patch<{ listing: any }>(`/api/homes/${id}/status`, { status });
  }

  // Seeker: apply
  apply(listingId: number, body: { occupants: number; startDate: string; endDate: string; message?: string | null }) {
    return this.http.post<{ application: any }>(`/api/homes/${listingId}/applications`, body);
  }

  // Sponsor: see applications for a listing
  listApplications(listingId: number) {
    return this.http.get<{ applications: any[] }>(`/api/homes/${listingId}/applications`);
  }

  // Sponsor: approve/decline application
  decide(appId: number, status: 'APPROVED' | 'DECLINED') {
    return this.http.patch<{ application: any }>(`/api/home-applications/${appId}`, { status });
  }

  listMyApplications() {
    return this.http.get<{ applications: any[] }>('/api/home-applications/mine');
  }
}
