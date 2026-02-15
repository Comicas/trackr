import { MediaStatus } from '@/lib/types';

interface StatusDotProps {
    status: MediaStatus;
    className?: string;
}

export function StatusDot({ status, className = '' }: StatusDotProps) {
    const colorClass = getStatusColor(status);

    return (
        <div
            className={`absolute top-1.5 left-1.5 z-20 h-3 w-3 rounded-full ring-2 ring-background shadow-[0_0_8px_rgba(0,0,0,0.25)] ${colorClass} ${className}`}
            title={status}
        />
    );
}

function getStatusColor(status: MediaStatus): string {
    switch (status) {
        case 'completed':
            return 'bg-blue-500'; // Explicit blue
        case 'watching':
        case 'playing':
            return 'bg-green-500'; // Explicit green
        case 'plan':
        case 'backlog':
            return 'bg-gray-400'; // Explicit gray
        case 'dropped':
            return 'bg-red-500'; // Explicit red
        default:
            return 'bg-gray-400';
    }
}
