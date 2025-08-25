import { ITeamMember } from "../../models/Team";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Indian format)
const PHONE_REGEX = /^(\+91|91|0)?[6-9]\d{9}$/;

/**
 * Validate team registration data
 */
export interface TeamRegistrationData {
  teamName: string;
  problemStatement: string;
  members: ITeamMember[];
}

export function validateTeamRegistration(data: TeamRegistrationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate team name
  if (!data.teamName || data.teamName.trim().length < 3) {
    errors.push("Team name must be at least 3 characters long");
  }

  // Validate problem statement
  if (!data.problemStatement) {
    errors.push("Problem statement must be selected");
  }

  // Validate members array
  if (!data.members || !Array.isArray(data.members)) {
    errors.push("Members data is required");
  } else {
    // Check exact count
    if (data.members.length !== 5) {
      errors.push("Team must have exactly 5 members");
    }

    // Validate each member
    data.members.forEach((member, index) => {
      const memberErrors = validateTeamMember(member, index + 1);
      errors.push(...memberErrors);
    });

    // Check gender diversity
    const hasFemaleMember = data.members.some(
      (member) => member.gender === "female"
    );
    if (!hasFemaleMember) {
      errors.push("Team must have at least one female member");
    }

    // Check for duplicate emails
    const emails = data.members.map((m) => m.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      errors.push("All team members must have unique email addresses");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate individual team member data
 */
export function validateTeamMember(
  member: ITeamMember,
  memberNumber: number
): string[] {
  const errors: string[] = [];
  const prefix = `Member ${memberNumber}:`;

  // Validate name
  if (!member.name || member.name.trim().length < 2) {
    errors.push(`${prefix} Name must be at least 2 characters long`);
  }

  // Validate email
  if (!member.email || !EMAIL_REGEX.test(member.email)) {
    errors.push(`${prefix} Invalid email address`);
  }

  // Validate phone
  if (!member.phone || !PHONE_REGEX.test(member.phone.replace(/\s/g, ""))) {
    errors.push(
      `${prefix} Invalid phone number (must be a valid Indian number)`
    );
  }

  // Validate gender
  if (!member.gender || !["male", "female", "other"].includes(member.gender)) {
    errors.push(`${prefix} Gender must be selected`);
  }

  // Validate college
  if (!member.college || member.college.trim().length < 3) {
    errors.push(`${prefix} College name must be at least 3 characters long`);
  }

  // Validate year
  if (!member.year || member.year.trim().length === 0) {
    errors.push(`${prefix} Year must be specified`);
  }

  // Validate branch
  if (!member.branch || member.branch.trim().length < 2) {
    errors.push(`${prefix} Branch must be at least 2 characters long`);
  }

  return errors;
}

/**
 * Validate admin registration data
 */
export interface AdminRegistrationData {
  name: string;
  email: string;
  password: string;
  adminSecretKey: string;
}

export function validateAdminRegistration(data: AdminRegistrationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Validate email
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.push("Invalid email address");
  }

  // Validate password
  if (!data.password || data.password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Validate admin secret key
  if (
    !data.adminSecretKey ||
    data.adminSecretKey !== process.env.ADMIN_SECRET_KEY
  ) {
    errors.push("Invalid admin secret key");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSizeInMB: number;
  allowedFormats: string[];
}

export function validateFile(
  file: { size: number; type: string; name: string },
  options: FileValidationOptions
): { isValid: boolean; error?: string } {
  const maxSizeInBytes = options.maxSizeInMB * 1024 * 1024;

  // Check file size
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${options.maxSizeInMB}MB`,
    };
  }

  // Check file format
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !options.allowedFormats.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File format not allowed. Allowed formats: ${options.allowedFormats.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize text input
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate team portal token (for passwordless login)
 */
export function generateTeamToken(teamId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  return Buffer.from(`${teamId}:${timestamp}:${randomString}`).toString(
    "base64"
  );
}
