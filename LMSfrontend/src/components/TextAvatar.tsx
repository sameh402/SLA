import React from 'react';

interface TextAvatarProps {
  name: string;
  size?: string;
}

export const TextAvatar: React.FC<TextAvatarProps> = ({ name, size = "w-10 h-10" }) => {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className={`${size} rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold`}>
      {initials}
    </div>
  );
};
