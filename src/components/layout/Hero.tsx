import React from 'react';
import { Button } from '@/components/ui/Button';

interface HeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  title = "Welcome to SultanStore",
  subtitle = "Discover amazing products at unbeatable prices",
  buttonText = "Shop Now",
  onButtonClick,
}) => {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl mb-8">{subtitle}</p>
          <Button
            variant="secondary"
            size="lg"
            onClick={onButtonClick}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
};
