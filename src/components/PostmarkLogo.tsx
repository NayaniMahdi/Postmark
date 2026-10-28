import React from 'react';

interface PostmarkLogoProps {
  className?: string;
  size?: number;
}

export const PostmarkLogo: React.FC<PostmarkLogoProps> = ({
  className = '',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Postmark Icon"
    >
      <defs>
        {/* Apple-grade warm burgundy-charcoal gradient */}
        <linearGradient id="pm-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#252422" />
          <stop offset="55%" stopColor="#3B1E24" />
          <stop offset="100%" stopColor="#803D46" />
        </linearGradient>

        {/* Soft inner glow */}
        <linearGradient id="pm-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#803D46" stopOpacity="0.2" />
        </linearGradient>

        {/* Stamp ring glow */}
        <linearGradient id="pm-accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E9D7CE" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Squircle base */}
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="10"
        fill="url(#pm-bg-grad)"
        stroke="url(#pm-stroke-grad)"
        strokeWidth="1"
      />

      {/* Subtle postmark wave/cancellation lines in upper-right */}
      <path
        d="M26 8C27.5 9.2 29 9.8 31 9.5"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M28 11.5C29.2 12.4 30.5 12.8 32 12.6"
        stroke="#FFFFFF"
        strokeOpacity="0.2"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Envelope body */}
      <path
        d="M9.5 14C9.5 12.6193 10.6193 11.5 12 11.5H28C29.3807 11.5 30.5 12.6193 30.5 14V26C30.5 27.3807 29.3807 28.5 28 28.5H12C10.6193 28.5 9.5 27.3807 9.5 26V14Z"
        fill="#FFFFFF"
        fillOpacity="0.08"
        stroke="url(#pm-accent-grad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Envelope fold flap */}
      <path
        d="M10 12.5L20 20.5L30 12.5"
        stroke="url(#pm-accent-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Postmark stamp seal ring centered over the flap */}
      <circle
        cx="20"
        cy="20.5"
        r="4.5"
        fill="#2A1B1F"
        stroke="#F5EBE6"
        strokeWidth="1.25"
      />

      {/* AI Intelligence core node in center of postmark stamp */}
      <circle
        cx="20"
        cy="20.5"
        r="1.75"
        fill="#803D46"
      />
      <circle
        cx="20"
        cy="20.5"
        r="0.75"
        fill="#FFFFFF"
      />
    </svg>
  );
};
