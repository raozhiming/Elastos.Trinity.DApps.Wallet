import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportprivatekeyPage } from './importprivatekey.page';

describe('ImportprivatekeyPage', () => {
  let component: ImportprivatekeyPage;
  let fixture: ComponentFixture<ImportprivatekeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportprivatekeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportprivatekeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
