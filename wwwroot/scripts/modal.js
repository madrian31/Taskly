
const modal = {
  overlay: null,
  titleEl: null,
  bodyEl: null,
  footerEl: null,
  confirmBtn: null,
  cancelBtn: null,
  closeBtn: null,

  init() {
    this.overlay = document.getElementById('modalContainer');
    this.titleEl = document.getElementById('modalTitle');
    this.bodyEl = document.getElementById('modalBody');
    this.footerEl = document.getElementById('modalFooter');
    this.confirmBtn = document.getElementById('modalConfirmBtn');
    this.cancelBtn = document.getElementById('modalCancelBtn');
    this.closeBtn = document.getElementById('modalClose');

    if (!this.overlay) {
      console.warn('Modal container not found.');
      return;
    }

    this.closeBtn?.addEventListener('click', () => this.close());
    this.cancelBtn?.addEventListener('click', () => this.close());
    
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.close();
      }
    });
  },

  open(options = {}) {
    if (!this.overlay) {
      console.error('Modal not initialized');
      return;
    }

    // Only update title if caller provided a non-empty string. This preserves the
    // existing DOM text (e.g. "Events") when `open()` is called without title
    // or with an intentionally empty title (`title: ''`).
    if (options.title !== undefined && options.title !== '') {
      this.titleEl.textContent = options.title;
    }
    // support body as string or DOM Node
    if (options.body instanceof Node) {
      // clear existing
      while (this.bodyEl.firstChild) this.bodyEl.removeChild(this.bodyEl.firstChild);
      this.bodyEl.appendChild(options.body);
    } else {
      this.bodyEl.innerHTML = options.body || '';
    }
    this.confirmBtn.textContent = options.confirmText || 'Confirm';
    this.cancelBtn.textContent = options.cancelText || 'Cancel';

    // Ensure buttons use the app `.btn` styles by default
    try {
      this.confirmBtn.className = options.confirmClass || 'btn btn-primary';
      this.cancelBtn.className = options.cancelClass || 'btn btn-secondary';
    } catch (err) {
      // ignore if elements not found
    }

    // Handle footer visibility
    if (options.hideFooter) {
      this.footerEl.style.display = 'none';
    } else {
      this.footerEl.style.display = 'flex';
    }

    // Handle cancel button visibility
    if (options.showCancel === false) {
      this.cancelBtn.style.display = 'none';
    } else {
      this.cancelBtn.style.display = 'inline-block';
    }

    this.confirmBtn.onclick = () => {
      if (options.onConfirm) options.onConfirm();
      this.close();
    };

    this.cancelBtn.onclick = () => {
      if (options.onCancel) options.onCancel();
      this.close();
    };

    // Ensure overlay is visible and page scrolling disabled
    this.overlay.style.display = 'flex';
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.overlay) return;
    // Hide overlay and restore page scroll
    this.overlay.classList.remove('active');
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
    // Notify listeners that modal closed. Include a flag that other code can set
    try {
      const detail = { shouldReload: !!window.shouldReloadAfterModalClose };
      document.dispatchEvent(new CustomEvent('modalClosed', { detail }));
      // reset the flag after dispatch
      window.shouldReloadAfterModalClose = false;
    } catch (err) {
      console.warn('modal: failed to dispatch modalClosed event', err);
    }
  },

  alert(title, message) {
    this.open({
      title: title,
      body: `<p>${message}</p>`,
      hideFooter: true
    });
    
    setTimeout(() => {
      const closeOnClick = () => {
        this.close();
        this.overlay.removeEventListener('click', closeOnClick);
      };
      this.overlay.addEventListener('click', closeOnClick);
    }, 100);
  },

  confirm(title, message, onConfirm) {
    this.open({
      title: title,
      body: `<p>${message}</p>`,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: onConfirm
    });
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => modal.init());
} else {
  modal.init();
}

// Make it global
window.modal = modal;