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
      errors.push("Team must have exactly 5 members (excluding leader)");
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

// Legacy frontend validation functions for compatibility
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone.replace(/\s+/g, ""));
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s.']+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};

export const validateTeamName = (teamName: string): boolean => {
  return teamName.trim().length >= 3 && teamName.trim().length <= 50;
};

export const validateBranch = (branch: string): boolean => {
  // Import branches for validation
  const validBranches = [
    "Artificial Intelligence and Machine Learning",
    "Aeronautical Engineering",
    "Automobile Engineering",
    "Biotechnology",
    "Computer Science and Engineering",
    "Computer Science and Business Systems",
    "Computer Science & Engineering (Cyber Security)",
    "Computer Science & Engineering (Data Science)",
    "Computer Science & Engineering (Internet of Things and Cyber Security Including Block Chain Technology)",
    "Computer Science and Design",
    "Chemical Engineering",
    "Civil Engineering",
    "Electrical & Electronics Engineering",
    "Electronics & Communication Engineering",
    "Electronics and Instrumentation Engineering",
    "Electronics and Telecommunication Engineering",
    "Information Science and Engineering",
    "Mechanical Engineering",
    "Medical Electronics Engineering",
    "Robotics and Artificial Intelligence",
  ];

  return validBranches.includes(branch.trim());
};

export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, "$1 $2");
  }
  return phone;
};

export const getValidationMessage = (field: string, value: string): string => {
  if (!isRequired(value)) {
    return `${field} is required`;
  }

  switch (field.toLowerCase()) {
    case "email":
      if (!validateEmail(value)) {
        return "Please enter a valid email address";
      }
      break;
    case "phone":
      if (!validatePhone(value)) {
        return "Please enter a valid 10-digit phone number";
      }
      break;
    case "name":
      if (!validateName(value)) {
        return "Name should contain only letters, spaces, dots, and apostrophes";
      }
      break;
    case "team name":
      if (!validateTeamName(value)) {
        return "Team name should be 3-50 characters long";
      }
      break;
    case "branch":
      if (!validateBranch(value)) {
        return "Please select a valid branch from the dropdown";
      }
      break;
  }
  return "";
};

// Validation for checking duplicate emails and phone numbers across team leader and members
export interface TeamFormData {
  teamLeader: {
    email: string;
    phone: string;
  };
  members: Array<{
    email: string;
    phone: string;
  }>;
}

export const validateNoDuplicates = (
  formData: TeamFormData
): {
  emailDuplicates: { [key: string]: string };
  phoneDuplicates: { [key: string]: string };
} => {
  const emailDuplicates: { [key: string]: string } = {};
  const phoneDuplicates: { [key: string]: string } = {};

  // Collect all emails and phones with their sources
  const emailMap = new Map<string, string[]>();
  const phoneMap = new Map<string, string[]>();

  // Add team leader email and phone if they exist
  if (formData.teamLeader.email && formData.teamLeader.email.trim()) {
    const email = formData.teamLeader.email.toLowerCase().trim();
    if (!emailMap.has(email)) emailMap.set(email, []);
    emailMap.get(email)?.push("team leader");
  }
  if (formData.teamLeader.phone && formData.teamLeader.phone.trim()) {
    const phone = formData.teamLeader.phone.replace(/\s+/g, "");
    if (!phoneMap.has(phone)) phoneMap.set(phone, []);
    phoneMap.get(phone)?.push("team leader");
  }

  // Add member emails and phones
  formData.members.forEach((member, index) => {
    const memberKey = `member ${index + 1}`;

    if (member.email && member.email.trim()) {
      const email = member.email.toLowerCase().trim();
      if (!emailMap.has(email)) emailMap.set(email, []);
      emailMap.get(email)?.push(memberKey);
    }

    if (member.phone && member.phone.trim()) {
      const phone = member.phone.replace(/\s+/g, "");
      if (!phoneMap.has(phone)) phoneMap.set(phone, []);
      phoneMap.get(phone)?.push(memberKey);
    }
  });

  // Find duplicates and create error messages for each source
  emailMap.forEach((sources, email) => {
    if (sources.length > 1) {
      sources.forEach((source) => {
        const otherSources = sources.filter((s) => s !== source);
        emailDuplicates[
          source
        ] = `This email is also used by ${otherSources.join(" and ")}`;
      });
    }
  });

  phoneMap.forEach((sources, phone) => {
    if (sources.length > 1) {
      sources.forEach((source) => {
        const otherSources = sources.filter((s) => s !== source);
        phoneDuplicates[
          source
        ] = `This phone number is also used by ${otherSources.join(" and ")}`;
      });
    }
  });

  return { emailDuplicates, phoneDuplicates };
};
