'use client';

import type { AuthView } from './auth.types';

export interface LamplightProps {
  isOn: boolean;
  isPulling: boolean;
  onPull: () => void;
  pullLabel: string;
  view: AuthView;
  panelId: string;
}

export function Lamplight({ isOn, isPulling, onPull, pullLabel, view, panelId }: LamplightProps) {
  const instructionText =
    view === 'closed'
      ? 'Pull to open secure access'
      : view === 'signin'
        ? 'Pull again to create an account'
        : 'Pull again to return to sign in';

  return (
    <div className="lamplight__fixture">
      <div className="lamplight__mount" aria-hidden="true" />
      <div className="lamplight__shade" aria-hidden="true">
        <div className={`lamplight__bulb ${isOn ? 'lamplight__bulb--on' : ''}`} />
      </div>
      <div className={`lamplight__beam ${isOn ? 'lamplight__beam--on' : ''}`} aria-hidden="true" />
      <div className="lamplight__cord-container">
        <div
          className={`lamplight__cord ${isPulling ? 'lamplight__cord--pulling' : ''}`}
          aria-hidden="true"
        />
        <div className="lamplight__chain" aria-hidden="true" />
        <button
          type="button"
          className={`lamplight__handle ${isPulling ? 'lamplight__handle--pulling' : ''}`}
          onClick={onPull}
          aria-label={pullLabel}
          aria-controls={panelId}
          aria-expanded={isOn}
          disabled={isPulling}
        >
          <span className="lamplight__handle-knob" />
        </button>
        <span className="lamplight__pull-instruction" aria-hidden="true">
          <svg
            className="lamplight__pull-arrow"
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            aria-hidden="true"
          >
            <path d="M5 8L0.67 0.5h8.66L5 8z" fill="currentColor" />
          </svg>
          {instructionText}
        </span>
      </div>
    </div>
  );
}
