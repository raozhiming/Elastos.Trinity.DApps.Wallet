import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCreatePage } from './contact-create.page';

describe('ContactCreatePage', () => {
  let component: ContactCreatePage;
  let fixture: ComponentFixture<ContactCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactCreatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
