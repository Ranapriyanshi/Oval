import { ImageSourcePropType } from 'react-native';

// Central place to import and name illustration assets so they can be reused
// across the app. Paths are relative to the app's /src/assets directory.

import onboardingWelcomePng from '../assets/Dynamic Snowboarder.png';
import onboardingPlaypalsPng from '../assets/3D Figure Skater.png';
import onboardingGametimePng from '../assets/Cartoon Hockey Player.png';

// Onboarding slides
export const onboardingWelcomeIllustration: ImageSourcePropType = onboardingWelcomePng;
export const onboardingPlaypalsIllustration: ImageSourcePropType = onboardingPlaypalsPng;
export const onboardingGametimeIllustration: ImageSourcePropType = onboardingGametimePng;

// Reusable spot illustrations in the app
export const venuesCardIllustration: ImageSourcePropType = onboardingWelcomePng;
export const venuesEmptyIllustration: ImageSourcePropType = onboardingWelcomePng;
export const matchesEmptyIllustration: ImageSourcePropType = onboardingPlaypalsPng;
export const bookingsEmptyIllustration: ImageSourcePropType = onboardingGametimePng;

