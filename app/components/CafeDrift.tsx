export default function CafeDrift() {
  return <div className="cafe-drift" aria-hidden="true"><div className="drift-stage">
    <svg className="drift-cup" viewBox="0 0 300 300" fill="none">
      <circle cx="150" cy="150" r="139" stroke="#789064" strokeWidth="1.5" />
      <circle cx="150" cy="150" r="115" stroke="#789064" strokeWidth="1.5" />
      <path d="M240 124h15c27 0 27 51 0 51h-15" fill="#f6f1d5" stroke="#244d31" strokeWidth="5" />
      <circle cx="150" cy="150" r="94" fill="#f6f1d5" stroke="#244d31" strokeWidth="5" />
      <circle cx="150" cy="150" r="80" fill="#b58150" />
      <path d="M150 207c-15-36-52-35-52-68 0-21 29-23 52 4 23-27 52-25 52-4 0 33-37 32-52 68Z" fill="#f6f1d5" />
      <path d="M149 191c-19-31-34-40-35-59m37 59c18-31 34-40 35-59" stroke="#b58150" strokeWidth="4" strokeLinecap="round" />
      <path d="M147 213c3-20 4-37 3-65" stroke="#f6f1d5" strokeWidth="6" strokeLinecap="round" />
    </svg>
    {[0,1,2].map(i=><svg key={i} className={`drift-bean drift-bean-${i}`} viewBox="0 0 60 84" fill="none"><ellipse cx="30" cy="42" rx="25" ry="37" fill="#e2d7b3" stroke="#5e7652" strokeWidth="2"/><path d="M34 8c-25 23 18 45-8 68" stroke="#5e7652" strokeWidth="2.5" strokeLinecap="round"/></svg>)}
  </div></div>;
}
