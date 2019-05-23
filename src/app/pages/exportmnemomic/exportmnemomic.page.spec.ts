import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportmnemomicPage } from './exportmnemomic.page';

describe('ExportmnemomicPage', () => {
  let component: ExportmnemomicPage;
  let fixture: ComponentFixture<ExportmnemomicPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportmnemomicPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportmnemomicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
