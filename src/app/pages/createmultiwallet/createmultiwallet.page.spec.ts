import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatemultiwalletPage } from './createmultiwallet.page';

describe('CreatemultiwalletPage', () => {
  let component: CreatemultiwalletPage;
  let fixture: ComponentFixture<CreatemultiwalletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatemultiwalletPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatemultiwalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
