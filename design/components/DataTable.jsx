import React from 'react';

/**
 * Simple DataTable starter
 * Props: columns: [{key,label}], rows: [{key: value}]
 */
export default function DataTable({ columns = [], rows = [], className = '' }) {
  return (
    <div className={`data-table ${className}`} role="table">
      <div role="row" className="table-header">
        {columns.map((c) => (
          <div key={c.key} style={{ fontWeight: 800, textTransform: 'uppercase' }}>{c.label}</div>
        ))}
      </div>

      {rows.map((r, idx) => (
        <div key={idx} role="row">
          {columns.map((c) => (
            <div key={c.key}>{r[c.key]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
