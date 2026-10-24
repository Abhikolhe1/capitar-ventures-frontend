import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Every scroll transition continues from the current visual state, including exits.
export function createDirectionalReveal(
  targets: gsap.TweenTarget,
  trigger: Element,
  from: gsap.TweenVars,
  to: gsap.TweenVars,
  start = 'top 70%'
) {
  let active: gsap.core.Tween | undefined;
  const duration = Math.max(1.1, Number(to.duration || 1.1));
  const hide = (upward: boolean) => {
    active?.kill();
    active = gsap.to(targets, {
      ...from,
      y: upward ? -Math.abs(Number(from.y || 0)) : Math.abs(Number(from.y || 0)),
      duration,
      ease: 'power2.inOut',
      stagger: typeof to.stagger === 'number' ? { each: to.stagger, from: 'end' } : to.stagger,
      overwrite: 'auto',
    });
  };
  const show = () => {
    active?.kill();
    active = gsap.to(targets, { ...to, duration, overwrite: 'auto' });
  };
  gsap.set(targets, from);
  const controller = ScrollTrigger.create({
    trigger, start, end: 'bottom top',
    onEnter: show,
    onEnterBack: show,
    onLeave: () => hide(true),
    onLeaveBack: () => hide(false),
  });
  // Refresh/history restoration may begin in the middle of the page.
  if (!controller.isActive) {
    gsap.set(targets, { ...from, y: window.scrollY > controller.end ? -Math.abs(Number(from.y || 0)) : Math.abs(Number(from.y || 0)) });
  }
  return () => { active?.kill(); controller.kill(); };
}
