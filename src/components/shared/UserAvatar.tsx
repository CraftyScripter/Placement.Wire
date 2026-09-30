'use client';

import React, { useEffect, useState } from 'react';

interface UserAvatarProps {
  name: string;
  picture?: string | null;
  className?: string;
}

/**
 * Gmail-style avatar: photo when it loads, initial letter otherwise.
 * A dead picture URL (no Google photo, expired lh3 link) falls back to the
 * initial instead of showing a broken-image icon.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ name, picture, className = '' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [picture]);

  const initial = (name?.trim().charAt(0) || '?').toUpperCase();
  const showImg = Boolean(picture) && !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full ${className}`}
      role="img"
      aria-label={name}
    >
      {showImg ? (
        <img
          src={picture as string}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </div>
  );
};
