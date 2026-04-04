import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';

interface Feature { title: string; desc: string; }
interface Testimonial { name: string; text: string; }

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {
  isScrolled = false;
  statsStarted = false;

  // Counter values for the stats section
  counters = { visitors: 0, clients: 0, orders: 0, integrations: 0 };

  features: Feature[] = [
    { title: 'Smart Inventory', desc: 'Real-time tracking of every SKU across multiple locations.' },
    { title: 'Global Orders', desc: 'Fulfill demand instantly with automated order processing.' },
    { title: 'Deep Analytics', desc: 'Transform warehouse data into actionable business growth.' },
    { title: 'Secure Access', desc: 'Protected by JWT authentication and Captcha validation.' },
    { title: 'Data Insights', desc: 'Detailed system reports on sales trends and stock levels.' }
  ];

  // Fixed: testimonials is now an array of objects to match the HTML loop
  testimonials: Testimonial[] = [
    { name: 'Sarah J.', text: 'Flow revolutionized our distribution efficiency overnight.' },
    { name: 'Mark T.', text: 'The most secure and scalable platform we have ever deployed.' },
    { name: 'Priya K.', text: 'Simple, intuitive, and reliable. Adapts to our workflow perfectly.' }
  ];

  ngOnInit() {
    // 🔍 VISITOR COUNTER: Increments on every page load
    const currentVisits = parseInt(localStorage.getItem('vCount') || '0');
    const newCount = currentVisits + 1;
    localStorage.setItem('vCount', newCount.toString());
  }

  ngAfterViewInit() {
    this.initScrollObserver();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  private initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          // Trigger numbers when stats section enters view
          if (entry.target.classList.contains('stats-banner') && !this.statsStarted) {
            this.animateStats();
          }
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate').forEach(el => observer.observe(el));
  }

  private animateStats() {
    this.statsStarted = true;
    const finalVisits = parseInt(localStorage.getItem('vCount') || '1');
    this.countUp('visitors', 0, finalVisits, 2000);
    this.countUp('clients', 0, 150, 1500);
    this.countUp('orders', 0, 1200, 2000);
    this.countUp('integrations', 0, 45, 1200);
  }

  private countUp(prop: keyof typeof this.counters, start: number, end: number, duration: number) {
    let current = start;
    const step = Math.ceil((end - start) / (duration / 20));
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { current = end; clearInterval(timer); }
      this.counters[prop] = current;
    }, 20);
  }
}