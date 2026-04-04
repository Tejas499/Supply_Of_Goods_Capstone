import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface Feature { title: string; desc: string; }
interface Testimonial { name: string; text: string; }

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('demoVideo') demoVideo!: ElementRef<HTMLVideoElement>;
constructor(private router: Router ){}
  isDarkMode = false;
  words = ['Seamless', 'Reliable', 'Optimized'];
  displayText = '';
  wordIndex = 0;
  charIndex = 0;
  isDeleting = false;
  isScrolled = false;
  showDemo = false;

  features: Feature[] = [
    { title: 'Smart Inventory', desc: 'Real-time tracking across warehouses with automated stock alerts and predictive reordering.' },
    { title: 'Order Automation', desc: 'End-to-end order processing from placement to delivery with multi-carrier integration.' },
    { title: 'Supply Chain Analytics', desc: 'AI-powered insights on demand forecasting, supplier performance, and logistics optimization.' },
    { title: 'Secure Authentication', desc: 'Enterprise-grade security with JWT tokens, role-based access control, and CAPTCHA protection.' },
    { title: 'Multi-Warehouse Management', desc: 'Centralized control of inventory across multiple locations with transfer tracking.' },
    { title: 'Supplier Portal', desc: 'Seamless communication with suppliers for purchase orders, invoices, and shipment tracking.' }
  ];

  testimonials: Testimonial[] = [
    { name: 'Sarah J.', text: 'Flow revolutionized our distribution efficiency overnight.' },
    { name: 'Mark T.', text: 'The most secure and scalable platform we have ever deployed.' },
    { name: 'Priya K.', text: 'Simple, intuitive, and reliable. Adapts to our workflow perfectly.' }
  ];

  ngOnInit() {
    const savedTheme = localStorage.getItem('flowTheme');
    if (savedTheme === 'dark') this.isDarkMode = true;
    this.typeEffect();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initScrollObserver(), 100);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('flowTheme', this.isDarkMode ? 'dark' : 'light');
  }
 login(){
    this.router.navigateByUrl('/login');
  }

registration(){
   this.router.navigateByUrl('/registration');
}
  typeEffect() {
    const currentWord = this.words[this.wordIndex];
    this.isDeleting ? this.charIndex-- : this.charIndex++;
    this.displayText = currentWord.substring(0, this.charIndex);
    
    let speed = this.isDeleting ? 120 : 180;
    if (!this.isDeleting && this.charIndex === currentWord.length) {
      this.isDeleting = true;
      speed = 1800;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      speed = 500;
    }
    setTimeout(() => this.typeEffect(), speed);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  private initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.animate').forEach(el => observer.observe(el));
  }

  openDemo() { this.showDemo = true; }

  closeDemo() {
    this.showDemo = false;
    if (this.demoVideo) {
      this.demoVideo.nativeElement.pause();
      this.demoVideo.nativeElement.currentTime = 0;
    }
  }
}