import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDetails } from './home-details';

describe('HomeDetails', () => {
  let component: HomeDetails;
  let fixture: ComponentFixture<HomeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
