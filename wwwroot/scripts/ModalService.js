/**
 * Modal Service
 * Centralized modal management for all dialogs and confirmations
 */

import { MODAL_TITLES } from './constants.js';

class ModalService {
  /**
   * Show success modal
   */
  showSuccess(message, title = MODAL_TITLES.SUCCESS) {
    if (typeof modal !== 'undefined' && modal.open) {
      // build DOM content instead of string
      const container = document.createElement('div');
      container.style.textAlign = 'center';
      container.style.padding = '20px 0';
      const icon = document.createElement('i');
      icon.className = 'fas fa-check-circle';
      icon.style.fontSize = '48px';
      icon.style.color = '#28a745';
      icon.style.marginBottom = '15px';
      const p = document.createElement('p');
      p.style.fontSize = '16px';
      p.style.color = '#333';
      p.textContent = message;
      container.appendChild(icon);
      container.appendChild(p);
      modal.open({
        title: title,
        body: container,
        confirmText: 'OK', // Always use OK for success modal
        showCancel: false
      });
    } else {
      alert(`✅ ${message}`);
    }
  }

  /**
   * Show error modal
   */
  showError(message, title = MODAL_TITLES.ERROR) {
    if (typeof modal !== 'undefined' && modal.open) {
      const container = document.createElement('div');
      container.style.textAlign = 'center';
      container.style.padding = '20px 0';
      const icon = document.createElement('i');
      icon.className = 'fas fa-exclamation-circle';
      icon.style.fontSize = '48px';
      icon.style.color = '#dc3545';
      icon.style.marginBottom = '15px';
      const p = document.createElement('p');
      p.style.fontSize = '16px';
      p.style.color = '#333';
      p.textContent = message;
      container.appendChild(icon);
      container.appendChild(p);
      modal.open({
        title: title,
        body: container,
        confirmText: 'OK',
        showCancel: false
      });
    } else {
      alert(`❌ ${message}`);
    }
  }

  /**
   * Show info modal
   */
  showInfo(message, title = MODAL_TITLES.INFO) {
    if (typeof modal !== 'undefined' && modal.open) {
      const container = document.createElement('div');
      container.style.textAlign = 'center';
      container.style.padding = '20px 0';
      const icon = document.createElement('i');
      icon.className = 'fas fa-info-circle';
      icon.style.fontSize = '48px';
      icon.style.color = '#17a2b8';
      icon.style.marginBottom = '15px';
      const p = document.createElement('p');
      p.style.fontSize = '16px';
      p.style.color = '#333';
      p.textContent = message;
      container.appendChild(icon);
      container.appendChild(p);
      modal.open({
        title: title,
        body: container,
        confirmText: 'OK',
        showCancel: false
      });
    } else {
      alert(`ℹ️ ${message}`);
    }
  }

  /**
   * Show confirmation modal
   */
  confirm(title, message, onConfirm, onCancel = null) {
    if (typeof modal !== 'undefined' && modal.confirm) {
      modal.confirm(title, message, onConfirm, onCancel);
    } else {
      if (confirm(message)) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
    }
  }

  /**
   * Show custom modal with custom content
   */
  open(config) {
    if (typeof modal !== 'undefined' && modal.open) {
      modal.open(config);
    }
  }
}

export default new ModalService();
