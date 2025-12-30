import { SetMetadata } from '@nestjs/common';

export const ACCESS_ROLE_KEY = 'isPublic';
export const Public = () => SetMetadata(ACCESS_ROLE_KEY, 'public');

export const Admin = () => SetMetadata(ACCESS_ROLE_KEY, 'admin');
