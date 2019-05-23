import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScancodePage } from './scancode.page';

describe('ScancodePage', () => {
  let component: ScancodePage;
  let fixture: ComponentFixture<ScancodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScancodePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScancodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
