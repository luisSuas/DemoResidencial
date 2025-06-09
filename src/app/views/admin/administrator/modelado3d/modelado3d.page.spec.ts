import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modelado3dPage } from './modelado3d.page';

describe('Modelado3dPage', () => {
  let component: Modelado3dPage;
  let fixture: ComponentFixture<Modelado3dPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Modelado3dPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
