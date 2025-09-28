import { Component, inject, signal } from '@angular/core';
import { HomesService } from '../../services/homes.service';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-give-homes',
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe, RouterModule],
  templateUrl: './give-homes.html',
  styleUrl: './give-homes.scss'
})
export class GiveHomes {
  private api = inject(HomesService);

  loading = signal(false);
  error = signal<string | null>(null);
  rows = signal<any[]>([]);
  expandedId = signal<number | null>(null);
  apps = signal<Record<number, any[]>>({}); // listingId -> apps

  ngOnInit() { this.refresh(); }

  async refresh() {
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.api.listMine().toPromise();
      this.rows.set(res?.listings ?? []);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  async toggle(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
    if (this.expandedId() === id && !this.apps()[id]) {
      try {
        const res = await this.api.listApplications(id).toPromise();
        this.apps.update(m => ({ ...m, [id]: res?.applications ?? [] }));
      } catch (e: any) {
        this.error.set(e?.error?.message ?? e?.message ?? 'Failed to load applications.');
      }
    }
  }

  async setStatus(l: any, status: 'OPEN' | 'CLOSED') {
    this.loading.set(true);
    try {
      const res = await this.api.setStatus(l.id, status).toPromise();
      this.rows.update(rows => rows.map(r => r.id === l.id ? res!.listing : r));
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Failed to update status.');
    } finally {
      this.loading.set(false);
    }
  }

  async decide(appId: number, status: 'APPROVED' | 'DECLINED', listingId: number) {
    this.loading.set(true);
    try {
      const res = await this.api.decide(appId, status).toPromise();
      this.apps.update(m => ({
        ...m,
        [listingId]: (m[listingId] || []).map(a => a.id === appId ? res!.application : a)
      }));
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Failed to update application.');
    } finally {
      this.loading.set(false);
    }
  }
}
