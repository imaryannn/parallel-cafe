'use client';
import { useState, useEffect, useRef } from 'react';
import ScrollExperience from './components/ScrollExperience';
import { ArrowUpRight, ArrowRight, Plus, Minus, X, Menu, Coffee, Sprout, Heart } from 'lucide-react';

type Drink = { name: string; type: 'Coffee' | 'Matcha' | 'Bakery'; note: string; price: string; image: string };

const drinks: Drink[] = [
  { name: 'The everyday flat white', type: 'Coffee', note: 'Double espresso. Silky milk. Perfect balance.', price: '₹240', image: 'photo-1570968915860-54d5c301fa9f' },
  { name: 'A little cold brew', type: 'Coffee', note: 'Slow steeped, smooth, and worth the wait.', price: '₹260', image: 'photo-1517701604599-bb29b565090c' },
  { name: 'The slow latte', type: 'Coffee', note: 'A softer pour for a slower kind of morning.', price: '₹250', image: 'photo-1461023058943-07fcbe16d735' },
  { name: 'A proper espresso', type: 'Coffee', note: 'Short, rich, and straight to the point.', price: '₹180', image: 'photo-1510707577719-ae7c14805e3a' },
  { name: 'Your matcha moment', type: 'Matcha', note: 'Earthy matcha meets creamy oat milk.', price: '₹290', image: 'photo-1515823064-d6e0c04616a7' },
  { name: 'Iced matcha, easy', type: 'Matcha', note: 'Bright, cold, and quietly energising.', price: '₹300', image: 'photo-1536256263959-770b48d82b0a' },
  { name: 'The butter half', type: 'Bakery', note: 'Golden layers. A beautifully flaky affair.', price: '₹180', image: 'photo-1555507036-ab1f4038808a' },
  { name: 'Cinnamon, always', type: 'Bakery', note: 'Warm spice, soft crumb, no sharing required.', price: '₹190', image: 'photo-1509365465985-25d11c17e812' },
];

const craftSteps = [
  ['01', 'Sourced with care', 'Beans with a story, chosen for the cup they make.'],
  ['02', 'Brewed slowly', 'Recipes dialled in daily. Never rushed.'],
  ['03', 'Finished by hand', 'Poured for your kind of day, one cup at a time.'],
];

const faqs = [
  ['What’s on the menu?', 'Espresso favourites, slow cold brews, matcha, and something buttery on the side. Explore the sample menu above to find your kind of coffee.'],
  ['Can I make it plant-based?', 'Our concept menu includes oat milk pairings. Final milk options and allergen information will be available with the café’s confirmed menu.'],
  ['Where can I find Parallel?', 'Our address and opening hours are coming soon. This is a first look at the Parallel Café experience — keep this page close for the next chapter.'],
];

function Mark({ className = '' }: { className?: string }) {
  return <span className={'mark ' + className} aria-hidden="true"><i /><i /></span>;
}

function Cup() {
  return (
    <div className="cup-scene" aria-label="Forest green Parallel Café takeaway coffee cup" role="img">
      <div className="cup-shadow" />
      <div className="cup">
        <div className="cup-lid-top" />
        <div className="cup-lid" />
        <div className="cup-rim" />
        <div className="cup-body">
          <div className="cup-grain" />
          <span className="cup-small">GOOD COFFEE.<br />BETTER COMPANY.</span>
          <div className="cup-brand"><Mark /><strong>PARALLEL<br />CAFÈ</strong></div>
          <span className="cup-bottom">FIND YOUR LITTLE PAUSE.</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState<Drink | null>(null);
  const [faq, setFaq] = useState<number | null>(0);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'Tab') {
        const items = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handler); previous?.focus(); };
  }, [selected]);

  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('cafe:refresh')));
    return () => cancelAnimationFrame(id);
  }, [filter]);

  const visibleDrinks = drinks.filter(d => filter === 'All' || d.type === filter);

  return (
    <main id="home">
      <ScrollExperience>
        <section className="hero">
          <header>
            <a className="brand" href="#home" aria-label="Parallel Café home"><Mark /><span>PARALLEL<br />CAFÈ</span></a>
            <nav className={mobile ? 'nav open' : 'nav'} aria-label="Main navigation">
              {[['Home', 'home'], ['Our story', 'story'], ['The craft', 'craft'], ['The menu', 'menu']].map(([label, id], i) =>
                <a key={id} className={i === 0 ? 'active' : ''} href={'#' + id} onClick={() => setMobile(false)}>{label}</a>
              )}
            </nav>
            <a className="visit-link" href="#visit">COME SAY HELLO <ArrowUpRight size={18} /></a>
            <button className="mobile-toggle" onClick={() => setMobile(!mobile)} aria-expanded={mobile} aria-label="Toggle menu">{mobile ? <X /> : <Menu />}</button>
          </header>

          <div className="hero-meta">
            <span>COFFEE, COMPANY &amp; A LITTLE IN BETWEEN.</span>
            <span>YOUR DAILY MOMENT OF PARALLEL</span>
          </div>

          <h1 className="hero-giant" aria-label="Parallel Café — good coffee, better company">
            <span>PARALLEL</span>
            <em>café</em>
          </h1>

          <div className="hero-lower">
            <div className="hero-lower-left">
              <p className="hero-tagline">Good coffee.<br /><em>Better company.</em></p>
              <a className="cream-button" href="#menu">Find your favourite <ArrowUpRight size={19} /></a>
            </div>
            <div className="hero-lower-right">
              <p>A little pause. A great cup of coffee. A place where your day comes together.</p>
              <a className="scroll-cue" href="#story"><span>SCROLL TO UNFOLD</span><i /></a>
            </div>
          </div>

          <Cup />
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map(copy =>
              <div className="ticker-group" key={copy}>
                <span>GOOD COFFEE</span><Mark />
                <span>BETTER COMPANY</span><Mark />
                <span>SAME WAVELENGTH</span><Mark />
                <span>PARALLEL CAFÈ</span><Mark />
                <span>FIND YOUR LITTLE PAUSE.</span><Mark />
              </div>
            )}
          </div>
        </div>

        <section id="story" className="story section">
          <div className="eyebrow"><span>OUR KIND OF PLACE</span><span>MEET PARALLEL ↗</span></div>
          <div className="story-stage">
            <h2 className="story-title">Different days.<br /><em>Same wavelength.</em></h2>
            <div className="story-note">
              <p className="story-lede">Some things just go together. Coffee and conversation. You and your favourite corner.</p>
              <p className="story-body">That’s the idea behind Parallel. A space for crossing paths, finding your people, or simply enjoying a moment that’s entirely yours. Nothing complicated. Just good things, side by side.</p>
              <a className="text-link" href="#craft">Made with care <ArrowUpRight size={19} /></a>
            </div>
            
          </div>
          <div className="values">
            <span><Coffee /> Thoughtfully brewed</span>
            <span><Sprout /> A little closer to nature</span>
            <span><Heart /> Made for good company</span>
          </div>
        </section>

        <section id="craft" className="craft section">
          <div className="eyebrow"><span>THE CRAFT</span><span>SLOW BY DESIGN</span></div>
          <div className="craft-stage">
            <div className="craft-copy">
              <span className="craft-kicker">FROM BEAN TO CUP</span>
              <h2>Made<br />by <em>hand.</em></h2>
              <p>We take our time with the things that matter. Beans chosen for character, milk steamed to a quiet gloss, and every cup finished by hand. Nothing rushed. Nothing extra.</p>
              <a className="text-link" href="#menu">See what we’re pouring <ArrowUpRight size={19} /></a>
            </div>
            <figure className="craft-photo">
              <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=85" alt="Coffee being carefully poured at Parallel Café" loading="lazy" />
              <figcaption><span>THE SLOW POUR</span><span>MADE TO ORDER ↗</span></figcaption>
            </figure>
          </div>
          <ol className="craft-steps">
            {craftSteps.map(([n, title, copy]) =>
              <li key={n}><span>{n}</span><div><strong>{title}</strong><p>{copy}</p></div></li>
            )}
          </ol>
        </section>

        <section className="menu-section section" id="menu">
          <div className="eyebrow"><span>THE GOOD STUFF</span><span>A CUP FOR EVERY MOOD</span></div>
          <div className="menu-head">
            <h2>Meet your<br /><em>usual.</em></h2>
            <div className="menu-intro">
              <p>Your morning pick-me-up. Your afternoon excuse.<br />A few things we think you’ll love.</p>
              <div className="filters" aria-label="Menu categories">
                {['All', 'Coffee', 'Matcha', 'Bakery'].map(x =>
                  <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)} aria-pressed={filter === x}>{x}</button>
                )}
              </div>
            </div>
          </div>
          <div className="menu-grid">
            {visibleDrinks.map(d =>
              <button className="menu-card" key={d.name} onClick={() => setSelected(d)}>
                <div className="menu-image">
                  <img src={'https://images.unsplash.com/' + d.image + '?auto=format&fit=crop&w=800&q=85'} alt={d.name} loading="lazy" />
                  <span className="item-category">{d.type}</span>
                  <span className="item-plus"><Plus size={22} /></span>
                </div>
                <div className="item-title"><h3>{d.name}</h3><span>{d.price}</span></div>
                <p>{d.note}</p>
              </button>
            )}
          </div>
          <p className="menu-footnote">A taste of what’s to come. Illustrative menu &amp; prices.</p>
        </section>

        <section className="cta section" id="closing">
          <div className="eyebrow"><span>ONE MORE GOOD MOMENT</span><span>YOUR PLACE IS READY</span></div>
          <div className="cta-stage">
            <h2 className="cta-giant">Side<br />by <em>side.</em></h2>
            <div className="cta-note">
              <span className="cta-kicker">A NEW CHAPTER, COMING SOON</span>
              <p className="cta-lede">A little pause, a great cup, and a place where your day comes together. Your next favourite cup is waiting.</p>
              <div className="cta-actions">
                <a className="green-button" href="#menu">Find your favourite <ArrowUpRight size={19} /></a>
                <a className="text-link" href="#visit">Come say hello <ArrowUpRight size={18} /></a>
              </div>
            </div>
            
          </div>
          <div className="cta-foot">
            <span>ROOM FOR YOUR KIND OF DAY.</span>
            <span>PARALLEL CAFÈ / SIDE BY SIDE.</span>
          </div>
        </section>

        <footer id="visit">
          <div className="footer-faq">
            <div>
              <span className="eyebrow">A FEW LITTLE THINGS</span>
              <h3>Before you<br /><em>drop by.</em></h3>
            </div>
            <div className="faq-list">
              {faqs.map(([q, a], i) =>
                <div className="faq-item" key={q}>
                  <button aria-expanded={faq === i} aria-controls={'answer-' + i} onClick={() => setFaq(faq === i ? null : i)}>{q}{faq === i ? <Minus size={19} /> : <Plus size={19} />}</button>
                  {faq === i && <p id={'answer-' + i}>{a}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="footer-top">
            <span className="eyebrow">YOUR COFFEE. YOUR PEOPLE. YOUR PLACE.</span>
            <span className="coming"><i /> A NEW CHAPTER, COMING SOON</span>
          </div>
          <h2>LET’S BE<br /><span>PARALLEL.</span><a href="#home" aria-label="Back to top"><ArrowUpRight /></a></h2>
          <div className="footer-bottom">
            <a className="brand" href="#home"><Mark /><span>PARALLEL CAFÈ</span></a>
            <span>Good things happen side by side.</span>
            <span>© {new Date().getFullYear()} Parallel Cafè</span>
          </div>
        </footer>
      </ScrollExperience>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={selected.name} className="product-modal" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') setSelected(null); }}>
            <button autoFocus className="modal-close" aria-label="Close menu details" onClick={() => setSelected(null)}><X /></button>
            <img src={'https://images.unsplash.com/' + selected.image + '?auto=format&fit=crop&w=700&q=85'} alt={selected.name} />
            <div>
              <span className="eyebrow">{selected.type} / PARALLEL FAVOURITES</span>
              <h2>{selected.name}</h2>
              <p>{selected.note}</p>
              <strong>{selected.price}</strong>
              <p className="detail-note">A preview of our menu. Ordering will be available when the café opens.</p>
              <button className="green-button" onClick={() => setSelected(null)}>Keep exploring <ArrowRight size={18} /></button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
