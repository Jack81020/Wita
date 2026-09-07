import { TestBed } from '@angular/core/testing';
import { App, getHeroStepIndex } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the shared layout components', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('site-navbar')).toBeTruthy();
    expect(compiled.querySelector('site-footer')).toBeTruthy();
  });

  it('should render the hero overlay and link to the next explanatory section', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    const mainChildren = Array.from(compiled.querySelector('#main')?.children ?? []);
    const hero = compiled.querySelector('.Pod5Hero_container__NsAaG');
    const callToAction = hero?.querySelector<HTMLAnchorElement>('.wita-hero-copy__cta');
    const heroParagraphs = Array.from(hero?.querySelectorAll('.wita-hero-copy__body p') ?? []);

    expect(hero?.querySelector('h1')?.textContent).toContain('Capire prima');
    expect(hero?.querySelectorAll('.wita-hero-steps li')).toHaveLength(3);
    expect(heroParagraphs).toHaveLength(3);
    expect(heroParagraphs[0]?.textContent).toContain('Sapere quando una persona ha bisogno di assistenza');
    expect(hero?.textContent).not.toContain('(sottotitolo)');
    expect(callToAction?.getAttribute('href')).toBe('#come-funziona');
    expect(callToAction?.querySelector('.wita-hero-copy__cta-mobile')?.textContent).toContain('SCOPRI MENTORAGE');
    expect(mainChildren[0]?.classList.contains('Pod5Hero_container__NsAaG')).toBe(true);
    expect(mainChildren[1]?.classList.contains('PodDoesNotReplaceBed_section__wTT6w')).toBe(true);
    expect(mainChildren[1]?.id).toBe('come-funziona');
    expect(compiled.querySelector('.TempElevationSound_container__uBfdh')).toBeNull();
    const benefits = compiled.querySelector('#mentorage-in-breve');
    const benefitTitles = Array.from(benefits?.querySelectorAll('h4') ?? []).map((title) => title.textContent?.trim());
    expect(benefits?.querySelector('h2')?.textContent).toContain('Monitora, interpreta e avvisa.');
    expect(benefitTitles).toEqual(['Monitora', 'Interpreta', 'Avvisa']);
  });

  it('should map the provisional video timeline to one active hero card at a time', () => {
    expect(getHeroStepIndex(0)).toBe(-1);
    expect(getHeroStepIndex(15.99)).toBe(-1);
    expect(getHeroStepIndex(16)).toBe(0);
    expect(getHeroStepIndex(25.99)).toBe(0);
    expect(getHeroStepIndex(26)).toBe(1);
    expect(getHeroStepIndex(29.99)).toBe(1);
    expect(getHeroStepIndex(30)).toBe(2);
    expect(getHeroStepIndex(39.99)).toBe(2);
    expect(getHeroStepIndex(40)).toBe(-1);
  });
});
