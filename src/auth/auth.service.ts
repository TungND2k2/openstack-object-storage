import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface OpenStackTokenPayload {
  token: string;
  domain: {
    id: string;
  };
  project: {
    id: string;
    role: {
      name: string;
      id: string;
    };
  };
}

export interface AuthTokenData {
  sub: string;
  iat: number;
  exp: number;
  iss: string;
  openStackToken: OpenStackTokenPayload;
}

@Injectable()
export class AuthService {
  /**
   * Extract OpenStack token from JWT payload
   * @param authHeader Authorization header from request
   * @returns OpenStack token string
   */
  extractOpenStackToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const jwtToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Decode JWT without verification (assuming it's already verified by auth middleware)
      const decoded = jwt.decode(jwtToken) as any;
      
      if (!decoded) {
        throw new UnauthorizedException('Invalid JWT token');
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        throw new UnauthorizedException('JWT token has expired');
      }

      // Extract OpenStack token from the payload
      // Based on the example provided, the OpenStack token data is embedded directly
      const openStackData = decoded;
      
      if (!openStackData || !openStackData.token) {
        throw new UnauthorizedException('OpenStack token not found in JWT payload');
      }

      return openStackData.token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to extract OpenStack token');
    }
  }

  /**
   * Get OpenStack project ID from JWT token
   * @param authHeader Authorization header from request
   * @returns Project ID string
   */
  extractProjectId(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const jwtToken = authHeader.substring(7);
    
    try {
      const decoded = jwt.decode(jwtToken) as any;
      
      if (!decoded) {
        throw new UnauthorizedException('Invalid JWT token');
      }

      // Based on the example, project info is directly in the payload
      if (!decoded.project || !decoded.project.id) {
        throw new UnauthorizedException('Project ID not found in JWT payload');
      }

      return decoded.project.id;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to extract project ID');
    }
  }

  /**
   * Validate if user has required role for operation
   * @param authHeader Authorization header from request
   * @param requiredRole Required role name
   * @returns boolean
   */
  hasRole(authHeader: string, requiredRole: string): boolean {
    try {
      const jwtToken = authHeader.substring(7);
      const decoded = jwt.decode(jwtToken) as any;
      
      if (!decoded) {
        return false;
      }

      // Based on the example, role info is in project.role
      if (!decoded.project || !decoded.project.role) {
        return false;
      }

      return decoded.project.role.name === requiredRole;
    } catch (error) {
      return false;
    }
  }
}
