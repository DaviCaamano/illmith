import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { lowerCaseParam } from '@utils';

export class userDto {
  @IsNotEmpty()
  @Transform(lowerCaseParam)
  identifier: string;

  @IsNotEmpty()
  password: string;
}

export class registerUserDto {
  @IsNotEmpty()
  @Transform(lowerCaseParam)
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  subscribe: boolean;

  @IsOptional()
  @Transform(lowerCaseParam)
  username: string;
}

export class resetPasswordDto {
  @IsNotEmpty()
  @Transform(lowerCaseParam)
  email: string;
}

export class newPasswordDTo {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;
}
