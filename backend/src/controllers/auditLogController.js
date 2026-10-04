import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { AuditLog } from '../models/schemas.js';

export const getAuditLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res
        .status(403)
        .json({ success: false, message: 'Only administrators can view security audit logs' });
      return;
    }
    const { eventType, role, search } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (eventType && eventType !== 'ALL') {
        filter.eventType = eventType;
      }
      if (role && role !== 'ALL') {
        filter.actorRole = role.toLowerCase();
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { actorEmail: regex },
          { actorId: regex },
          { eventType: regex },
          { action: regex },
        ];
      }

      const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).lean();
      return res.json({
        success: true,
        totalLogs: logs.length,
        logs,
      });
    }

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
