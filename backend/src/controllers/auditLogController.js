import { dbStore } from '../store/inMemoryStore.js';

export const getAuditLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res
        .status(403)
        .json({ success: false, message: 'Only administrators can view security audit logs' });
      return;
    }
    const { eventType, role, search } = req.query;
    const logs = dbStore.getAuditLogs({ eventType, role, search });
    res.json({
      success: true,
      totalLogs: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
};
