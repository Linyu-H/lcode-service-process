import { Inbox } from 'lucide-react';
export function EmptyState({title, action}:{title:string; action?: React.ReactNode}) { return <div className="empty"><Inbox size={32}/><p>{title}</p>{action}</div>; }
