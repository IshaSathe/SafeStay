import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelRequest } from './hotel-request';

describe('HotelRequest', () => {
  let component: HotelRequest;
  let fixture: ComponentFixture<HotelRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
