import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordinfoPage } from './recordinfo.page';

describe('RecordinfoPage', () => {
  let component: RecordinfoPage;
  let fixture: ComponentFixture<RecordinfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordinfoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordinfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
