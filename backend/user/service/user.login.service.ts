import bcrypt from 'bcrypt';
import { Injectable, Logger, Req } from '@nestjs/common';
import { httpErrorHandler } from '@utils/server/logging/httpsErrorHandler';
import { errorCodes } from '@error';
import { ADMIN_ROLE_ID } from '@constants/shared';

//service
import { PrismaService } from '@shared/service/prisma.service';
import { ParseService } from '@shared/service/parse.service';

//types
import { LogHandler } from '@interface/server/logging';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { LoginResponse, UserValidation } from '@interface/server/user';
import { HttpStatus } from '@nestjs/common';
import { ErrorHandler } from '@utils/server/logging/httpsErrorHandler';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class UserLoginService {
  private readonly log: LogHandler;
  private readonly error: LogHandler;
  private readonly httpError: ErrorHandler;
  constructor(
    private readonly db: PrismaService,
    private readonly parse: ParseService,
    private readonly logger: Logger
  ) {
    this.log = (...args: any) => {
      logger.log(args);
    };
    this.error = (...args: any) => {
      logger.error(args);
    };
    this.httpError = httpErrorHandler(this.error);
  }

  async validate({ userValidated, authToken, user }: Request): Promise<UserValidation> {
    if (userValidated && authToken) {
      const response: UserValidation = authToken;
      if (user?.roleId === ADMIN_ROLE_ID) response.admin = true;
      return response;
    }
    this.httpError('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  async authorize(
    @Req()
    { userAuthorized, authToken }: Request
  ): Promise<UserValidation> {
    if (userAuthorized && authToken) return authToken;
    this.httpError('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  async login(identifier: string, inputPassword: string, ip: string, admin?: boolean): Promise<LoginResponse> {
    identifier = identifier.toLowerCase();
    const where: Prisma.UserWhereInput = {
      OR: [{ email: identifier }, { username: identifier }],
    };
    let user, pendingUser;
    try {
      [user, pendingUser] = await Promise.all([
        this.db.user.findFirst({
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            roleId: true,
          },
          where,
        }),
        this.db.pendingUser.findFirst({
          select: { email: true },
          where,
        }),
      ]);
    } catch (err: any) {
      this.httpError('Unable to query users.', err);
    }

    if (pendingUser) {
      this.httpError(errorCodes.UserRegistration.emailNotValidated, HttpStatus.UNAUTHORIZED);
    }
    if (!user || (admin && user.roleId !== ADMIN_ROLE_ID)) {
      this.httpError(errorCodes.Login.invalidCredential, HttpStatus.UNAUTHORIZED);
    }
    const { id, email, username, password } = user;

    if (await bcrypt.compare(inputPassword, password)) {
      return await this.loginResponse(id, email, username, admin, ip);
    } else {
      this.httpError(errorCodes.Login.invalidCredential, HttpStatus.UNAUTHORIZED);
    }
  }

  async loginResponse(
    userId: number,
    email: string,
    username: string | null,
    admin?: boolean,
    ip?: string
  ): Promise<LoginResponse> {
    if (!ip) {
      this.httpError(errorCodes.Login.generic);
    }
    const tokenInfo: { email: string; username: string | null; admin?: boolean } = {
      email,
      username,
    };
    if (admin) tokenInfo.admin = true;
    const jwtPayload: JwtPayload = this.parse.signJWT(JSON.parse(JSON.stringify(tokenInfo)));
    const { token, exp: tokenExpiration } = jwtPayload;
    if (!tokenExpiration) {
      this.httpError(errorCodes.Login.tokenFailure);
    }
    const expiration: Date = new Date(new Date().getTime() + tokenExpiration);
    await this.db.authentication.upsert({
      where: {
        ip,
      },
      update: {
        token,
        expiration,
        userId,
      },
      create: {
        ip,
        token,
        expiration,
        userId,
      },
    });
    return { token, expiration: expiration.getTime() };
  }

  async logout(ip: string) {
    try {
      await this.db.authentication.delete({ where: { ip } });
      return { logout: true };
    } catch (err: any) {
      this.httpError('Logout failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
