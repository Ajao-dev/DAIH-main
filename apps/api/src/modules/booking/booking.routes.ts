import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { BookingState, BookingSummary, ResourceCategory } from '@daih/types';
import { CATALOGUE_DATA } from '../catalogue/catalogue.routes.js';

export const bookingRouter = Router();

// In-memory active bookings / holds store (mirrors DB for instant responsive prototyping)
const BOOKINGS_STORE: BookingSummary[] = [
  {
    id: 'bk_sample_01',
    reference: 'DAIH-BK-88219',
    resourceId: 'res_hot_desk',
    resourceName: 'Hot Desk - Dedicated Pod A',
    category: ResourceCategory.HOT_DESK,
    userId: 'usr_demo_customer',
    customerName: 'Tunde Adeleke',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    state: BookingState.CONFIRMED,
    qrToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiaWQiOiJia19zYW1wbGVfMDEifQ.sig_demo',
    amount: 45000,
    currency: 'NGN',
    createdAt: new Date().toISOString(),
  },
];

// Create a 10-minute hold on a resource
bookingRouter.post('/hold', authenticate, (req: AuthRequest, res: Response) => {
  const { resourceId, startTime, endTime } = req.body;
  const user = req.user!;

  const resource = CATALOGUE_DATA.find((r) => r.id === resourceId || r.slug === resourceId);
  const resourceName = resource?.name || 'Selected Workspace';
  const defaultPrice = resource?.pricing[0]?.price || 5000;

  const holdExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10-min hold
  const bookingId = `bk_${Date.now()}`;
  const refNumber = `DAIH-BK-${Math.floor(10000 + Math.random() * 90000)}`;

  const newBooking: BookingSummary = {
    id: bookingId,
    reference: refNumber,
    resourceId: resourceId || 'res_hot_desk',
    resourceName,
    category: resource?.category || ResourceCategory.HOT_DESK,
    userId: user.id,
    customerName: user.email,
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 86400000).toISOString(),
    state: BookingState.HELD,
    amount: defaultPrice,
    currency: 'NGN',
    createdAt: new Date().toISOString(),
  };

  BOOKINGS_STORE.push(newBooking);

  res.status(201).json({
    success: true,
    data: {
      bookingId,
      resourceId,
      userId: user.id,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      holdExpiresAt: holdExpiry.toISOString(),
      totalAmount: newBooking.amount,
      currency: newBooking.currency,
      reference: refNumber,
    },
  });
});

bookingRouter.get('/my', authenticate, (req: AuthRequest, res: Response) => {
  const userBookings = BOOKINGS_STORE.filter(
    (b) => b.userId === req.user?.id || b.userId === 'usr_demo_customer'
  );

  res.json({
    success: true,
    data: userBookings,
  });
});

bookingRouter.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const booking = BOOKINGS_STORE.find((b) => b.id === req.params.id || b.reference === req.params.id);

  if (!booking) {
    res.status(404).json({
      code: 'BOOKING_NOT_FOUND',
      message: 'Booking record not found',
    });
    return;
  }

  res.json({
    success: true,
    data: booking,
  });
});

bookingRouter.post('/:id/confirm', authenticate, (req: AuthRequest, res: Response) => {
  const booking = BOOKINGS_STORE.find((b) => b.id === req.params.id);

  if (!booking) {
    res.status(404).json({
      code: 'BOOKING_NOT_FOUND',
      message: 'Booking not found',
    });
    return;
  }

  booking.state = BookingState.CONFIRMED;
  booking.qrToken = `daih_qr_${booking.id}_${Date.now()}`;

  res.json({
    success: true,
    data: booking,
  });
});
