import { Component, inject, signal, computed } from '@angular/core';
import { SponsorService, OpenRequest } from '../../services/sponsor.service';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-give-hotels',
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './give-hotels.html',
  styleUrl: './give-hotels.scss'
})
export class GiveHotels {
  private api = inject(SponsorService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  rows = signal<OpenRequest[]>([]);
  expandedId = signal<number | null>(null);

  // contribution form (per expanded row)
  form = this.fb.group({
    amountUSD: [25, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.api.listOpen().toPromise();
      this.rows.set(res?.requests ?? []);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Failed to load requests.');
    } finally {
      this.loading.set(false);
    }
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  progressPercent(r: OpenRequest): number {
    const goal = r.goalCents ?? 0;
    if (!goal) return 0;
    return Math.min(100, Math.floor((r.raisedCents / goal) * 100));
  }

  async contribute(r: OpenRequest) {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const dollars = Number(this.form.value.amountUSD);
    const cents = Math.round(dollars * 100);
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.api.contribute(r.id, cents).toPromise();
      // Update in-place
      this.rows.update(rows => rows.map(it => it.id === r.id
        ? { ...it, raisedCents: res!.request.raisedCents, }
        : it));
      this.expandedId.set(null);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Contribution failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
