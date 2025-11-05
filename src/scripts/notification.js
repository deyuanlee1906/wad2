// Global notification system for order notifications
(function() {
  'use strict';

  let currentView = 'list'; // 'list' or 'detail'
  let currentOrderId = null;

  // Inject notification popup HTML and styles
  function injectNotificationPopup() {
    // Check if already injected
    if (document.getElementById('orderNotificationPopup')) return;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      /* Notification Popup Styles */
      .order-notification-popup {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        padding: 24px;
        max-width: 420px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 1050;
        animation: slideInRight 0.3s ease-out;
        border: 1px solid #e9ecef;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .order-notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e9ecef;
        position: sticky;
        top: 0;
        background: #ffffff;
        z-index: 10;
      }

      .order-notification-header h5 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1a1a1a;
      }

      .order-notification-back-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: #6c757d;
        cursor: pointer;
        padding: 4px 8px;
        margin-right: 8px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .order-notification-back-btn:hover {
        background: #f8f9fa;
        color: #1a1a1a;
      }

      .order-notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6c757d;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
      }

      .order-notification-close:hover {
        background: #f8f9fa;
        color: #1a1a1a;
      }

      /* List View Styles */
      .order-notification-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 500px;
        overflow-y: auto;
      }

      .order-notification-item {
        padding: 12px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: #ffffff;
      }

      .order-notification-item:hover {
        background: #f8f9fa;
        border-color: #D98566;
        transform: translateX(-2px);
      }

      .order-notification-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .order-notification-item-id {
        font-weight: 600;
        color: #1a1a1a;
        font-size: 0.95rem;
      }

      .order-notification-item-total {
        font-weight: 700;
        color: #D98566;
        font-size: 1rem;
      }

      .order-notification-item-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.85rem;
        color: #6c757d;
      }

      .order-notification-item-stall {
        font-weight: 500;
        color: #1a1a1a;
      }

      .order-notification-item-time {
        font-size: 0.8rem;
        color: #6c757d;
      }

      /* Detail/QR View Styles */
      .order-qr-code-container {
        text-align: center;
        margin-bottom: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .order-qr-code {
        width: 200px;
        height: 200px;
        margin: 0 auto 12px;
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .order-qr-code:hover {
        transform: scale(1.05);
      }

      .order-qr-code canvas {
        max-width: 100%;
        max-height: 100%;
      }

      /* Fullscreen QR Code Styles */
      .qr-fullscreen-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        z-index: 1060;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      }

      .qr-fullscreen-container {
        position: relative;
        text-align: center;
        max-width: 90vw;
        max-height: 90vh;
      }

      .qr-fullscreen-close {
        position: absolute;
        top: -50px;
        right: 0;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.5);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .qr-fullscreen-close:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.8);
        transform: scale(1.1);
      }

      .qr-fullscreen-code {
        background: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        display: inline-block;
      }

      .qr-fullscreen-code canvas {
        max-width: 80vw;
        max-height: 80vh;
        width: auto;
        height: auto;
      }

      .qr-fullscreen-instructions {
        color: white;
        margin-top: 24px;
        font-size: 1.1rem;
        font-weight: 500;
      }

      .order-qr-instructions {
        font-size: 0.85rem;
        color: #6c757d;
        margin-top: 12px;
      }

      .order-notification-details {
        margin-top: 20px;
      }

      .order-notification-detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e9ecef;
        font-size: 0.9rem;
      }

      .order-notification-detail-item:last-child {
        border-bottom: none;
      }

      .order-notification-detail-label {
        color: #6c757d;
        font-weight: 500;
      }

      .order-notification-detail-value {
        color: #1a1a1a;
        font-weight: 600;
        text-align: right;
      }

      .order-notification-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 1040;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .order-notification-popup {
          top: auto;
          bottom: 80px;
          right: 12px;
          left: 12px;
          max-width: 100%;
        }

        .qr-fullscreen-code canvas {
          max-width: 90vw;
          max-height: 60vh;
        }

        .qr-fullscreen-close {
          top: -40px;
          width: 36px;
          height: 36px;
          font-size: 1.3rem;
        }

        .qr-fullscreen-instructions {
          font-size: 1rem;
          margin-top: 16px;
        }
      }
    `;
    document.head.appendChild(style);

    // Add HTML
    const backdrop = document.createElement('div');
    backdrop.id = 'orderNotificationBackdrop';
    backdrop.className = 'order-notification-backdrop';
    backdrop.style.display = 'none';
    backdrop.onclick = closeOrderNotification;

    const popup = document.createElement('div');
    popup.id = 'orderNotificationPopup';
    popup.className = 'order-notification-popup';
    popup.style.display = 'none';
    popup.innerHTML = `
      <div class="order-notification-header">
        <div style="display: flex; align-items: center;">
          <button class="order-notification-back-btn" id="orderNotificationBackBtn" style="display: none;" onclick="showNotificationList()">
            <i class="bi bi-arrow-left"></i>
          </button>
          <h5 id="orderNotificationTitle">Orders Ready for Pickup</h5>
        </div>
        <button class="order-notification-close" onclick="closeOrderNotification()">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div id="orderNotificationList" style="display: block;">
        <!-- Order list will be populated here -->
      </div>
      <div id="orderNotificationDetail" style="display: none;">
        <div class="order-qr-code-container">
          <div class="order-qr-code" id="orderQRCode"></div>
          <p class="order-qr-instructions">Scan QR code at the counter to collect your order</p>
        </div>
        <div class="order-notification-details" id="orderNotificationDetails">
          <!-- Order details will be populated here -->
        </div>
      </div>
    `;

    // Add fullscreen QR overlay
    const fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.id = 'qrFullscreenOverlay';
    fullscreenOverlay.className = 'qr-fullscreen-overlay';
    fullscreenOverlay.style.display = 'none';
    fullscreenOverlay.onclick = closeFullscreenQR;
    fullscreenOverlay.innerHTML = `
      <div class="qr-fullscreen-container" onclick="event.stopPropagation()">
        <button class="qr-fullscreen-close" onclick="closeFullscreenQR(event)" style="z-index: 10;">
          <i class="bi bi-x"></i>
        </button>
        <div class="qr-fullscreen-code" id="qrFullscreenCode"></div>
        <p class="qr-fullscreen-instructions">Scan QR code at the counter to collect your order</p>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
    document.body.appendChild(fullscreenOverlay);
  }

  // Generate fake QR code
  function generateQRCode(orderId, containerId = 'orderQRCode', size = 200) {
    const qrContainer = document.getElementById(containerId);
    if (!qrContainer) return null;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const gridSize = 25;
    const cellSize = size / gridSize;

    let seed = 0;
    for (let i = 0; i < orderId.length; i++) {
      seed += orderId.charCodeAt(i);
    }

    function hash(index) {
      return (seed * (index + 1) * 7919) % 1000;
    }

    ctx.fillStyle = '#000000';
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const isCorner = (
          (row < 8 && col < 8) ||
          (row < 8 && col >= gridSize - 8) ||
          (row >= gridSize - 8 && col < 8)
        );
        
        if (isCorner) {
          const isOuter = row < 2 || row >= gridSize - 2 || col < 2 || col >= gridSize - 2;
          const isInner = row >= 3 && row < 5 && col >= 3 && col < 5;
          if (isOuter || isInner) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        } else {
          if (hash(index) % 2 === 0) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    qrContainer.innerHTML = '';
    qrContainer.appendChild(canvas);
    
    return canvas;
  }

  // Show fullscreen QR code
  window.showFullscreenQR = function(orderId) {
    const overlay = document.getElementById('qrFullscreenOverlay');
    const fullscreenContainer = document.getElementById('qrFullscreenCode');
    
    if (!overlay || !fullscreenContainer) return;
    
    // Generate larger QR code for fullscreen (600px for better quality)
    const canvas = generateQRCode(orderId, 'qrFullscreenCode', 600);
    
    if (canvas) {
      overlay.style.display = 'flex';
      // Prevent body scroll when fullscreen is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key listener to close fullscreen
      const escHandler = function(e) {
        if (e.key === 'Escape') {
          closeFullscreenQR();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    }
  };

  // Close fullscreen QR code
  window.closeFullscreenQR = function(event) {
    // If event is provided and it's from clicking inside the container, don't close
    if (event) {
      const container = event.target.closest('.qr-fullscreen-container');
      // Only close if clicking the close button or outside the container
      if (container && !event.target.closest('.qr-fullscreen-close')) {
        return;
      }
    }
    
    const overlay = document.getElementById('qrFullscreenOverlay');
    if (overlay) {
      overlay.style.display = 'none';
      // Restore body scroll
      document.body.style.overflow = '';
    }
  };

  // Get all order notifications
  function getOrderNotifications() {
    const notificationDataStr = localStorage.getItem('orderNotifications');
    if (!notificationDataStr) return [];
    
    try {
      const notifications = JSON.parse(notificationDataStr);
      const now = Date.now();
      
      // Track when notifications first appear and update appearedAt
      const updatedNotifications = notifications.map(notif => {
        // Check if notification should be visible based on notificationTime
        if (notif.notificationTime) {
          try {
            const notificationTime = new Date(notif.notificationTime).getTime();
            // If it's time to show and we haven't tracked appearedAt yet
            if (now >= notificationTime && !notif.appearedAt) {
              // Mark when it first appeared
              notif.appearedAt = new Date().toISOString();
            }
          } catch (e) {
            console.error('Error parsing notificationTime:', e);
          }
        }
        return notif;
      });
      
      // Save updates if any notifications were marked as appeared
      const hasUpdates = updatedNotifications.some((notif, idx) => 
        notif.appearedAt !== notifications[idx]?.appearedAt
      );
      if (hasUpdates) {
        saveOrderNotifications(updatedNotifications);
      }
      
      // Filter notifications based on timing and dismissal status
      return updatedNotifications.filter(notif => {
        // Check if notification should be visible based on notificationTime
        if (notif.notificationTime) {
          try {
            const notificationTime = new Date(notif.notificationTime).getTime();
            // Only show if current time >= notificationTime (it's time to show the notification)
            if (now < notificationTime) {
              return false; // Not yet time to show this notification
            }
          } catch (e) {
            console.error('Error parsing notificationTime:', e);
            // If parsing fails, show the notification (fail-safe)
          }
        }
        
        // Filter out notifications that appeared more than 1 minute ago
        if (notif.appearedAt) {
          const appearedTime = new Date(notif.appearedAt).getTime();
          const timeSinceAppeared = now - appearedTime;
          if (timeSinceAppeared >= 60000) { // 1 minute = 60000ms
            return false; // Dismiss after 1 minute
          }
        }
        
        return true;
      });
    } catch (e) {
      console.error('Error parsing notifications:', e);
      return [];
    }
  }

  // Save order notifications
  function saveOrderNotifications(notifications) {
    localStorage.setItem('orderNotifications', JSON.stringify(notifications));
  }

  // Mark notification as viewed
  function markNotificationAsViewed(orderId) {
    const allNotificationsStr = localStorage.getItem('orderNotifications');
    if (!allNotificationsStr) return;
    
    try {
      const allNotifications = JSON.parse(allNotificationsStr);
      const notification = allNotifications.find(n => n.orderId === orderId);
      
      if (notification && !notification.viewedAt) {
        notification.viewedAt = new Date().toISOString();
        saveOrderNotifications(allNotifications);
      }
    } catch (e) {
      console.error('Error marking notification as viewed:', e);
    }
  }

  // Dismiss/remove a notification
  function dismissNotification(orderId) {
    const allNotificationsStr = localStorage.getItem('orderNotifications');
    if (!allNotificationsStr) return;
    
    try {
      const allNotifications = JSON.parse(allNotificationsStr);
      const filtered = allNotifications.filter(n => n.orderId !== orderId);
      saveOrderNotifications(filtered);
      
      // Update UI
      updateNotificationBadge();
      if (currentView === 'list') {
        showNotificationList();
      } else if (currentOrderId === orderId) {
        // If viewing the dismissed order, go back to list
        showNotificationList();
      }
    } catch (e) {
      console.error('Error dismissing notification:', e);
    }
  }

  // Show notification list view
  window.showNotificationList = function() {
    currentView = 'list';
    currentOrderId = null;
    
    const listContainer = document.getElementById('orderNotificationList');
    const detailContainer = document.getElementById('orderNotificationDetail');
    const backBtn = document.getElementById('orderNotificationBackBtn');
    const title = document.getElementById('orderNotificationTitle');
    
    if (listContainer) listContainer.style.display = 'block';
    if (detailContainer) detailContainer.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    if (title) title.textContent = 'Orders Ready';
    
    renderNotificationList();
  };

  // Render notification list
  function renderNotificationList() {
    const listContainer = document.getElementById('orderNotificationList');
    if (!listContainer) return;
    
    const notifications = getOrderNotifications();
    
    if (notifications.length === 0) {
      listContainer.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No orders available</p>';
      return;
    }
    
    let html = '<div class="order-notification-list">';
    
    notifications.forEach(notification => {
      const total = typeof notification.total === 'number' 
        ? notification.total 
        : parseFloat(notification.total) || 0;
      
      html += `
        <div class="order-notification-item" onclick="showNotificationDetail('${notification.orderId}')">
          <div class="order-notification-item-header">
            <span class="order-notification-item-id">${notification.orderId}</span>
            <span class="order-notification-item-total">$${total.toFixed(2)}</span>
          </div>
          <div class="order-notification-item-details">
            <span class="order-notification-item-stall">${notification.stall || '-'}</span>
            <span class="order-notification-item-time">${notification.foodCentre || '-'}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    listContainer.innerHTML = html;
  }

  // Show notification detail/QR view
  window.showNotificationDetail = function(orderId) {
    const notifications = getOrderNotifications();
    const notification = notifications.find(n => n.orderId === orderId);
    
    if (!notification) {
      alert('Order not found');
      return;
    }
    
    // Mark as viewed
    markNotificationAsViewed(orderId);
    
    currentView = 'detail';
    currentOrderId = orderId;
    
    const listContainer = document.getElementById('orderNotificationList');
    const detailContainer = document.getElementById('orderNotificationDetail');
    const backBtn = document.getElementById('orderNotificationBackBtn');
    const title = document.getElementById('orderNotificationTitle');
    
    if (listContainer) listContainer.style.display = 'none';
    if (detailContainer) detailContainer.style.display = 'block';
    if (backBtn) backBtn.style.display = 'block';
    if (title) title.textContent = 'Order Details';
    
    // Generate QR code
    const canvas = generateQRCode(orderId);
    
    // Add click event to QR code to show fullscreen
    const qrContainer = document.getElementById('orderQRCode');
    if (qrContainer && canvas) {
      qrContainer.onclick = function() {
        showFullscreenQR(orderId);
      };
      qrContainer.style.cursor = 'pointer';
    }
    
    // Populate order details
    const detailsContainer = document.getElementById('orderNotificationDetails');
    if (detailsContainer) {
      const total = typeof notification.total === 'number' 
        ? notification.total 
        : parseFloat(notification.total) || 0;
      
      detailsContainer.innerHTML = `
        <div class="order-notification-detail-item">
          <span class="order-notification-detail-label">Order ID</span>
          <span class="order-notification-detail-value">${notification.orderId}</span>
        </div>
        <div class="order-notification-detail-item">
          <span class="order-notification-detail-label">Stall</span>
          <span class="order-notification-detail-value">${notification.stall || '-'}</span>
        </div>
        <div class="order-notification-detail-item">
          <span class="order-notification-detail-label">Food Centre</span>
          <span class="order-notification-detail-value">${notification.foodCentre || '-'}</span>
        </div>
        <div class="order-notification-detail-item">
          <span class="order-notification-detail-label">Total</span>
          <span class="order-notification-detail-value">$${total.toFixed(2)}</span>
        </div>
      `;
    }
  };

  // Show order notification popup (list view)
  function showOrderNotification() {
    currentView = 'list';
    showNotificationList();

    // Show popup and backdrop
    const popup = document.getElementById('orderNotificationPopup');
    const backdrop = document.getElementById('orderNotificationBackdrop');
    
    if (popup) popup.style.display = 'block';
    if (backdrop) backdrop.style.display = 'block';
  }

  // Close notification popup
  function closeOrderNotification() {
    const popup = document.getElementById('orderNotificationPopup');
    const backdrop = document.getElementById('orderNotificationBackdrop');
    
    if (popup) popup.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  // Update notification badge
  function updateNotificationBadge() {
    const notifications = getOrderNotifications();
    const count = notifications.length;
    const badges = document.querySelectorAll('.notification-badge');
    
    badges.forEach(badge => {
      if (count > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = count > 99 ? '99+' : count.toString();
      } else {
        badge.style.display = 'none';
      }
    });
  }

  // Initialize notification system
  function initNotificationSystem() {
    injectNotificationPopup();
    updateNotificationBadge();

    // Update all notification buttons
    const notificationButtons = document.querySelectorAll('.notification-btn');
    notificationButtons.forEach(btn => {
      // Replace onclick with our handler
      btn.setAttribute('onclick', 'toggleOrderNotification()');
    });

    // Listen for order notification updates
    window.addEventListener('orderNotificationUpdated', function(event) {
      updateNotificationBadge();
      if (currentView === 'list' && document.getElementById('orderNotificationPopup')?.style.display === 'block') {
        renderNotificationList();
      }
    });
  }

  // Global function to toggle notification
  window.toggleOrderNotification = function() {
    const popup = document.getElementById('orderNotificationPopup');
    if (popup && popup.style.display === 'none') {
      showOrderNotification();
    } else {
      closeOrderNotification();
    }
  };

  window.closeOrderNotification = closeOrderNotification;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
  } else {
    initNotificationSystem();
  }

  // Also check periodically for badge updates, notification timing, and auto-dismiss
  setInterval(() => {
    // Update badge (will show new notifications when their time comes)
    const beforeCount = getOrderNotifications().length;
    updateNotificationBadge();
    const afterCount = getOrderNotifications().length;
    
    // If count changed (notification appeared), refresh list if open
    if (beforeCount !== afterCount && currentView === 'list') {
      const popup = document.getElementById('orderNotificationPopup');
      if (popup && popup.style.display === 'block') {
        renderNotificationList();
      }
    }
    
    // Clean up expired notifications from storage (appeared > 1 minute ago)
    const allNotificationsStr = localStorage.getItem('orderNotifications');
    if (allNotificationsStr) {
      try {
        const allNotifications = JSON.parse(allNotificationsStr);
        const now = Date.now();
        const activeNotifications = allNotifications.filter(notif => {
          // Keep notifications that haven't appeared yet (waiting for notificationTime)
          if (notif.notificationTime) {
            try {
              const notificationTime = new Date(notif.notificationTime).getTime();
              if (now < notificationTime) {
                return true; // Not yet time to show, keep it
              }
            } catch (e) {
              // If parsing fails, keep it
              return true;
            }
          }
          
          // Remove notifications that appeared more than 1 minute ago
          if (notif.appearedAt) {
            const appearedTime = new Date(notif.appearedAt).getTime();
            return (now - appearedTime) < 60000; // Keep if appeared < 1 minute ago
          }
          
          // If no appearedAt but has notificationTime in the past, mark it as appeared now
          if (notif.notificationTime) {
            try {
              const notificationTime = new Date(notif.notificationTime).getTime();
              if (now >= notificationTime) {
                // Mark as appeared but keep it (will be removed on next check)
                return true;
              }
            } catch (e) {
              // Keep it if parsing fails
              return true;
            }
          }
          
          // Default: keep notifications without timing info (fallback)
          return true;
        });
        
        // Only update storage if we removed some notifications
        if (activeNotifications.length !== allNotifications.length) {
          saveOrderNotifications(activeNotifications);
        }
      } catch (e) {
        console.error('Error cleaning up notifications:', e);
      }
    }
  }, 5000); // Check every 5 seconds
})();
