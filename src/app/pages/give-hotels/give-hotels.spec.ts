import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveHotels } from './give-hotels';

describe('GiveHotels', () => {
  let component: GiveHotels;
  let fixture: ComponentFixture<GiveHotels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiveHotels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiveHotels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
