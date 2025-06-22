// Global types for the WAKE FORM site
import { ReactNode } from 'react';

// Animation mode type
export type AnimationMode = 'chill' | 'focus' | 'energize';

// Feature interface for feature cards
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

// Demo screen interface for app demo carousel
export interface DemoScreen {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  waveType: 'square' | 'sine' | 'sawtooth' | 'triangle';
}

// Section data interface
export interface SectionContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttons?: {
    text: string;
    url: string;
    isPrimary?: boolean;
  }[];
}

// Social media link interface
export interface SocialLink {
  id: string;
  icon: string;
  url: string;
  label: string;
}

// Navigation link interface
export interface NavLink {
  id: string;
  text: string;
  url: string;
}

// CTA content interface
export interface CtaContent {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
}

// Mode data for animation modes
export interface ModeData {
  icon: string;
  color: string;
  label: string;
  description: string;
}
