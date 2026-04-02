import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {
  username: string = '';
  role: string = '';
  greeting: string = '';

  ngOnInit(): void {
    this.username = localStorage.getItem('userId') ? 
      (localStorage.getItem('username') || 'User') : 'User';
    this.role = localStorage.getItem('role') || '';
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    // Try to get stored username
    const stored = localStorage.getItem('username');
    if (stored) this.username = stored;
  }
}