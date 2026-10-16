import React, { useState } from 'react';

export function LineChart({ data = [], labels = [], title = "" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  if (!data.length) return <div className="empty-state">No data available</div>;

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data, 1) * 1.1;
  const minValue = 0;

  const points = data.map((val, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, value: val, label: labels[idx] };
  });

  let pathD = "";
  let areaD = "";
  
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    areaD = `M ${points[0].x} ${paddingTop + chartHeight} L ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
      areaD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    areaD += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
  }

  const yGridValues = [0, 0.33, 0.66, 1].map(pct => {
    const val = Math.round(minValue + pct * (maxValue - minValue));
    const y = paddingTop + chartHeight - pct * chartHeight;
    return { val, y };
  });

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--admin-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--admin-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {yGridValues.map((g, i) => (
          <g key={i}>
            <line 
              x1={paddingLeft} 
              y1={g.y} 
              x2={width - paddingRight} 
              y2={g.y} 
              className="svg-chart-grid"
              stroke="var(--admin-border-color)"
              strokeWidth="0.5"
            />
            <text 
              x={paddingLeft - 10} 
              y={g.y + 4} 
              textAnchor="end" 
              fontSize="10px" 
              fill="var(--text-secondary)"
            >
              {g.val}
            </text>
          </g>
        ))}

        {areaD && (
          <path 
            d={areaD} 
            fill="url(#lineGrad)" 
            className="svg-chart-area" 
          />
        )}

        {pathD && (
          <path 
            d={pathD} 
            stroke="var(--admin-primary)" 
            className="svg-chart-line" 
            fill="none"
            strokeWidth="2.5"
          />
        )}

        {points.map((p, idx) => (
          <g key={idx}>
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="14" 
              fill="transparent" 
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hoveredIdx === idx ? "6" : "4"} 
              fill={hoveredIdx === idx ? "var(--text-primary)" : "var(--bg-secondary)"} 
              stroke="var(--admin-primary)"
              strokeWidth="2"
              pointerEvents="none"
              style={{ transition: 'r 0.15s ease' }}
            />
          </g>
        ))}

        {points.map((p, idx) => (
          (idx % (Math.ceil(points.length / 7)) === 0 || idx === points.length - 1) && (
            <text 
              key={idx}
              x={p.x} 
              y={height - 8} 
              textAnchor="middle" 
              fontSize="10px" 
              fill="var(--text-secondary)"
            >
              {p.label}
            </text>
          )
        ))}

        {hoveredIdx !== null && points[hoveredIdx] && (
          <g className="svg-chart-tooltip" pointerEvents="none">
            <rect 
              x={Math.max(paddingLeft, Math.min(points[hoveredIdx].x - 45, width - paddingRight - 90))} 
              y={Math.max(5, points[hoveredIdx].y - 35)} 
              width="90" 
              height="26" 
              rx="4" 
              fill="var(--bg-tertiary)"
              stroke="var(--admin-primary)"
              strokeWidth="1"
            />
            <text 
              x={Math.max(paddingLeft + 45, Math.min(points[hoveredIdx].x, width - paddingRight - 45))} 
              y={Math.max(5, points[hoveredIdx].y - 35) + 17}
              textAnchor="middle" 
              fontSize="11px" 
              fontWeight="600" 
              fill="var(--text-primary)"
            >
              {points[hoveredIdx].label}: {points[hoveredIdx].value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function BarChart({ data = [], labels = [], title = "" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data.length) return <div className="empty-state">No data available</div>;

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data, 1) * 1.1;
  const minValue = 0;

  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  const yGridValues = [0, 0.33, 0.66, 1].map(pct => {
    const val = Math.round(minValue + pct * (maxValue - minValue));
    const y = paddingTop + chartHeight - pct * chartHeight;
    return { val, y };
  });

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        {yGridValues.map((g, i) => (
          <g key={i}>
            <line 
              x1={paddingLeft} 
              y1={g.y} 
              x2={width - paddingRight} 
              y2={g.y} 
              className="svg-chart-grid"
              stroke="var(--admin-border-color)"
              strokeWidth="0.5"
            />
            <text 
              x={paddingLeft - 10} 
              y={g.y + 4} 
              textAnchor="end" 
              fontSize="10px" 
              fill="var(--text-secondary)"
            >
              {g.val}
            </text>
          </g>
        ))}

        {data.map((val, idx) => {
          const x = paddingLeft + idx * (barWidth + barGap) + barGap / 2;
          const barHeight = ((val - minValue) / (maxValue - minValue)) * chartHeight;
          const y = paddingTop + chartHeight - barHeight;

          return (
            <g key={idx}>
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="3"
                fill={hoveredIdx === idx ? "var(--admin-primary)" : "var(--admin-primary-glow)"}
                stroke="var(--admin-primary)"
                strokeWidth="1"
                style={{ 
                  transition: 'fill 0.2s ease, y 0.3s ease, height 0.3s ease', 
                  cursor: 'pointer' 
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text 
                x={x + barWidth / 2} 
                y={height - 8} 
                textAnchor="middle" 
                fontSize="10px" 
                fill="var(--text-secondary)"
              >
                {labels[idx]}
              </text>
            </g>
          );
        })}

        {hoveredIdx !== null && data[hoveredIdx] !== undefined && (() => {
          const x = paddingLeft + hoveredIdx * (barWidth + barGap) + barGap / 2;
          const barHeight = ((data[hoveredIdx] - minValue) / (maxValue - minValue)) * chartHeight;
          const y = paddingTop + chartHeight - barHeight;
          
          return (
            <g className="svg-chart-tooltip" pointerEvents="none">
              <rect 
                x={Math.max(paddingLeft, Math.min(x + barWidth / 2 - 45, width - paddingRight - 90))} 
                y={Math.max(5, y - 35)} 
                width="90" 
                height="26" 
                rx="4" 
                fill="var(--bg-tertiary)"
                stroke="var(--admin-primary)"
                strokeWidth="1"
              />
              <text 
                x={Math.max(paddingLeft + 45, Math.min(x + barWidth / 2, width - paddingRight - 45))} 
                y={Math.max(5, y - 35) + 17}
                textAnchor="middle" 
                fontSize="11px" 
                fontWeight="600" 
                fill="var(--text-primary)"
              >
                {data[hoveredIdx]}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

export function DonutChart({ data = [], labels = [], colors = [] }) {
  const total = data.reduce((sum, val) => sum + val, 0);

  if (total === 0) return <div className="empty-state">No data available</div>;

  const width = 160;
  const height = 160;
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = width / 2;

  let currentOffset = 0;

  const segments = data.map((val, idx) => {
    const pct = val / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -currentOffset;
    currentOffset += pct * circumference;
    return {
      dashArray,
      dashOffset,
      color: colors[idx] || "var(--admin-primary)",
      label: labels[idx],
      value: val,
      percentage: Math.round(pct * 100)
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="transparent" 
            stroke="var(--bg-tertiary)" 
            strokeWidth={strokeWidth} 
          />
          {segments.map((s, idx) => (
            <circle 
              key={idx}
              cx={center} 
              cy={center} 
              r={radius} 
              fill="transparent" 
              stroke={s.color} 
              strokeWidth={strokeWidth} 
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
              className="svg-donut-segment"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{total}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
        {segments.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({s.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
