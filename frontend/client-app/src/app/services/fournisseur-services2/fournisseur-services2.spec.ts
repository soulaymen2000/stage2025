import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FournisseurServices2Component } from '../fournisseur-services2/fournisseur-services2';

describe('FournisseurServices2Component', () => {
  let component: FournisseurServices2Component;
  let fixture: ComponentFixture<FournisseurServices2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FournisseurServices2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FournisseurServices2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
