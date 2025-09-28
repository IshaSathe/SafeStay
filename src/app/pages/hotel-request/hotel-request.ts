import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HotelsService } from '../../services/hotels.service';
import { NgIf, NgFor, DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterModule} from '@angular/router';

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
  imports: [RouterModule,ReactiveFormsModule, NgIf, NgFor, DatePipe, CurrencyPipe],
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
    endDate: ['', Validators.required],
    guests: [1, [Validators.required, Validators.min(1)]],
    rooms: [1, [Validators.min(1)]],
    cityCode: ['', Validators.required], // Amadeus requires IATA city code
    notes: [''],
  });

  get f() { return this.form.controls; }

  mine = signal<Array<any>>([]);

  ngOnInit() {
    this.loadMine();
  }

  async loadMine() {
    try {
      const res = await this.hotels.listMineWithProgress().toPromise();
      this.mine.set(res?.requests ?? []);
    } catch (_) { /* optional: show a toast */ }
  }

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

pick(group: OfferGroup, offerId ?: string) {
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
      endDate: this.form.value.endDate!,
      guests: this.form.value.guests!,
      rooms: this.form.value.rooms ?? null,
      cityCode: this.form.value.cityCode!,
      notes: this.form.value.notes ?? null,
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
