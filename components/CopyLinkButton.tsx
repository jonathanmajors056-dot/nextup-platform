"use client";

export function CopyLinkButton() {
  return <button className="button button-secondary" type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</button>;
}
