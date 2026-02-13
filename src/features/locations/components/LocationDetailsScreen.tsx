'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { VisitPhoto } from '@/core/domain/types';
import { useLocationDetailsPage } from '@/features/locations/hooks/useLocationDetailsPage';
import styles from '@/app/visits/visits.module.css';

const ratingLabel: Record<'up' | 'neutral' | 'down' | 'none', string> = {
  up: 'Positive',
  neutral: 'Mixed',
  down: 'Negative',
  none: 'No rating yet',
};

const placeholderImage = (storagePath: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#134e4a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="400" height="240" fill="url(#bg)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="18" fill="white" font-family="Arial, sans-serif">${storagePath}</text></svg>`)}`;

export function LocationDetailsScreen() {
  const [locationId, setLocationId] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    setLocationId(hash.get('id') ?? '');
  }, []);

  const { viewData } = useLocationDetailsPage(locationId);
  const allPhotos = useMemo(() => viewData.visits.flatMap((entry) => entry.photos), [viewData.visits]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (viewData.isLoading) {
    return <p>Loading location...</p>;
  }

  if (!viewData.restaurant) {
    return (
      <section>
        <p>{viewData.error}</p>
        <Link href="/">Back to Home Screen</Link>
      </section>
    );
  }

  const currentPhoto = allPhotos[activePhotoIndex];

  return (
    <section className={styles.detailsPage}>
      <Link href="/" className={styles.backLink}>
        ← Back to Home Screen
      </Link>

      <div className={styles.photoCarousel}>
        {currentPhoto ? (
          <Image src={placeholderImage(currentPhoto.storagePath)} alt={currentPhoto.storagePath} className={styles.heroPhoto} width={400} height={240} unoptimized />
        ) : (
          <div className={styles.photoFallback}>No photos yet</div>
        )}
        {allPhotos.length > 1 ? (
          <>
            <button
              type="button"
              className={styles.carouselButton}
              onClick={() => setActivePhotoIndex((current) => (current === 0 ? allPhotos.length - 1 : current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.carouselButton}
              onClick={() => setActivePhotoIndex((current) => (current + 1) % allPhotos.length)}
            >
              Next
            </button>
          </>
        ) : null}
        {allPhotos.length > 1 ? (
          <div className={styles.photoPagination}>
            {allPhotos.map((photo: VisitPhoto, index) => (
              <button
                key={photo.id}
                type="button"
                className={index === activePhotoIndex ? styles.activeDot : styles.dot}
                onClick={() => setActivePhotoIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <article className={styles.detailsSummary}>
        <h1 className="app-heading-2">{viewData.restaurant.name}</h1>
        <p>Visits: {viewData.visits.length}</p>
        <p>Rating: {ratingLabel[viewData.overallRating]}</p>
      </article>

      <div className={styles.visitList}>
        {viewData.visits.map(({ visit, items, photos }) => (
          <article key={visit.id} className={styles.visitCard}>
            <h2 className="app-heading-4">{visit.visitDate}</h2>
            <p>Overall: {ratingLabel[visit.overallThumb]}</p>
            {visit.notes ? <p>Notes: {visit.notes}</p> : null}
            <p>Items: {items.length}</p>
            {items.length ? (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            ) : null}
            <p>Photos: {photos.length}</p>
            {photos.length ? (
              <div className={styles.inlinePhotos}>
                {photos.map((photo) => (
                  <Image
                    key={photo.id}
                    src={placeholderImage(photo.storagePath)}
                    alt={photo.storagePath}
                    className={styles.inlinePhoto}
                    width={160}
                    height={160}
                    unoptimized
                  />
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {!viewData.visits.length ? <p>No visits for this location yet.</p> : null}
      </div>
    </section>
  );
}
