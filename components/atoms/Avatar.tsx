import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md';
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  return (
    <img 
        src={user.avatarUrl} 
        alt={user.name} 
        className={`${sizeClass} rounded-full border-2 border-white ring-1 ring-slate-200`}
        title={user.name}
    />
  );
};