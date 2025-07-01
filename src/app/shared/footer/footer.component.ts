import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('marqueeTrack') marqueeTrack!: ElementRef;
  
  // Reference to the GSAP animation for cleanup
  private marqueeAnimation: gsap.core.Timeline | null = null;

  constructor() {}

  ngAfterViewInit(): void {
    this.initMarqueeAnimation();
    
    // Only keep the resize handler
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    // Cleanup
    if (this.marqueeAnimation) {
      this.marqueeAnimation.kill();
    }
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    // Kill the existing animation and reinitialize it
    if (this.marqueeAnimation) {
      this.marqueeAnimation.kill();
    }
    this.initMarqueeAnimation();
  }

  private initMarqueeAnimation(): void {
    if (!this.marqueeTrack?.nativeElement) return;

    const track = this.marqueeTrack.nativeElement;
    const firstItem = track.children[0];
    
    if (!firstItem) return;
    
    // Get the width of a single content block
    const itemWidth = firstItem.offsetWidth;
    
    // Calculate the appropriate duration (adjust for speed)
    const duration = itemWidth / 50; // Lower = faster
    
    // Reset position
    gsap.set(track, { x: 0 });
    
    // Create seamless loop without pause functionality
    this.marqueeAnimation = gsap.timeline({
      repeat: -1 // Infinite loop
    })
    .to(track, {
      x: -itemWidth,
      duration: duration,
      ease: "none",
      modifiers: {
        x: gsap.utils.unitize(x => {
          // This is the magic - when we reach the end, we wrap back
          return parseFloat(x) % itemWidth;
        })
      }
    });
  }
}
