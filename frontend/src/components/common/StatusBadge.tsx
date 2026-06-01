export function StatusBadge({status}:{status?: string}) { return <span className={`badge badge-${status || 'neutral'}`}>{status || 'unknown'}</span>; }
