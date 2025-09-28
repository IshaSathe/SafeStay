import { Component, inject, signal } from '@angular/core';
import { HomesService } from '../../services/homes.service';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-homes-available',
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './homes-available.html',
  styleUrls: ['./homes-available.scss']
})
export class HomesAvailable {
  private api = inject(HomesService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  listings = signal<any[]>([]);
  expandedId = signal<number | null>(null);

  filter = this.fb.group({ city: [''] });

  appForm = this.fb.group({
    occupants: [1, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    message: ['']
  });

  myApps = signal<any[]>([]);
  loadingApps = signal(false);

  ngOnInit() { this.refresh(); this.refreshMyApps(); }

  async refreshMyApps() {
    this.loadingApps.set(true);
    try {
      const res = await this.api.listMyApplications().toPromise();
      this.myApps.set(res?.applications ?? []);
    } finally {
      this.loadingApps.set(false);
    }
  }
  
  async refresh() {
    this.loading.set(true); this.error.set(null);
    try {
      const city = this.filter.value.city?.trim() || undefined;
      const res = await this.api.listOpen(city).toPromise();
      this.listings.set(res?.listings ?? []);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Failed to load listings.');
    } finally {
      this.loading.set(false);
    }
  }

  toggle(id: number) { this.expandedId.set(this.expandedId() === id ? null : id); }

  async apply(listing: any) {
    if (this.appForm.invalid) { this.appForm.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    try {
      await this.api.apply(listing.id, {
        occupants: this.appForm.value.occupants!,
        startDate: this.appForm.value.startDate!,
        endDate: this.appForm.value.endDate!,
        message: this.appForm.value.message || null
      }).toPromise();
      this.expandedId.set(null);
      this.appForm.reset({ occupants: 1, startDate: '', endDate: '', message: '' });
      // Optionally show a toast / confirmation
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Application failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
