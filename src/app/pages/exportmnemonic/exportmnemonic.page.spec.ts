import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportmnemonicPage } from './exportmnemonic.page';

describe('ExportmnemonicPage', () => {
  let component: ExportmnemonicPage;
  let fixture: ComponentFixture<ExportmnemonicPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportmnemonicPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportmnemonicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
