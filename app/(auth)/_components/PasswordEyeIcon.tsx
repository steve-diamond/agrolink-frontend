type PasswordEyeIconProps = {
  visible: boolean;
};

export default function PasswordEyeIcon({ visible }: PasswordEyeIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
          <path d="M9.88 5.09A10.94 10.94 0 0112 4c5.05 0 9.27 3.11 10 8-0.23 1.55-0.88 2.98-1.86 4.18" />
          <path d="M6.61 6.61C4.62 7.99 3.24 9.86 2 12c0.73 4.89 4.95 8 10 8 1.86 0 3.61-0.42 5.16-1.16" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
