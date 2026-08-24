import { Router, Request, Response } from 'express';
import { ResourceCategory, FacilityResource } from '@daih/types';

export const catalogueRouter = Router();

export const CATALOGUE_DATA: FacilityResource[] = [
  {
    id: 'res_hot_desk',
    name: 'Hot Desk',
    slug: 'hot-desk',
    category: ResourceCategory.HOT_DESK,
    description: 'Flexible workstation in our dynamic open coworking lounge with high-speed internet and power backup.',
    capacity: 50,
    location: 'Ground Floor, Innovation Lounge',
    amenities: ['High-speed WiFi', 'Ergonomic Chair', 'Power Access', 'Coffee & Tea', 'Community Access'],
    imageUrl: '/images/our-plans/hot-desk.jpg',
    isActive: true,
    pricing: [
      { id: 'prc_hd_daily', planName: 'Daily Pass', durationDays: 1, price: 3000, currency: 'NGN' },
      { id: 'prc_hd_weekly', planName: 'Weekly Flex', durationDays: 7, price: 14000, currency: 'NGN' },
      { id: 'prc_hd_monthly', planName: 'Monthly Unlimited', durationMonths: 1, price: 45000, currency: 'NGN', isPopular: true },
    ],
  },
  {
    id: 'res_dedicated_desk',
    name: 'Dedicated Desk',
    slug: 'dedicated-desk',
    category: ResourceCategory.DEDICATED_DESK,
    description: 'Your own reserved personal desk with lockable storage in a quiet, productive workspace zone.',
    capacity: 24,
    location: '1st Floor, Focus Wing',
    amenities: ['24/7 Access', 'Lockable Storage Cabinet', 'High-Speed LAN/WiFi', 'Meeting Room Credits', 'Mailing Address'],
    imageUrl: '/images/our-plans/dedicated-desk.jpg',
    isActive: true,
    pricing: [
      { id: 'prc_dd_monthly', planName: 'Monthly Dedicated', durationMonths: 1, price: 75000, currency: 'NGN', isPopular: true },
      { id: 'prc_dd_quarterly', planName: 'Quarterly Reserved', durationMonths: 3, price: 210000, currency: 'NGN' },
    ],
  },
  {
    id: 'res_office_suite',
    name: 'Private Office Suite',
    slug: 'office-suite',
    category: ResourceCategory.OFFICE_SUITE,
    description: 'Fully furnished private office customized for teams of 4 to 12 members with secure private access.',
    capacity: 10,
    location: '2nd Floor, Executive Wing',
    amenities: ['Private Keycard Access', 'Dedicated High-Speed Network', 'Custom Branding', 'Executive Boardroom Access', 'Daily Cleaning'],
    imageUrl: '/images/our-plans/private-office.jpg',
    isActive: true,
    pricing: [
      { id: 'prc_os_monthly', planName: 'Monthly Team Suite', durationMonths: 1, price: 350000, currency: 'NGN', isPopular: true },
    ],
  },
  {
    id: 'res_conference_hall',
    name: 'Conference Hall',
    slug: 'conference-hall',
    category: ResourceCategory.CONFERENCE_HALL,
    description: 'State-of-the-art auditorium equipped with 4K projection, professional audio systems, and hybrid streaming.',
    capacity: 250,
    location: 'Ground Floor, Auditorium Block',
    amenities: ['4K Dual Projectors', 'Wireless Microphones', 'Live Stream Control Room', 'Podium & Stage Lighting', 'VIP Green Room'],
    imageUrl: '/images/our-plans/conference-hall.jpg',
    isActive: true,
    pricing: [
      { id: 'prc_ch_half', planName: 'Half Day (4 Hours)', durationHours: 4, price: 200000, currency: 'NGN' },
      { id: 'prc_ch_full', planName: 'Full Day (8 Hours)', durationHours: 8, price: 350000, currency: 'NGN', isPopular: true },
    ],
  },
  {
    id: 'res_training_room',
    name: 'Training & Workshop Room',
    slug: 'training-room',
    category: ResourceCategory.TRAINING_ROOM,
    description: 'Modular classroom-style workshop room ideal for tech bootcamps, corporate seminars, and masterclasses.',
    capacity: 40,
    location: '1st Floor, Learning Wing',
    amenities: ['Interactive Smart Board', 'Modular Desks', 'High-Speed Lab Network', 'Whiteboard Walls', 'Breakout Corner'],
    imageUrl: '/images/our-plans/training-room.jpg',
    isActive: true,
    pricing: [
      { id: 'prc_tr_hourly', planName: 'Hourly Booking', durationHours: 1, price: 25000, currency: 'NGN' },
      { id: 'prc_tr_daily', planName: 'Full Day Training', durationHours: 8, price: 150000, currency: 'NGN', isPopular: true },
    ],
  },
];

catalogueRouter.get('/resources', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: CATALOGUE_DATA,
  });
});

catalogueRouter.get('/resources/:slug', (req: Request, res: Response) => {
  const resource = CATALOGUE_DATA.find(
    (r) => r.slug === req.params.slug || r.id === req.params.slug
  );

  if (!resource) {
    res.status(404).json({
      code: 'RESOURCE_NOT_FOUND',
      message: `Resource '${req.params.slug}' was not found in catalogue`,
    });
    return;
  }

  res.json({
    success: true,
    data: resource,
  });
});
