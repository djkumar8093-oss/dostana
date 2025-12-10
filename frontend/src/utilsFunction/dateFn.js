import { formatDistanceToNow, format, isValid } from "date-fns";

// Function to format the date
const formatDate = (createdAt) => {
  if (!createdAt) return ""; // Return an empty string if no date is provided

  const dateObj = new Date(createdAt);

  // Check if the createdAt value is a valid date
  if (!isValid(dateObj)) {
    console.warn("Invalid date provided:", createdAt); // Log a warning for debugging
    return ""; // Return an empty string for invalid dates
  }

  // Get the relative time (e.g., "2 minutes ago")
  const distance = formatDistanceToNow(dateObj, { addSuffix: true }).replace("about ", "");

  // Get the difference in milliseconds between the current date and the given date
  const timeDiffMs = Date.now() - dateObj.getTime();

  // Calculate the difference in days
  const daysAgo = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));

  // If the time difference is greater than 7 days, return the exact date in "dd MMM yyyy" format
  if (daysAgo > 7) {
    return `${format(dateObj, "dd MMM yyyy")}`; // Append "on" for specific dates
  }

  return distance; // Return the relative time (e.g., "2 minutes ago")
};

export { formatDate };
