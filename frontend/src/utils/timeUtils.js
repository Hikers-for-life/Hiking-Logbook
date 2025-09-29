// Utility functions for time formatting

/**
 * Format a timestamp to show relative time (e.g., "2 minutes ago", "1 hour ago")
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted relative time string
 */
export function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown time';

    const now = new Date();
    const time = new Date(timestamp);

    if (isNaN(time.getTime())) return 'Invalid time';

    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
}

/**
 * Format a timestamp to show absolute time (e.g., "Dec 15, 2023 at 2:30 PM")
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted absolute time string
 */
export function formatAbsoluteTime(timestamp) {
    if (!timestamp) return 'Unknown time';

    const time = new Date(timestamp);

    if (isNaN(time.getTime())) return 'Invalid time';

    return time.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Format a timestamp to show just the time (e.g., "2:30 PM")
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp) {
    if (!timestamp) return 'Unknown time';

    const time = new Date(timestamp);

    if (isNaN(time.getTime())) return 'Invalid time';

    return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

