import { ButtonHTMLAttributes } from 'react';
export function Button({ className='', variant='primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary'|'secondary'|'danger'|'ghost'}) { return <button className={`btn btn-${variant} ${className}`} {...props} />; }
