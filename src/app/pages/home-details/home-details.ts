import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HomesService } from '../../services/homes.service';
import { NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-details',
  imports: [ReactiveFormsModule, NgIf, RouterModule],
  templateUrl: './home-details.html',
  styleUrl: './home-details.scss'
})
export class HomeDetails {
  private fb = inject(FormBuilder);
  private api = inject(HomesService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  successId = signal<number | null>(null);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    city: ['', Validators.required],
    state: [''],
    maxGuests: [1, [Validators.required, Validators.min(1)]],
    nightlyUSD: [0, [Validators.min(0)]], // optional; 0 = free
    availableFrom: [''],
    availableTo: ['']
  });

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    try {
      const nightlyCents = this.form.value.nightlyUSD ? Math.round(Number(this.form.value.nightlyUSD) * 100) : null;
      const res = await this.api.createListing({
        title: this.form.value.title!,
        description: this.form.value.description || null,
        city: this.form.value.city!,
        state: this.form.value.state || null,
        maxGuests: this.form.value.maxGuests!,
        nightlyCents,
        availableFrom: this.form.value.availableFrom || null,
        availableTo: this.form.value.availableTo || null
      }).toPromise();
      this.successId.set(res!.listing.id);
      this.router.navigateByUrl('/sponsor/homes/manage'); // optional redirect to manage page
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Failed to create listing.');
    } finally {
      this.loading.set(false);
    }
  }
}

