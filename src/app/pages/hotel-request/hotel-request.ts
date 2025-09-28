import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HotelsService } from '../../services/hotels.service';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

type OfferGroup = {
  hotel: { hotelId: string; name?: string; cityCode?: string; address?: string };
  available: boolean;
  offers: Array<{
    id: string; room?: string; description?: string;
    checkInDate: string; checkOutDate: string;
    guests?: number;
    price: { total?: string; currency?: string };
  }>;
};

@Component({
  standalone: true,
  selector: 'app-hotel-request',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './hotel-request.html',
  styleUrl: './hotel-request.scss'
})
export class HotelRequest {
  private fb = inject(FormBuilder);
  private hotels = inject(HotelsService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  // step state
  results = signal<OfferGroup[]>([]);
  selected = signal<{ hotelId: string; offerId?: string; totalUSD?: string; currency?: string } | null>(null);
  savedId = signal<number | null>(null);

  form = this.fb.group({
    // Request details
    startDate: ['', Validators.required],
    endDate:   ['', Validators.required],
    guests:    [1,   [Validators.required, Validators.min(1)]],
    rooms:     [1,   [Validators.min(1)]],
    city:      ['',  Validators.required],
    state:     [''],
    cityCode:  ['',  Validators.required], // Amadeus requires IATA city code
    maxNightlyUSD: [null as number | null, [Validators.min(0)]],
    notes:     [''],

    // Search options
    currency:  ['USD'],
  });

  get f() { return this.form.controls; }

  async runSearch() {
    if (this.form.get('startDate')?.invalid || this.form.get('endDate')?.invalid || this.form.get('cityCode')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true); this.error.set(null); this.results.set([]); this.selected.set(null);

    try {
      const p = {
        cityCode: this.form.value.cityCode!,
        checkInDate: this.form.value.startDate!,
        checkOutDate: this.form.value.endDate!,
        adults: this.form.value.guests || 1,
        currency: this.form.value.currency || 'USD',
        limit: 15
      };
      const res = await this.hotels.search(p).toPromise();
      this.results.set(res?.offers ?? []);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Search failed');
    } finally {
      this.loading.set(false);
    }
  }

  pick(group: OfferGroup, offerId?: string) {
    if (!offerId) {
      this.selected.set({ hotelId: group.hotel.hotelId });
      return;
    }
    const of = (group.offers ?? []).find(o => o.id === offerId);
    this.selected.set({
      hotelId: group.hotel.hotelId,
      offerId,
      totalUSD: of?.price?.total,         // e.g., "456.78"
      currency: of?.price?.currency ?? 'USD'
    });
  }

  async saveRequest() {
    if (!this.selected()) {
      this.error.set('Please select a hotel (and offer) before saving.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true); this.error.set(null);

    try {
      const sel = this.selected()!;
      const goalCents =
      sel.totalUSD && !Number.isNaN(Number(sel.totalUSD))
        ? Math.round(Number(sel.totalUSD) * 100)
        : null;
      const body = {
        startDate: this.form.value.startDate!,
        endDate:   this.form.value.endDate!,
        guests:    this.form.value.guests!,
        rooms:     this.form.value.rooms ?? null,
        city:      this.form.value.city!,
        state:     this.form.value.state ?? null,
        cityCode:  this.form.value.cityCode!,
        maxNightlyUSD: this.form.value.maxNightlyUSD ?? null,
        notes:     this.form.value.notes ?? null,
        amadeusHotelId: this.selected()!.hotelId,
        amadeusOfferId: this.selected()!.offerId ?? null,
        goalCents: goalCents
      };
      const res = await this.hotels.createRequest(body).toPromise();
      this.savedId.set(res!.request.id);
      // Navigate seeker somewhere, e.g., their dashboard
      this.router.navigateByUrl('/seeker');
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Saving failed');
    } finally {
      this.loading.set(false);
    }
  }
}
