
import React from 'react';
import { FlowerIcon } from '../constants';

const FlowerDecoration: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      <FlowerIcon className="absolute -top-10 -left-10 w-40 h-40 text-pink-300 flower-spin" />
      <FlowerIcon className="absolute top-1/4 -right-10 w-32 h-32 text-yellow-200 flower-spin" style={{ animationDirection: 'reverse' }} />
      <FlowerIcon className="absolute bottom-1/4 -left-10 w-24 h-24 text-blue-200 flower-spin" />
      <FlowerIcon className="absolute -bottom-10 right-1/4 w-48 h-48 text-purple-200 flower-spin" />
    </div>
  );
};

export default FlowerDecoration;
