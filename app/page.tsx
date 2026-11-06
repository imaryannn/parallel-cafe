'use client';
import { useState, useEffect, useRef } from 'react';
import ScrollExperience from './components/ScrollExperience';
import PageMotion from './components/PageMotion';
import CafeAtmosphere from './components/CafeAtmosphere';
import { ArrowUpRight, ArrowRight, Plus, Minus, X, Menu, Heart } from 'lucide-react';

type Drink = { name: string; type: 'Coffee' | 'Matcha' | 'Bakery'; note: string; price: string; image: string };

const drinks: Drink[] = [
  { name: 'Flat white', type: 'Coffee', note: 'Double espresso. Silky milk. Perfect balance.', price: '₹240', image: 'photo-1570968915860-54d5c301fa9f' },
  { name: 'Cold brew', type: 'Coffee', note: 'Slow steeped, smooth, and worth the wait.', price: '₹260', image: 'photo-1581996323441-538096e854b9' },
  { name: 'Iced latte', type: 'Coffee', note: 'Espresso, cold milk, and plenty of ice.', price: '₹250', image: 'photo-1461023058943-07fcbe16d735' },
  { name: 'Espresso', type: 'Coffee', note: 'Short, rich, and straight to the point.', price: '₹180', image: 'photo-1510707577719-ae7c14805e3a' },
  { name: 'Cappuccino', type: 'Coffee', note: 'Rich espresso under a cloud of velvety foam.', price: '₹250', image: 'https://images.pexels.com/photos/36010234/pexels-photo-36010234/free-photo-of-close-up-of-creamy-cappuccino-in-ceramic-cup.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Americano', type: 'Coffee', note: 'A double shot, lengthened with hot water.', price: '₹210', image: 'https://images.pexels.com/photos/793570/pexels-photo-793570.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Mocha', type: 'Coffee', note: 'Espresso, chocolate, and a soft cream finish.', price: '₹290', image: 'https://images.pexels.com/photos/17506134/pexels-photo-17506134.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Matcha latte', type: 'Matcha', note: 'Earthy matcha meets creamy oat milk.', price: '₹290', image: 'photo-1515823064-d6e0c04616a7' },
  { name: 'Oat matcha', type: 'Matcha', note: 'Smooth matcha, softened with oat milk.', price: '₹300', image: 'photo-1536256263959-770b48d82b0a' },
  { name: 'Iced matcha', type: 'Matcha', note: 'Whisked matcha, chilled milk, and plenty of ice.', price: '₹310', image: 'https://images.pexels.com/photos/8004561/pexels-photo-8004561.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Butter croissant', type: 'Bakery', note: 'Golden layers. A beautifully flaky affair.', price: '₹180', image: 'photo-1555507036-ab1f4038808a' },
  { name: 'Cinnamon bun', type: 'Bakery', note: 'Warm spice, soft crumb, no sharing required.', price: '₹190', image: 'photo-1509365465985-25d11c17e812' },
  { name: 'Chocolate chip cookie', type: 'Bakery', note: 'Golden edges, a soft centre, and chocolate chips.', price: '₹150', image: 'https://images.pexels.com/photos/9424236/pexels-photo-9424236.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Chocolate brownie', type: 'Bakery', note: 'Deep cocoa, a fudgy middle, a crackly top.', price: '₹220', image: 'https://images.pexels.com/photos/14576527/pexels-photo-14576527.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Lemon cake', type: 'Bakery', note: 'Soft lemon sponge with a bright, sweet finish.', price: '₹200', image: 'https://images.pexels.com/photos/8478182/pexels-photo-8478182.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { name: 'Blueberry muffin', type: 'Bakery', note: 'A tender crumb with pockets of juicy blueberries.', price: '₹190', image: 'https://images.pexels.com/photos/13600669/pexels-photo-13600669.jpeg?auto=compress&cs=tinysrgb&w=900' },
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
  const [saved, setSaved] = useState<string[]>([]);
  const [savedReady, setSavedReady] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [finder, setFinder] = useState(false);
  const [mood, setMood] = useState('A slow morning');
  const match = drinks[mood === 'A bold start' ? 3 : mood === 'An afternoon pause' ? 1 : 0];

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('parallel-favourites') || '[]');
      if (Array.isArray(stored)) setSaved(stored.filter((name): name is string => typeof name === 'string' && drinks.some(d => d.name === name)));
    } catch { /* Storage is optional. */ }
    setSavedReady(true);
  }, []);
  useEffect(() => {
    if (savedReady) try { localStorage.setItem('parallel-favourites', JSON.stringify(saved)); } catch { /* Keep in-memory favourites. */ }
  }, [saved, savedReady]);
  const toggleSaved = (name: string) => setSaved(items => items.includes(name) ? items.filter(item => item !== name) : [...items, name]);
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previous = openerRef.current;
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
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handler); previous?.focus({ preventScroll: true }); };
  }, [selected]);

  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('cafe:refresh')));
    return () => cancelAnimationFrame(id);
  }, [filter, savedOnly, saved, finder, faq]);

  const visibleDrinks = drinks.filter(d => (filter === 'All' || d.type === filter) && (!savedOnly || saved.includes(d.name)));

  return (
    <main id="home">
      <PageMotion />
      <ScrollExperience>
        <section className="hero" id="ritual" aria-label="Parallel Café, from bean to cup">
          <header>
            <a className="brand" href="#home" aria-label="Parallel Café home"><Mark /><span>PARALLEL<br />CAFÈ</span></a>
            <nav className={mobile ? 'nav open' : 'nav'} id="main-navigation" aria-label="Main navigation">
              {[['Home', 'home'], ['Our story', 'story'], ['The craft', 'craft'], ['The menu', 'menu']].map(([label, id], i) =>
                <a key={id} className={i === 0 ? 'active' : ''} href={'#' + id} onClick={() => setMobile(false)}>{label}</a>
              )}
            </nav>
            <a className="visit-link" href="#visit">COME SAY HELLO <ArrowUpRight size={18} /></a>
            <button className="mobile-toggle" onClick={() => setMobile(!mobile)} aria-expanded={mobile} aria-controls="main-navigation" aria-label="Toggle menu">{mobile ? <X /> : <Menu />}</button>
          </header>

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
              <button className="scroll-cue" type="button" data-brew-start><span>SCROLL TO MAKE YOUR COFFEE</span><i /></button>
            </div>
          </div>

          <Cup />
          <div className="hero-process" aria-label="The making of a Parallel latte">
            <div className="process-captions">
              {[
                ['It starts with', 'a good bean.', 'Whole beans. Freshly ground. Nothing in between.'],
                ['A little', 'precision.', 'Ground to order. Balanced, tamped, ready.'],
                ['Under pressure.', 'Into something good.', 'A rich double shot, drawn slowly and carefully.'],
                ['The softer', 'side of coffee.', 'Silky milk meets espresso. A little art follows.'],
                ['Your daily', 'Parallel.', 'Lid on. World off. Take a little moment with you.'],
              ].map(([first, second, description], i) =>
                <div className="process-caption" key={first} aria-hidden={i !== 0}>
                  <h2>{first}<br /><em>{second}</em></h2>
                  <p>{description}</p>
                </div>
              )}
            </div>
            <div className="process-bottom">
              <nav className="process-chapters" aria-label="Coffee making stages">
                {['The beans', 'The grind', 'The espresso', 'The milk', 'Your Parallel'].map((step, i) =>
                  <button key={step} type="button" data-brew-step={i}>{step}</button>
                )}
              </nav>
              <a href="#story" className="process-skip">Explore the café <ArrowUpRight size={14} /></a>
            </div>
            <div className="process-track" aria-hidden="true"><i /></div>
          </div>
        </section>
        {[
          ['beans', 'Good things', 'start small.', 'Whole beans, chosen for character. The beginning of every Parallel cup.'],
          ['grind', 'A little', 'precision.', 'Freshly ground. Carefully measured. A small ritual that makes all the difference.'],
          ['espresso', 'Worth', 'the wait.', 'Water, pressure, and a little patience. A rich double shot finds its way into your cup.'],
          ['milk', 'Something', 'softer.', 'Silky milk folds into espresso. A steady hand leaves a little art on the surface.'],
          ['ready', 'Made for', 'your day.', 'One good cup. A moment to yourself. Take it with you, or stay a little longer.'],
        ].map(([id, title, emphasis, copy], index) => (
          <section className="brew-chapter" id={index === 0 ? 'craft' : id} key={id} aria-labelledby={`chapter-${id}`}>
            <div className="brew-copy">
              <h2 id={`chapter-${id}`}>{title}<br /><em>{emphasis}</em></h2>
              <p>{copy}</p>
              {index === 4 && <a className="cream-button" href="#menu">Find your favourite <ArrowUpRight size={18} /></a>}
            </div>
          </section>
        ))}
      </ScrollExperience>

      <div className="cafe-pages">
        <CafeAtmosphere />
        <section id="story" className="story section" aria-labelledby="story-heading">
          <div className="story-layout">
            <div className="story-copy">
              <h2 id="story-heading" className="story-title kinetic-heading"><span>Different days.</span><em>Same wavelength.</em></h2>
              <div className="story-note">
                <p className="story-lede">Some things just go together.<br />Coffee and conversation.<br />You and your favourite corner.</p>
                <div className="story-detail"><p className="story-body">That’s the idea behind Parallel. A place for crossing paths, finding your people, or taking a moment that’s entirely yours.</p>
                <a className="story-link" href="#menu">Find your usual <ArrowUpRight size={19} /></a></div>
              </div>
            </div>

          </div>
        </section>

        <section className="menu-section section" id="menu">
          <div className={finder ? 'menu-head finder-open' : 'menu-head'}>
            <h2>Your daily<br /><em>favourites.</em></h2>
            <div className="menu-intro">
              <p>For early starts and long afternoons.<br />Find something to call your usual.</p>
              <div className="filters" aria-label="Menu categories">
                {['All', 'Coffee', 'Matcha', 'Bakery'].map(x =>
                  <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)} aria-pressed={filter === x}>{x}</button>
                )}
                <button className={savedOnly ? 'selected' : ''} aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>Saved ({saved.length})</button>
              </div>
              <button className="finder-toggle" aria-expanded={finder} aria-controls="drink-finder" onClick={() => setFinder(!finder)}>Help me choose {finder ? <Minus size={15} /> : <Plus size={15} />}</button>
            </div>
          {finder && <div className="drink-finder" id="drink-finder">
            <div><span className="eyebrow">WHAT KIND OF MOMENT?</span><div className="mood-options">
              {['A bold start', 'A slow morning', 'An afternoon pause'].map(option => <button key={option} aria-pressed={mood === option} onClick={() => setMood(option)}>{option}</button>)}
            </div></div>
            <div className="finder-match" aria-live="polite"><span>We’d pour you a</span><strong>{match.name}.</strong><p>{match.note}</p><button className="text-link" onClick={e => { openerRef.current = e.currentTarget; setSelected(match); }}>Take a look <ArrowUpRight size={17} /></button></div>
          </div>}
          </div>
          <div className="menu-display">
          <div className="menu-grid" aria-live="polite" aria-label={`${filter} menu`}>
            {visibleDrinks.map((d, index) =>
              <button className="menu-card" key={d.name} onClick={e => { openerRef.current = e.currentTarget; setSelected(d); }}>
                <span className="menu-item-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className="menu-item-copy"><div className="item-title"><h3>{d.name}</h3><span>{d.price}</span></div>
                <p>{d.note}</p></div><span className="menu-item-open" aria-hidden="true"><ArrowUpRight size={21} /></span>
              </button>
            )}
          </div>
          {visibleDrinks.length === 0 && <div className="menu-empty"><Heart size={23} /><p>{saved.length ? 'No saved favourites in this category.' : 'A little list of your favourites.'}</p><span>{saved.length ? 'Try another category to see your saved drinks.' : 'Open a menu item and tap Save for later to start your list.'}</span><button className="text-link" onClick={() => { setSavedOnly(false); setFilter('All'); }}>Explore the menu <ArrowRight size={16} /></button></div>}
          <p className="menu-footnote">Sample menu and prices.</p>
          </div>
        </section>

        <section className="cta section" id="closing">
          <div className="cta-stage">
            <h2 className="cta-giant kinetic-heading"><span>Side by</span> <em>side.</em></h2>
            <div className="cta-note">
              <p className="cta-lede">Your favourite coffee.<br />Your favourite company.<br />A little more time for both.</p>
              <div className="cta-actions">
                <a className="closing-menu-link" href="#menu"><span>Explore the <em>menu.</em></span><ArrowUpRight size={36} strokeWidth={1.4} aria-hidden="true" /></a>
                <a className="text-link" href="#visit">Come say hello <ArrowUpRight size={18} /></a>
              </div>
            </div>
          </div>

        </section>

      </div>

        <footer id="visit">
          <div className="footer-faq">
            <div>
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
          <h2>LET’S BE<br /><span>PARALLEL<span className="footer-period">.</span></span><a href="#home" aria-label="Back to top"><ArrowUpRight /></a></h2>
          <div className="footer-bottom">
            <a className="brand" href="#home"><Mark /><span>PARALLEL CAFÈ</span></a>
            <span>Good things happen side by side.</span>
            <span>© {new Date().getFullYear()} Parallel Cafè</span>
          </div>
        </footer>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={selected.name} className="product-modal" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') setSelected(null); }}>
            <button autoFocus className="modal-close" aria-label="Close menu details" onClick={() => setSelected(null)}><X /></button>
            <img className={selected.name === 'Cold brew' ? 'menu-detail-photo cold-brew-photo' : 'menu-detail-photo'} src={selected.image.startsWith('https://') ? selected.image : `https://images.unsplash.com/${selected.image}?auto=format&fit=crop&w=900&q=85`} alt={selected.name} />

            <div>
              <span className="eyebrow">{selected.type} / PARALLEL FAVOURITES</span>
              <h2>{selected.name}</h2>
              <p>{selected.note}</p>
              <strong>{selected.price}</strong>
              <p className="detail-note">A preview of our menu. Ordering will be available when the café opens.</p>
              <button className="save-favourite" aria-pressed={saved.includes(selected.name)} onClick={() => toggleSaved(selected.name)}><Heart size={18} fill={saved.includes(selected.name) ? 'currentColor' : 'none'} />{saved.includes(selected.name) ? 'Saved for later' : 'Save for later'}</button>
              <button className="green-button" onClick={() => setSelected(null)}>Keep exploring <ArrowRight size={18} /></button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
