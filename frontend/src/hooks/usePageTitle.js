import { useEffect } from 'react';

/**
 * Custom hook to set the page title
 * @param {string} title - The title to set (will be appended to "Hiking Logbook")
 * @param {boolean} appendDefault - Whether to append "Hiking Logbook" to the title (default: true)
 */
export const usePageTitle = (title, appendDefault = true) => {
  useEffect(() => {
    if (appendDefault) {
      document.title = title ? `${title} | Hiking Logbook` : 'Hiking Logbook';
    } else {
      document.title = title || 'Hiking Logbook';
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Hiking Logbook';
    };
  }, [title, appendDefault]);
};
