
import React from 'react';

interface IconProps {
  className?: string;
  onClick?: () => void;
}

export const BayanLogo: React.FC<IconProps> = ({ className, onClick }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick} stroke="currentColor" strokeWidth="1.2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5L12 4L19.5 7.5V16.5L12 20L4.5 16.5V7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 11L12 8L19.5 11" opacity="0.7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V20" opacity="0.5" />
  </svg>
);

export const MalikLogo = BayanLogo;

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0c0 .621-.504 1.125-1.125 1.125h-9c-.621 0-1.125-.504-1.125-1.125v0c0-.212.03-.418.084-.612m7.332 0c.046-.499-.088-1.011-.421-1.422M8.167 3.888c-.333.411-.467.923-.421 1.422m8.587 0a2.25 2.25 0 011.5 2.25v13.5a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V6.138a2.25 2.25 0 011.5-2.25m0 0a2.25 2.25 0 012.25-2.25h.75" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

export const LoginIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export const QuranIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </svg>
);

export const HadithIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
    <path d="M11 8a3 3 0 00-3 3" strokeLinecap="round" opacity="0.3" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

export const CompassIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
  </svg>
);

export const ToolsIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5L14.5 9H9.5L12 4.5ZM12 19.5L9.5 15H14.5L12 19.5ZM4.5 12L9 9.5V14.5L4.5 12ZM19.5 12L15 14.5V9.5L19.5 12ZM12 9.5L14.5 12L12 14.5L9.5 12L12 9.5Z" />
  </svg>
);

export const CharityIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const UndoIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const RedoIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
  </svg>
);

export const LibraryIcon = BookOpenIcon;

export const GalleryIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

export const SpeakerIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

export const AdviceIcon: React.FC<IconProps> = ({ className }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);
