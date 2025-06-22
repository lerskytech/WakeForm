/// <reference types="vite/client" />

// Declare component module paths
declare module '*.tsx' {
  import React from 'react';
  const Component: React.FC<any>;
  export default Component;
}

// Declare the global configuration
declare interface Window {
  WAKE_FORM_CONFIG: {
    animationMode: 'chill' | 'focus' | 'energize';
    audioEnabled: boolean;
    reduceMotion: boolean;
  }
}

// Declare svg module to avoid import errors
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

// Image declarations
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';

// Audio declarations
declare module '*.mp3';
declare module '*.wav';

// JSON declarations
declare module '*.json' {
  const value: any;
  export default value;
}
