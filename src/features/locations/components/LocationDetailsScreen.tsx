'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { VisitPhoto } from '@/core/domain/types';
import { useLocationDetailsPage } from '@/features/locations/hooks/useLocationDetailsPage';
import styles from '@/app/visits/visits.module.css';

const ratingEmoji: Record<'up' | 'neutral' | 'down' | 'none', string> = {
  up: '😊',
  neutral: '😐',
  down: '☹️',
  none: '🙂',
};

const placeholderImage = (storagePath: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#134e4a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="400" height="240" fill="url(#bg)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="18" fill="white" font-family="Arial, sans-serif">${storagePath}</text></svg>`)}`;

type GalleryMode = 'all' | 'visit';

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [galleryMode, setGalleryMode] = useState<GalleryMode | null>(null);
  const [modalPhotos, setModalPhotos] = useState<VisitPhoto[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalTouchStartX, setModalTouchStartX] = useState<number | null>(null);

  const currentPhoto = allPhotos[activePhotoIndex];
  const modalPhoto = modalPhotos[modalIndex];

  const cycle = (photos: VisitPhoto[], current: number, direction: 1 | -1) => {
    if (!photos.length) return 0;
    return (current + direction + photos.length) % photos.length;
  };

  const openGallery = (photos: VisitPhoto[], index: number, mode: GalleryMode) => {
    if (!photos.length) return;
    setModalPhotos(photos);
    setModalIndex(index);
    setGalleryMode(mode);
  };

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

  return (
    <section className={styles.detailsPage}>
      <Link href="/" className={styles.backLink}>
        ← Back to Home Screen
      </Link>

      <div className={styles.photoCarousel}>
        {currentPhoto ? (
          <button
            type="button"
            className={styles.heroPhotoButton}
            onClick={() => openGallery(allPhotos, activePhotoIndex, 'all')}
            onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
              if (touchStartX === null) return;
              const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
              if (Math.abs(delta) > 30) {
                setActivePhotoIndex((current) => cycle(allPhotos, current, delta < 0 ? 1 : -1));
              }
              setTouchStartX(null);
            }}
            aria-label="Open full screen image gallery"
          >
            <Image src={placeholderImage(currentPhoto.storagePath)} alt={currentPhoto.storagePath} className={styles.heroPhoto} width={430} height={320} unoptimized />
          </button>
        ) : (
          <div className={styles.photoFallback}>No photos yet</div>
        )}
        {allPhotos.length > 1 ? (
          <div className={styles.photoPaginationOverlay}>
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

      <article className={styles.detailsSummaryCard}>
        <h1>{viewData.restaurant.name}</h1>
        <p>
          {ratingEmoji[viewData.overallRating]} · {viewData.visits.length} visits
        </p>
      </article>

      <p className={styles.totalVisits}>Visits ({viewData.visits.length})</p>

      <div className={styles.visitList}>
        {viewData.visits.map(({ visit, items, photos }) => (
          <article key={visit.id} className={styles.visitCard}>
            <button
              type="button"
              className={styles.visitPhotoStack}
              onClick={() => openGallery(photos, 0, 'visit')}
              disabled={!photos.length}
              aria-label={`Open photos from visit on ${visit.visitDate}`}
            >
              {photos.length ? (
                <>
                  <Image
                    src={placeholderImage(photos[0].storagePath)}
                    alt={photos[0].storagePath}
                    className={styles.visitTopPhoto}
                    width={120}
                    height={120}
                    unoptimized
                  />
                  {photos.slice(1, 4).map((photo, index) => (
                    <Image
                      key={photo.id}
                      src={placeholderImage(photo.storagePath)}
                      alt={photo.storagePath}
                      className={styles.visitOffsetPhoto}
                      style={{ transform: `translate(${(index + 1) * 8}px, ${(index + 1) * 8}px)` }}
                      width={120}
                      height={120}
                      unoptimized
                    />
                  ))}
                </>
              ) : (
                <span className={styles.photoStackFallback}>No photos</span>
              )}
            </button>

            <div className={styles.visitMeta}>
              <h2 className="app-heading-4">{visit.visitDate}</h2>
              <p>
                {ratingEmoji[visit.overallThumb]} {visit.overallThumb}
              </p>
              <p>Items: {items.length}</p>
              <p>Photos: {photos.length}</p>
              {visit.notes ? <p>Notes: {visit.notes}</p> : null}
            </div>
          </article>
        ))}
        {!viewData.visits.length ? <p>No visits for this location yet.</p> : null}
      </div>

      {galleryMode && modalPhoto ? (
        <div className={styles.fullscreenGallery} onClick={() => setGalleryMode(null)}>
          <div
            className={styles.fullscreenGalleryInner}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setModalTouchStartX(event.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
              if (modalTouchStartX === null) return;
              const delta = (event.changedTouches[0]?.clientX ?? modalTouchStartX) - modalTouchStartX;
              if (Math.abs(delta) > 30) {
                setModalIndex((current) => cycle(modalPhotos, current, delta < 0 ? 1 : -1));
              }
              setModalTouchStartX(null);
            }}
          >
            <Image
              src={placeholderImage(modalPhoto.storagePath)}
              alt={modalPhoto.storagePath}
              className={styles.fullscreenPhoto}
              width={980}
              height={700}
              unoptimized
            />
            {modalPhotos.length > 1 ? (
              <div className={styles.photoPaginationOverlay}>
                {modalPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={index === modalIndex ? styles.activeDot : styles.dot}
                    onClick={() => setModalIndex(index)}
                    aria-label={`Go to full screen image ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
