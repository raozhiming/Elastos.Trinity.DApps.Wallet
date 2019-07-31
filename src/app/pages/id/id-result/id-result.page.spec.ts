import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdResultPage } from './id-result.page';

describe('IdResultPage', () => {
  let component: IdResultPage;
  let fixture: ComponentFixture<IdResultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdResultPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
