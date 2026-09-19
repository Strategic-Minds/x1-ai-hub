import React from "react";
import { ArrowRight } from "./BrandButton";

function Check() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}

export default function PricingCard({ tier, highlighted = false, features = [] }) {
  const C = highlighted ? "xa-card-price-hl" : "xa-card-price";
  return (
    <article className={C} style={{ minHeight: 360 }}>
      {highlighted && <div className="popular">Most Popular</div>}
      <h3>{tier.name}</h3>
      <p className="intro">{tier.intro}</p>
      <div className="price"><strong>{tier.price}</strong><span>{tier.period}</span></div>
      <button type="button" className="pcard-btn">{tier.cta} <ArrowRight /></button>
      <ul>
        {features.map((f) => (
          <li key={f}><Check /> <span>{f}</span></li>
        ))}
      </ul>
    </article>
  );
}