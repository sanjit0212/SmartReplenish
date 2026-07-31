import React from 'react';

const Card = ({ children, className = '', title, action, onClick, style }) => {
  return (
    <div className={`card glass-panel ${className}`} onClick={onClick} style={style}>
      {(title || action) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
