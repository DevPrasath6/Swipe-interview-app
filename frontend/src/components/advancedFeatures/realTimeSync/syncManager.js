// Cross-tab synchronization service using BroadcastChannel
export class SyncManager {
  constructor() {
    this.channel = null;
    this.listeners = new Map();
    this.isInitialized = false;

    // Bind methods to maintain proper context
    this.handleMessage = this.handleMessage.bind(this);
    this.handleStorageChange = this.handleStorageChange.bind(this);
  }

  /**
   * Initialize synchronization
   */
  init() {
    if (this.isInitialized) return;

    try {
      // Create BroadcastChannel for cross-tab communication
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('interview_sync');
        this.channel.addEventListener('message', this.handleMessage);
      }

      // Fallback to storage events for older browsers
      window.addEventListener('storage', this.handleStorageChange);

      this.isInitialized = true;
      console.log('Sync manager initialized');

    } catch (error) {
      console.warn('Failed to initialize sync manager:', error);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.channel) {
      this.channel.removeEventListener('message', this.handleMessage);
      this.channel.close();
      this.channel = null;
    }

    window.removeEventListener('storage', this.handleStorageChange);
    this.listeners.clear();
    this.isInitialized = false;

    console.log('Sync manager destroyed');
  }

  /**
   * Broadcast data change to other tabs
   */
  broadcastChange(type, data) {
    if (!this.isInitialized) return;

    const message = {
      type,
      data,
      timestamp: Date.now(),
      source: 'broadcast'
    };

    try {
      // Send via BroadcastChannel if available
      if (this.channel) {
        this.channel.postMessage(message);
      }

      // Also trigger storage event as fallback
      this.triggerStorageEvent(message);

    } catch (error) {
      console.warn('Failed to broadcast change:', error);
    }
  }

  /**
   * Listen for specific event types
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Remove all listeners for an event type
   */
  unsubscribe(eventType) {
    this.listeners.delete(eventType);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(event) {
    try {
      const { type, data, timestamp, source } = event.data;

      // Ignore messages from same tab
      if (source === 'storage') return;

      // Validate message
      if (!type || !timestamp) return;

      // Notify listeners
      this.notifyListeners(type, data, timestamp);

    } catch (error) {
      console.warn('Error handling sync message:', error);
    }
  }

  /**
   * Handle storage change events (fallback)
   */
  handleStorageChange(event) {
    try {
      // Only handle our sync events
      if (!event.key || !event.key.startsWith('interview_sync_')) return;

      const eventType = event.key.replace('interview_sync_', '');
      const data = event.newValue ? JSON.parse(event.newValue) : null;

      // Clean up the temporary storage item
      setTimeout(() => {
        localStorage.removeItem(event.key);
      }, 100);

      // Notify listeners
      this.notifyListeners(eventType, data?.payload, data?.timestamp);

    } catch (error) {
      console.warn('Error handling storage change:', error);
    }
  }

  /**
   * Trigger storage event for cross-tab communication
   */
  triggerStorageEvent(message) {
    try {
      const storageKey = `interview_sync_${message.type}`;
      const storageData = {
        payload: message.data,
        timestamp: message.timestamp
      };

      localStorage.setItem(storageKey, JSON.stringify(storageData));

      // Clean up after a short delay
      setTimeout(() => {
        localStorage.removeItem(storageKey);
      }, 1000);

    } catch (error) {
      console.warn('Failed to trigger storage event:', error);
    }
  }

  /**
   * Notify all listeners for a given event type
   */
  notifyListeners(eventType, data, timestamp) {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks || callbacks.size === 0) return;

    callbacks.forEach(callback => {
      try {
        callback({ type: eventType, data, timestamp });
      } catch (error) {
        console.warn('Error in sync listener callback:', error);
      }
    });
  }

  /**
   * Broadcast session update
   */
  broadcastSessionUpdate(sessionData) {
    this.broadcastChange('session_update', sessionData);
  }

  /**
   * Broadcast new candidate
   */
  broadcastCandidateAdded(candidate) {
    this.broadcastChange('candidate_added', candidate);
  }

  /**
   * Broadcast session completion
   */
  broadcastSessionCompleted(sessionData) {
    this.broadcastChange('session_completed', sessionData);
  }

  /**
   * Broadcast answer submission
   */
  broadcastAnswerSubmitted(answerData) {
    this.broadcastChange('answer_submitted', answerData);
  }

  /**
   * Broadcast UI state change
   */
  broadcastUIStateChange(uiState) {
    this.broadcastChange('ui_state_change', uiState);
  }

  /**
   * Check if synchronization is available
   */
  isAvailable() {
    return typeof BroadcastChannel !== 'undefined' || typeof Storage !== 'undefined';
  }

  /**
   * Get synchronization capabilities
   */
  getCapabilities() {
    return {
      broadcastChannel: typeof BroadcastChannel !== 'undefined',
      localStorage: typeof Storage !== 'undefined',
      isAvailable: this.isAvailable(),
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
export const syncManager = new SyncManager();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  syncManager.init();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    syncManager.destroy();
  });
}

// Export helper functions for common sync operations
export function broadcastSessionUpdate(sessionData) {
  syncManager.broadcastSessionUpdate(sessionData);
}

export function broadcastCandidateAdded(candidate) {
  syncManager.broadcastCandidateAdded(candidate);
}

export function broadcastSessionCompleted(sessionData) {
  syncManager.broadcastSessionCompleted(sessionData);
}

export function broadcastAnswerSubmitted(answerData) {
  syncManager.broadcastAnswerSubmitted(answerData);
}

export function broadcastUIStateChange(uiState) {
  syncManager.broadcastUIStateChange(uiState);
}

export function subscribeToSync(eventType, callback) {
  return syncManager.subscribe(eventType, callback);
}

export function unsubscribeFromSync(eventType) {
  syncManager.unsubscribe(eventType);
}

// Constants for event types
export const SYNC_EVENTS = {
  SESSION_UPDATE: 'session_update',
  CANDIDATE_ADDED: 'candidate_added',
  SESSION_COMPLETED: 'session_completed',
  ANSWER_SUBMITTED: 'answer_submitted',
  UI_STATE_CHANGE: 'ui_state_change'
};

export default syncManager;
