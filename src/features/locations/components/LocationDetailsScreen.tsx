'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { VisitPhoto } from '@/core/domain/types';
import { useLocationDetailsPage } from '@/features/locations/hooks/useLocationDetailsPage';
import styles from '@/app/visits/visits.module.css';
import { SmileyIcon, SmileyMehIcon, SmileySadIcon } from '@/vendor/phosphor/react';

const getVisitReactionIcon = (thumb: 'up' | 'neutral' | 'down') => {
  if (thumb === 'up') return <SmileyIcon weight="light" aria-label="happy rating" />;
  if (thumb === 'down') return <SmileySadIcon weight="light" aria-label="sad rating" />;
  return <SmileyMehIcon weight="light" aria-label="neutral rating" />;
};

const placeholderImage = (storagePath: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#134e4a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="400" height="240" fill="url(#bg)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="18" fill="white" font-family="Arial, sans-serif">${storagePath}</text></svg>`)}`;

export function LocationDetailsScreen() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get('id') ?? '';
  const { viewData } = useLocationDetailsPage(locationId);
  const [modalPhotos, setModalPhotos] = useState<VisitPhoto[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
  const fullscreenRailRef = useRef<HTMLDivElement | null>(null);

  const modalPhoto = modalPhotos[modalIndex];

  useEffect(() => {
    if (!modalPhoto) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalPhoto]);

  useEffect(() => {
    if (!modalPhoto || !fullscreenRailRef.current) return;

    const rail = fullscreenRailRef.current;
    rail.scrollTo({ left: rail.clientWidth * modalIndex, behavior: 'auto' });
  }, [modalIndex, modalPhoto]);

  const openGallery = (photos: VisitPhoto[], index: number) => {
    if (!photos.length) return;
    setModalPhotos(photos);
    setModalIndex(index);
  };

  const closeGallery = useCallback(() => {
    setModalPhotos([]);
    setModalIndex(0);
  }, []);

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

  const restaurantName = viewData.restaurant.name;

  if (!restaurantName) {
    return (
      <section>
        <p>{viewData.error || 'Location details unavailable.'}</p>
        <Link href="/">Back to Home Screen</Link>
      </section>
    );
  }

  return (
    <section className={styles.detailsPage}>
      <header className={styles.detailsTopNav}>
        <Link href="/" className={styles.topNavBackButton}>
          ‹
        </Link>
        <h1>{restaurantName}</h1>
      </header>

      <div className={`${styles.visitList} ${viewData.visits.length > 1 ? styles.visitListMulti : ''}`}>
        {viewData.visits.map(({ visit, items, photos }, visitIndex) => (
          <article key={visit.id} className={styles.visitCard}>
            <div className={styles.visitHeaderMeta}>
              <p className={styles.visitHeaderDate}>{visit.visitDate}</p>
              <p className={styles.visitHeaderRatingRow}>
                <span className={styles.visitHeaderRatingIcon}>{getVisitReactionIcon(visit.overallThumb)}</span>
              </p>
            </div>

            <div className={styles.visitMeta}>
              {visit.notes ? <p>{visit.notes}</p> : null}
              {items.length ? (
                <ul className={styles.itemList}>
                  {items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              ) : null}
              {photos.length ? (
                <ul className={styles.photoRail}>
                  {photos.map((photo, photoIndex) => (
                    <li key={photo.id}>
                      <button
                        type="button"
                        className={styles.photoRailButton}
                        onClick={() => openGallery(photos, photoIndex)}
                        aria-label={`Open photo ${photoIndex + 1} from visit ${visitIndex + 1}`}
                      >
                        <Image
                          src={placeholderImage(photo.storagePath)}
                          alt={photo.storagePath}
                          className={styles.photoRailImage}
                          width={220}
                          height={160}
                          unoptimized
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
        {!viewData.visits.length ? <p>No visits for this location yet.</p> : null}
      </div>

      {modalPhoto ? (
        <div className={styles.fullscreenGallery} onClick={closeGallery}>
          <div className={styles.fullscreenGalleryInner} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.fullscreenCloseButton}
              onClick={closeGallery}
              aria-label="Close full screen gallery"
            >
              ×
            </button>
            <div
              className={styles.fullscreenPhotoRail}
              ref={fullscreenRailRef}
              onScroll={(event) => {
                const target = event.currentTarget;
                if (!target.clientWidth) return;
                const nextIndex = Math.round(target.scrollLeft / target.clientWidth);
                if (nextIndex !== modalIndex && nextIndex >= 0 && nextIndex < modalPhotos.length) {
                  setModalIndex(nextIndex);
                }
              }}
            >
              {modalPhotos.map((photo) => (
                <div key={photo.id} className={styles.fullscreenPhotoSlide}>
                  <Image
                    src={placeholderImage(photo.storagePath)}
                    alt={photo.storagePath}
                    className={styles.fullscreenPhoto}
                    width={980}
                    height={700}
                    unoptimized
                  />
                </div>
              ))}
            </div>
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
