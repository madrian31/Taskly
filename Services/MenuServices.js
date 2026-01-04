const menuConfig = [
  {
    sortOrder: 1,
    name: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    link: '../Dashboard/dashboard.html',
    roles: ['everyone'] // Everyone
  },
  {
    sortOrder: 6,
    name: 'Users',
    icon: 'fas fa-users',
    link: '../Users/users.html',
    roles: ['administrator'] // Admin only
  },
  {
    sortOrder: 11,
    name: 'Events',
    icon: 'fas fa-calendar-alt',
    link: '../Events/events.html',
    roles: ['everyone'] // Everyone
  },
  {
    sortOrder: 12,
    name: 'Tasks',
    icon: 'fas fa-tasks',
    link: '../Tasks/tasks.html',
    roles: ['everyone'] // Everyone
  },
  {
    sortOrder: 16,
    name: 'Link 1',
    icon: 'fas fa-link',
    submenu: [
      { name: 'Sub Link 1', link: '' },
      { name: 'Sub Link 2', link: '' },
      { name: 'Sub Link 3', link: '' }
    ],
    roles: ['administrator', 'staff'] // Admin & Staff
  },
  {
    sortOrder: 22,
    name: 'Settings',
    icon: 'fas fa-cog',
    link: '../Settings/settings.html',
    roles: ['everyone'] // Everyone
  }
];

// Helper function to check if user has access
function hasMenuAccess(menuItem, userRole) {
  // No roles defined = everyone can access
  if (!menuItem.roles || menuItem.roles.length === 0) {
    return true;
  }
  
  // Check if 'everyone' keyword is used
  if (menuItem.roles.includes('everyone')) {
    return true;
  }
  
  // Check if user's role is in the allowed roles
  return menuItem.roles.includes(userRole);
}

// Make available globally for UIService to access
window.menuConfig = menuConfig;
window.hasMenuAccess = hasMenuAccess;