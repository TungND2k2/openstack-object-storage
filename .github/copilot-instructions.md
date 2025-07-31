# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a NestJS Object Storage module using OpenStack Swift for enterprise-grade object storage management.

## Key Technologies
- **NestJS**: Backend framework for building RESTful APIs
- **OpenStack Swift**: Object Storage service (REST API v1)
- **MongoDB**: Database for storing Swift endpoints and tokens
- **TypeScript**: Primary programming language

## Architecture Guidelines
- Use dependency injection patterns from NestJS
- Implement proper error handling for Swift API calls
- Store Swift credentials securely in MongoDB, not environment variables
- Integrate with Core Auth Service for X-Auth-Token management
- Support public and temporary URL generation for objects

## Code Style
- Follow NestJS conventions and best practices
- Use DTOs for request/response validation
- Implement proper logging for all operations
- Use async/await for all asynchronous operations
- Implement proper error handling and validation

## Security Considerations
- Never expose Swift credentials in responses
- Validate all file uploads and object operations
- Implement proper authentication middleware
- Use secure headers for all API responses
