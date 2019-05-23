import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExprotPrikeyPage } from './exprot-prikey.page';

describe('ExprotPrikeyPage', () => {
  let component: ExprotPrikeyPage;
  let fixture: ComponentFixture<ExprotPrikeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExprotPrikeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExprotPrikeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
