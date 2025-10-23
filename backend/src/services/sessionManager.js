class SessionManager {
  constructor() {
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '90000'); // 90 seconds
    this.sessions = {}; // In-memory session storage for development
  }

  async createSession(sessionId, phoneNumber) {
    const expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();
    
    const session = {
      session_id: sessionId,
      phone_number: phoneNumber,
      current_menu: 'main',
      session_data: JSON.stringify({}),
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    };

    // Store in memory for development
    this.sessions[sessionId] = session;

    return session;
  }

  async getSession(sessionId) {
    try {
      // Simple in-memory session for testing
      // In production, you'd query the database
      if (this.sessions && this.sessions[sessionId]) {
        const session = this.sessions[sessionId];
        // Check if session is expired
        if (new Date(session.expires_at) > new Date()) {
          return session;
        } else {
          delete this.sessions[sessionId];
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async updateSession(sessionId, data, db) {
    try {
      // Update in-memory session
      if (this.sessions[sessionId]) {
        this.sessions[sessionId].current_menu = data.current_menu || 'main';
        this.sessions[sessionId].session_data = data.session_data || '{}';
        this.sessions[sessionId].phone_number = data.phone_number || this.sessions[sessionId].phone_number;
      }
      
      // Also update in database if available
      if (!db) return;
      
      const sql = `
        INSERT OR REPLACE INTO ussd_sessions 
        (session_id, phone_number, current_menu, session_data, expires_at)
        VALUES (?, ?, ?, ?, datetime('now', '+90 seconds'))
      `;
      
      await db.run(sql, [
        sessionId,
        data.phone_number || '',
        data.current_menu || 'main',
        data.session_data || '{}'
      ]);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  async cleanExpiredSessions(db) {
    try {
      await db.run('DELETE FROM ussd_sessions WHERE expires_at < datetime("now")');
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  }
}

module.exports = SessionManager;