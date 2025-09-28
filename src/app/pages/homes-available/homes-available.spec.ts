import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomesAvailable } from './homes-available';

describe('HomesAvailable', () => {
  let component: HomesAvailable;
  let fixture: ComponentFixture<HomesAvailable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomesAvailable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomesAvailable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
