export interface InitialGuidance {
  overview: string;
  topRequirements: string[];
  nearestDeadline: string;
  requiredSubmissions: string[];
  topCautions: string[];
  nextActions: string[];
  missingInformation: string[];
  personalizationStatus: "not_evaluated";
}

export interface PrimaryNoticeExtract {
  title: string;
  issuer: string;
  benefits_or_outcomes: string[];
  key_dates: string[];
  key_requirements: string[];
  required_submissions: string[];
  conditional_submissions?: string[];
  quick_questions: string[];
  critical_cautions: string[];
  next_actions_seed: string[];
  contacts?: string[];
}

export interface SubmissionItem {
  title: string;
  condition?: string;
  required: boolean;
}

export interface ApplicationFormExtract {
  form_title: string;
  form_type: string;
  required_fields: string[];
  required_signatures: string[];
  required_attachments: string[];
  format_constraints: string[];
  form_cautions: string[];
}

export interface ProcedureExtract {
  guide_title: string;
  steps: string[];
  channels: string[];
  file_rules: string[];
  completion_checks: string[];
  procedure_cautions: string[];
}

export interface TimelineItem {
  id: string;
  dateText: string;
  label: string;
  isDeadline?: boolean;
}
