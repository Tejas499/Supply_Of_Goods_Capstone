import { Component } from '@angular/core';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent {
roleName:string|null;
constructor(){
  this.roleName=localStorage.getItem('role');
}
}
