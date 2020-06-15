import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  constructor(private el: ElementRef,
    private renderer: Renderer2) { }

    @HostListener('mouseenter') ommouseenter() {
      this.renderer.addClass(this.el.nativeElement, 'hightlight');
    }

    @HostListener('mouseleave') ommouseleave() {
      this.renderer.removeClass(this.el.nativeElement, 'hightlight');
    }
}
