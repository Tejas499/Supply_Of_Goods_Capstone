import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {
  username: string = 'User';
  role: string = '';
  greeting: string = '';
  today: Date = new Date();

  // Mock stats - in a real app, these would come from your HttpService
  stats = [
    { label: 'Active Orders', value: '12', icon: '📦', trend: '+2 this week' },
    { label: 'Inventory Level', value: '85%', icon: '📊', trend: 'Stable' },
    { label: 'Pending Feedback', value: '3', icon: '💬', trend: 'Action required' }
  ];

  ngOnInit(): void {
    // Retrieve user data from storage
    this.username = localStorage.getItem('username') || 'User';
    this.role = localStorage.getItem('role') || 'Guest';
    
    // Dynamic Time-based Greeting
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 17) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }
}