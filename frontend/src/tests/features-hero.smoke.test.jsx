import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

describe('Landing sections smoke', () => {
  test('HeroSection renders', () => {
    const { HeroSection } = require('../components/hero-section.jsx');
    render(<HeroSection onGetStarted={() => {}} onViewSampleLog={() => {}} />);
  });
  test('FeaturesSection renders', () => {
    const { FeaturesSection } = require('../components/features-section.jsx');
    render(<FeaturesSection />);
  });
});
