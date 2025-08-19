// Simple script to clear gallery data for testing
console.log('Clearing gallery data...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('curio_gallery_items');
  localStorage.removeItem('curio_conversations');
  console.log('Gallery data cleared from localStorage');
} else {
  console.log('localStorage not available (run this in browser console)');
}

// For browser console use:
// localStorage.removeItem('curio_gallery_items');
// localStorage.removeItem('curio_conversations');
// console.log('Gallery data cleared');
