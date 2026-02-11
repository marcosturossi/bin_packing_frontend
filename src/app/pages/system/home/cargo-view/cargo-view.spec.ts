import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoView } from './cargo-view';

describe('CargoView', () => {
  let component: CargoView;
  let fixture: ComponentFixture<CargoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargoView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
