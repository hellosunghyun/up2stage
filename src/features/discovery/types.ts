export interface DiscoveredAttachment {
  id: string;
  url: string;
  fileName: string;
  extension?: string;
  label?: string;
  sourceElementText?: string;
  selected: boolean;
  accessible: boolean;
}
