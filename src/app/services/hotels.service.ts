import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type HotelSearchParams = {
    cityCode: string;
    checkInDate: string;   // YYYY-MM-DD
    checkOutDate: string;  // YYYY-MM-DD
    adults: number;
    limit?: number;
    currency?: string;
};

@Injectable({ providedIn: 'root' })
export class HotelsService {
    private http = inject(HttpClient);

    search(params: HotelSearchParams) {
        const q = new URLSearchParams({
            cityCode: params.cityCode,
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            adults: String(params.adults),
            ...(params.limit ? { limit: String(params.limit) } : {}),
            ...(params.currency ? { currency: params.currency } : {})
        });
        return this.http.get<{ offers: any[] }>(`/api/ext/hotels/search?${q.toString()}`);
    }

    createRequest(body: any) {
        return this.http.post<{ request: any }>(`/api/requests`, body);
    }

    listMineWithProgress() {
        return this.http.get<{
            requests: Array<{
                id: number; startDate: string; endDate: string; city: string; state?: string | null;
                guests: number; rooms?: number | null; goalCents?: number | null; status: string;
                amadeusHotelId?: string | null; amadeusOfferId?: string | null; createdAt: string;
                raisedCents: number; percent: number;
            }>
        }>('/api/requests/mine/with-progress');
    }

}
