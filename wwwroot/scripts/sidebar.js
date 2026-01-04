// Sidebar Toggle Functionality

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleBtn');
  const overlay = document.getElementById('overlay');
  const mainContent = document.getElementById('mainContent');

  // Toggle sidebar function
  function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
    if (toggleBtn) toggleBtn.classList.toggle('shifted');

    // For desktop, toggle closed state
    if (window.innerWidth > 768) {
      if (sidebar) sidebar.classList.toggle('closed');
      if (mainContent) mainContent.classList.toggle('expanded');
    }
  }

  // Close sidebar function
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('shifted');
  }

  // Toggle button click event
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }

  // Overlay click event (close sidebar on mobile)
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      if (overlay) overlay.classList.remove('active');
      if (sidebar) sidebar.classList.remove('open');
      if (toggleBtn) toggleBtn.classList.remove('shifted');
    }
  });

  // ==================== FIXED SUBMENU TOGGLE ====================
  // Submenu toggle functionality - attach directly to menu links
  const menuLinks = document.querySelectorAll('.menu-link.has-submenu');
  
  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const menuItem = this.closest('.menu-item');
      
      // Close other submenus
      document.querySelectorAll('.menu-item.submenu-open').forEach(item => {
        if (item !== menuItem) {
          item.classList.remove('submenu-open');
        }
      });
      
      // Toggle current submenu
      menuItem.classList.toggle('submenu-open');
    });
  });
  // ==================== END FIXED SUBMENU TOGGLE ====================

  // Close sidebar when clicking submenu link on mobile
  const submenuLinks = document.querySelectorAll('.submenu-link');
  submenuLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });
});

// ==================== MENU CREATION FUNCTIONS ====================

/**
 * Create a menu item element
 * This function is called by auth.js to create menu items
 */
function createMenuItem(item) {
  const li = document.createElement('li');
  li.className = 'menu-item';

  if (item.submenu && item.submenu.length > 0) {
    // Menu with submenu - build DOM nodes instead of innerHTML
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'menu-link has-submenu';
    a.style.color = '#ecf0f1';
    a.style.textDecoration = 'none';

    const iconEl = document.createElement('i');
    iconEl.className = item.icon;
    iconEl.style.color = '#ecf0f1';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;

    const chevron = document.createElement('i');
    chevron.className = 'fas fa-chevron-down submenu-arrow';

    a.appendChild(iconEl);
    a.appendChild(nameSpan);
    a.appendChild(chevron);
    li.appendChild(a);

    const ul = document.createElement('ul');
    ul.className = 'submenu';
    item.submenu.forEach(sub => {
      const subLi = document.createElement('li');
      const subA = document.createElement('a');
      subA.href = sub.link || '#';
      subA.className = 'submenu-link';
      subA.style.color = '#bdc3c7';
      subA.style.textDecoration = 'none';
      const subSpan = document.createElement('span');
      subSpan.textContent = sub.name;
      subA.appendChild(subSpan);
      subLi.appendChild(subA);
      ul.appendChild(subLi);
    });
    li.appendChild(ul);

    // Add submenu toggle functionality on the created anchor
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const menuItem = li;

      // Close other submenus
      document.querySelectorAll('.menu-item.submenu-open').forEach(item => {
        if (item !== menuItem) {
          item.classList.remove('submenu-open');
        }
      });

      // Toggle current submenu
      menuItem.classList.toggle('submenu-open');
    });

  } else {
    // Regular menu item
    const a = document.createElement('a');
    a.href = item.link || '#';
    a.className = 'menu-link';
    a.style.color = '#ecf0f1';
    a.style.textDecoration = 'none';

    const iconEl = document.createElement('i');
    iconEl.className = item.icon;
    iconEl.style.color = '#ecf0f1';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;

    a.appendChild(iconEl);
    a.appendChild(nameSpan);
    li.appendChild(a);
  }

  return li;
}

/**
 * Render menu items to sidebar
 * This function can be called to render an array of menu items
 */
function renderMenuItems(menuItems) {
  const sidebarMenu = document.getElementById('sidebarMenu');
  
  if (!sidebarMenu) {
    console.error('❌ Sidebar menu element not found');
    return;
  }

  // Clear existing menu without using innerHTML
  while (sidebarMenu.firstChild) sidebarMenu.removeChild(sidebarMenu.firstChild);

  // Create and append each menu item
  menuItems.forEach(item => {
    const menuItem = createMenuItem(item);
    sidebarMenu.appendChild(menuItem);
  });

  console.log(`✅ Rendered ${menuItems.length} menu items`);
}

// Make functions available globally
window.createMenuItem = createMenuItem;
window.renderMenuItems = renderMenuItems;