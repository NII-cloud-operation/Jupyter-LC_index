import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';

type Props = {
  label: string;
  onClick?: () => void;
};

export function Header({ label, onClick }: Props) {
  return (
    <div className="lc-index-header">
      <h1>{label}</h1>
      {onClick && (
        <FontAwesomeIcon
          icon={faExternalLink}
          className="lc-index-header-icon"
          onClick={onClick}
        />
      )}
    </div>
  );
}
