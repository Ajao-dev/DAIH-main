import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";
import { identityService } from "./identity.service.js";
import { staffUserService } from "./staff-user.service.js";
import { customerService } from "./customer.service.js";
import { AuthRequest } from "../../middleware/auth.middleware.js";

export class IdentityController {
  private setRefreshCookie(res: Response, rawRefreshToken: string): void {
    const maxAge = config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000;
    res.cookie(config.cookies.refreshCookieName, rawRefreshToken, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: config.cookies.sameSite,
      domain: config.cookies.domain,
      path: config.cookies.path,
      maxAge,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(config.cookies.refreshCookieName, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: config.cookies.sameSite,
      domain: config.cookies.domain,
      path: config.cookies.path,
    });
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await identityService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const portalHeader = (req.headers["x-portal"] ||
        req.headers["x-client-portal"]) as string | undefined;
      const { accessToken, rawRefreshToken, user } =
        await identityService.login(req.body, {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          portal: req.body?.portal || req.body?.audience || portalHeader,
        });

      this.setRefreshCookie(res, rawRefreshToken);

      res.json({
        success: true,
        data: {
          token: accessToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawRefreshToken =
        req.cookies?.[config.cookies.refreshCookieName] ||
        req.body?.refreshToken ||
        (req.headers["x-refresh-token"] as string);

      if (!rawRefreshToken) {
        res.status(401).json({
          code: "UNAUTHORIZED",
          message: "Refresh token cookie is missing",
        });
        return;
      }

      const {
        accessToken,
        rawRefreshToken: nextRefreshToken,
        user,
      } = await identityService.refresh(rawRefreshToken, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      this.setRefreshCookie(res, nextRefreshToken);

      res.json({
        success: true,
        data: {
          token: accessToken,
          user,
        },
      });
    } catch (error) {
      this.clearRefreshCookie(res);
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawRefreshToken =
        req.cookies?.[config.cookies.refreshCookieName] ||
        req.body?.refreshToken ||
        (req.headers["x-refresh-token"] as string);

      let sessionId: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const payload = jwt.decode(token) as any;
          if (payload && payload.sessionId) {
            sessionId = payload.sessionId;
          }
        } catch {
          // ignore decode errors on logout
        }
      }

      await identityService.logout(rawRefreshToken, sessionId);
      this.clearRefreshCookie(res);

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = (req.query.token as string) || (req.body?.token as string);
      const user = await identityService.verifyEmail(token);

      res.json({
        success: true,
        message: "Email verified successfully. You can now log in.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await identityService.resendVerification(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  requestPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await identityService.requestPasswordReset(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  confirmPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await identityService.confirmPasswordReset(
        req.body.token,
        req.body.newPassword,
      );
      this.clearRefreshCookie(res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res
          .status(401)
          .json({ code: "UNAUTHORIZED", message: "Authentication required" });
        return;
      }
      const user = await identityService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  createStaffUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await staffUserService.createStaffUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getStaffUsers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await staffUserService.getStaffUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await customerService.getCustomers(req.query as any);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createCustomer = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const identityController = new IdentityController();
