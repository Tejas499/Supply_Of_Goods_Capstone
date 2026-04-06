import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

interface Stage {
phrase: string;
sub: string;
icon: string;
}

@Component({
selector: 'app-intro-animation',
templateUrl: './intro-animation.component.html',
styleUrls: ['./intro-animation.component.scss']
})
export class IntroAnimationComponent implements OnInit, OnDestroy {

stages: Stage[] =[
  { phrase: 'Manufacturer.', sub: 'produces goods in factories', icon: '🏭' },
  { phrase: 'Wholesaler.',   sub: 'stores and distributes goods', icon: '📦' },
  { phrase: 'Consumer.',     sub: 'receives and uses products',   icon: '🤝' }
]
;

currentStage = 0;
phase: 'enter' | 'hold' | 'exit' | 'logo' | 'fadeout' = 'enter';
showLogo = false;
fadeOut = false;
private timers: any[] = [];

constructor(private router: Router) {}

ngOnInit(): void {
// Skip intro if already seen this session
if (sessionStorage.getItem('introSeen')) {
this.router.navigateByUrl('/landing');
return;
}
this.runStage(0);
}

ngOnDestroy(): void {
this.timers.forEach(t => clearTimeout(t));
}

private t(fn: () => void, ms: number) {
const id = setTimeout(fn, ms);
this.timers.push(id);
}

runStage(index: number): void {
if (index >= this.stages.length) {
this.showLogoReveal();
return;
}
this.currentStage = index;
this.phase = 'enter';

// hold after enter animation (600ms enter + 1400ms hold)
this.t(() => { this.phase = 'hold'; }, 600);
// exit
this.t(() => { this.phase = 'exit'; }, 2000);
// next stage
this.t(() => { this.runStage(index + 1); }, 2600);
}

showLogoReveal(): void {
this.phase = 'logo';
this.showLogo = true;

// fade out everything and navigate
this.t(() => {
this.fadeOut = true;
}, 2200);

this.t(() => {
sessionStorage.setItem('introSeen', '1');
this.router.navigateByUrl('/landing');
}, 3000);
}

skip(): void {
this.timers.forEach(t => clearTimeout(t));
sessionStorage.setItem('introSeen', '1');
this.router.navigateByUrl('/landing');
}
}