import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargePage } from './recharge.page';

describe('RechargePage', () => {
  let component: RechargePage;
  let fixture: ComponentFixture<RechargePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RechargePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RechargePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
