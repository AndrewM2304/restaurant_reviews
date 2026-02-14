import { Suspense } from 'react';

import { LocationDetailsScreen } from '@/features/locations/components/LocationDetailsScreen';

export default function LocationPage() {
  return (
    <Suspense fallback={<p>Loading location...</p>}>
      <LocationDetailsScreen />
    </Suspense>
  );
}
