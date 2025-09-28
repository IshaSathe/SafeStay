import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type OpenRequest = {
  id: number;
  startDate: string;
  endDate: string;
  guests: number;
  rooms?: number | null;
  city: string;
  state?: string | null;
  cityCode?: string | null;
  maxNightlyUSD?: number | null;
  notes?: string | null;
  amadeusHotelId?: string | null;
  amadeusOfferId?: string | null;
  goalCents?: number | null;
  raisedCents: number;          // computed server-side
  seeker: { id: number; email: string };
};

@Injectable({ providedIn: 'root' })
export class SponsorService {
  private http = inject(HttpClient);

  listOpen() {
    return this.http.get<{ requests: OpenRequest[] }>('/api/requests/open');
  }

  contribute(requestId: number, amountCents: number) {
    return this.http.post<{ request: { id: number; goalCents?: number | null; status: string; raisedCents: number } }>(
      `/api/requests/${requestId}/contributions`,
      { amountCents }
    );
  }
}
