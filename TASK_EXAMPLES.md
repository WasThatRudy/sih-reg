# Task Creation Examples

## 1. PPT/PDF Upload Task

```json
POST /api/admin/tasks
{
  "title": "Mid-Point Presentation Submission",
  "description": "Please upload your mid-point presentation in PPT or PDF format. The presentation should include your progress, challenges faced, and next steps.",
  "fields": [
    {
      "type": "file",
      "label": "Presentation File",
      "required": true,
      "acceptedFormats": ["ppt", "pptx", "pdf"],
      "maxSize": 20
    },
    {
      "type": "textarea",
      "label": "Additional Comments",
      "required": false,
      "placeholder": "Any additional comments or notes...",
      "maxLength": 500
    }
  ],
  "assignedTo": ["teamId1", "teamId2"],
  "dueDate": "2025-09-15T23:59:59.000Z"
}
```

## 2. Form-Based Task

```json
POST /api/admin/tasks
{
  "title": "Team Progress Report",
  "description": "Please fill out this progress report form with your current status and next steps.",
  "fields": [
    {
      "type": "text",
      "label": "Current Progress (%)",
      "required": true,
      "placeholder": "e.g., 65"
    },
    {
      "type": "textarea",
      "label": "Achievements This Week",
      "required": true,
      "placeholder": "List your major achievements...",
      "maxLength": 1000
    },
    {
      "type": "textarea",
      "label": "Challenges Faced",
      "required": true,
      "placeholder": "Describe any challenges...",
      "maxLength": 1000
    },
    {
      "type": "textarea",
      "label": "Next Week Plans",
      "required": true,
      "placeholder": "What are your plans for next week...",
      "maxLength": 1000
    },
    {
      "type": "url",
      "label": "GitHub Repository Link",
      "required": false,
      "placeholder": "https://github.com/yourteam/project"
    }
  ],
  "assignedTo": ["teamId1", "teamId2"],
  "dueDate": "2025-09-10T17:00:00.000Z"
}
```

## 3. Mixed Task (File + Form)

```json
POST /api/admin/tasks
{
  "title": "Final Submission",
  "description": "Submit your final project deliverables including source code, documentation, and demo video.",
  "fields": [
    {
      "type": "file",
      "label": "Source Code (ZIP)",
      "required": true,
      "acceptedFormats": ["zip", "rar", "7z"],
      "maxSize": 100
    },
    {
      "type": "file",
      "label": "Project Documentation",
      "required": true,
      "acceptedFormats": ["pdf", "doc", "docx"],
      "maxSize": 25
    },
    {
      "type": "file",
      "label": "Demo Video",
      "required": true,
      "acceptedFormats": ["mp4", "avi", "mov"],
      "maxSize": 500
    },
    {
      "type": "url",
      "label": "Live Demo Link",
      "required": false,
      "placeholder": "https://yourproject.demo.com"
    },
    {
      "type": "url",
      "label": "GitHub Repository",
      "required": true,
      "placeholder": "https://github.com/yourteam/final-project"
    },
    {
      "type": "textarea",
      "label": "Project Description",
      "required": true,
      "placeholder": "Briefly describe your project and its impact...",
      "maxLength": 2000
    }
  ],
  "assignedTo": [],  // Empty means all teams
  "dueDate": "2025-09-30T23:59:59.000Z"
}
```

## Team Submission APIs

### Get Team's Assigned Tasks

```
GET /api/team/tasks
Authorization: Bearer <firebase-token>
```

### Submit a Task

```
POST /api/team/tasks/[taskId]/submit
Content-Type: multipart/form-data
Authorization: Bearer <firebase-token>

Form Data:
- [Field Label]: [Field Value or File]
```

### Get Task Submission Status

```
GET /api/team/tasks/[taskId]/submit
Authorization: Bearer <firebase-token>
```
