import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { UserRole } from '@daih/types';

export const accessRouter = Router();

accessRouter.get('/qr/:bookingId', authenticate, (req: AuthRequest, res: Response) => {
  const { bookingId } = req.params;
  const token = `daih_qr_token_${bookingId}_signed`;

  res.json({
    success: true,
    data: {
      token,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  });
});

accessRouter.post('/verify-qr', authenticate, (req: AuthRequest, res: Response) => {
  const { token } = req.body;

  res.json({
    success: true,
    data: {
      valid: true,
      booking: {
        id: 'bk_sample_01',
        reference: 'DAIH-BK-88219',
        customerName: 'Tunde Adeleke',
        resourceName: 'Hot Desk - Dedicated Pod A',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
      },
    },
  });
});

accessRouter.post('/checkin/:bookingId', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      success: true,
      action: 'CHECKED_IN',
      timestamp: new Date().toISOString(),
    },
  });
});

accessRouter.post('/checkout/:bookingId', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      success: true,
      action: 'CHECKED_OUT',
      timestamp: new Date().toISOString(),
    },
  });
});
