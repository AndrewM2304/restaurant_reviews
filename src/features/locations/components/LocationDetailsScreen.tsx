'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SmileyIcon } from '@/vendor/phosphor/react';

import type { VisitPhoto } from '@/core/domain/types';
import { useLocationDetailsPage } from '@/features/locations/hooks/useLocationDetailsPage';
import styles from '@/app/visits/visits.module.css';

const placeholderImage = (storagePath: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#134e4a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="400" height="240" fill="url(#bg)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="18" fill="white" font-family="Arial, sans-serif">${storagePath}</text></svg>`)}`;

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

export function LocationDetailsScreen() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get('id') ?? '';
  const { viewData } = useLocationDetailsPage(locationId);
  const [modalPhotos, setModalPhotos] = useState<VisitPhoto[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalTouchStartX, setModalTouchStartX] = useState<number | null>(null);

  const modalPhoto = modalPhotos[modalIndex];

  const cycle = (photos: VisitPhoto[], current: number, direction: 1 | -1) => {
    if (!photos.length) return 0;
    return (current + direction + photos.length) % photos.length;
  };

  const openGallery = (photos: VisitPhoto[], index: number) => {
    if (!photos.length) return;
    setModalPhotos(photos);
    setModalIndex(index);
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

  const restaurantName = viewData.restaurant?.name;

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

      <div className={styles.visitList}>
        {viewData.visits.map(({ visit, items, photos }, visitIndex) => (
          <article key={visit.id} className={styles.visitCard}>
            <div className={styles.visitHeader}>
              <div className={styles.visitAvatar}>{getInitials(restaurantName)}</div>
              <div>
                <h2 className={styles.visitTitle}>{restaurantName}</h2>
                <p className={styles.visitHeaderMeta}>
                  {visit.visitDate} · <SmileyIcon weight="light" aria-hidden="true" /> {visit.overallThumb}
                </p>
              </div>
            </div>

            <div className={styles.visitMeta}>
              {visit.notes ? <p>{visit.notes}</p> : null}
              {items.length ? (
                <ul className={styles.itemList}>
                  {items.map((item) => (
                    <li key={item.id}>
                      {item.name} · <SmileyIcon weight="light" aria-hidden="true" /> {item.thumb}
                    </li>
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
        <div className={styles.fullscreenGallery} onClick={() => setModalPhotos([])}>
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
            <button
              type="button"
              className={styles.fullscreenCloseButton}
              onClick={() => setModalPhotos([])}
              aria-label="Close full screen gallery"
            >
              ×
            </button>
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
