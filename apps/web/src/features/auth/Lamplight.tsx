'use client';

export interface LamplightProps {
  isOn: boolean;
  isPulling: boolean;
  onPull: () => void;
  pullLabel: string;
}

export function Lamplight({ isOn, isPulling, onPull, pullLabel }: LamplightProps) {
  return (
    <div className="lamplight__fixture" aria-hidden="true">
      <div className="lamplight__mount" />
      <div className="lamplight__shade">
        <div className={`lamplight__bulb ${isOn ? 'lamplight__bulb--on' : ''}`} />
      </div>
      <div className={`lamplight__beam ${isOn ? 'lamplight__beam--on' : ''}`} />
      <div className="lamplight__cord-container">
        <div className={`lamplight__cord ${isPulling ? 'lamplight__cord--pulling' : ''}`} />
        <button
          type="button"
          className={`lamplight__handle ${isPulling ? 'lamplight__handle--pulling' : ''}`}
          onClick={onPull}
          aria-label={pullLabel}
        >
          <span className="lamplight__handle-knob" />
        </button>
      </div>
    </div>
  );
}
