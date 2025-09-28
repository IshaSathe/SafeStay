import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveHomes } from './give-homes';

describe('GiveHomes', () => {
  let component: GiveHomes;
  let fixture: ComponentFixture<GiveHomes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiveHomes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiveHomes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
