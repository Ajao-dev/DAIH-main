import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { validateParams, validateBody } from '../../middleware/validate.middleware.js';
import { VerifyQrSchema, BookingIdParamSchema } from './access.schema.js';
import { bookingService } from '../booking/booking.service.js';
import { BookingState } from '@daih/types';

export const accessRouter = Router();

accessRouter.get(
  '/qr/:bookingId',
  authenticate,
  validateParams(BookingIdParamSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const bookingId = String(req.params.bookingId);
      const booking = await bookingService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({
          code: 'BOOKING_NOT_FOUND',
          message: `Booking '${bookingId}' was not found`,
        });
        return;
      }

      const isConfirmed = [
        BookingState.CONFIRMED,
        BookingState.ACTIVE,
        BookingState.CHECKED_IN,
        BookingState.COMPLETED,
      ].includes(booking.state as BookingState);

      if (!isConfirmed || !booking.qrToken) {
        res.status(403).json({
          code: 'PAYMENT_REQUIRED',
          message: 'QR code access pass is only generated after booking payment is confirmed',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          token: booking.qrToken,
          bookingId: booking.id,
          reference: booking.reference,
          resourceName: booking.resourceName,
          expiresAt: booking.endTime,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

accessRouter.post(
  '/verify-qr',
  authenticate,
  validateBody(VerifyQrSchema),
  (req: AuthRequest, res: Response) => {
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
  }
);

accessRouter.post(
  '/checkin/:bookingId',
  authenticate,
  validateParams(BookingIdParamSchema),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        success: true,
        action: 'CHECKED_IN',
        timestamp: new Date().toISOString(),
      },
    });
  }
);

accessRouter.post(
  '/checkout/:bookingId',
  authenticate,
  validateParams(BookingIdParamSchema),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        success: true,
        action: 'CHECKED_OUT',
        timestamp: new Date().toISOString(),
      },
    });
  }
);
