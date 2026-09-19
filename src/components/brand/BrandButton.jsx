import React from "react";
import { Link } from "react-router-dom";

export function ArrowRight({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function PrimaryButton({ children, onClick, type = "button", className = "" }) {
  return <button type={type} onClick={onClick} className={`xa-btn-primary ${className}`}>{children}</button>;
}

export function OutlineButton({ children, onClick, type = "button", className = "" }) {
  return <button type={type} onClick={onClick} className={`xa-btn-outline ${className}`}>{children}</button>;
}

export function WideLink({ to, children, className = "" }) {
  return <Link to={to} className={`xa-btn-wide ${className}`}>{children}</Link>;
}

export function OutlineLink({ to, children, className = "" }) {
  return <Link to={to} className={`xa-btn-outline ${className}`}>{children}</Link>;
}

export function TextLink({ to, children, className = "" }) {
  return <Link to={to} className={`xa-btn-text ${className}`}>{children}</Link>;
}

export function PillBadge({ children }) {
  return <span className="xa-pill-badge">{children}</span>;
}