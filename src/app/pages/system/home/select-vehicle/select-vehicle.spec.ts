import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectVehicle } from './select-vehicle';

describe('SelectVehicle', () => {
  let component: SelectVehicle;
  let fixture: ComponentFixture<SelectVehicle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectVehicle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectVehicle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
