import type { ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon, SmileyIcon, SmileyMehIcon, SmileySadIcon } from '@/vendor/phosphor/react';

import type { DraftPhoto } from '@/features/visits/models/visitDraft';
import styles from '@/app/visits/visits.module.css';

interface AddVisitModalProps {
  open: boolean;
  message: string;
  savedLocationNames: { id: string; name: string }[];
  locationName: string;
  visitDate: string;
  overallRating: number;
  notes: string;
  itemName: string;
  items: { name: string }[];
  photos: DraftPhoto[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onLocationNameChange: (value: string) => void;
  onVisitDateChange: (value: string) => void;
  onOverallRatingChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onItemNameChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onAddPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoLoaded: (photoId: string) => void;
  onRemovePhoto: (photoId: string) => void;
}

export function AddVisitModal({
  open,
  message,
  savedLocationNames,
  locationName,
  visitDate,
  overallRating,
  notes,
  itemName,
  items,
  photos,
  onClose,
  onSubmit,
  onLocationNameChange,
  onVisitDateChange,
  onOverallRatingChange,
  onNotesChange,
  onItemNameChange,
  onAddItem,
  onRemoveItem,
  onAddPhoto,
  onPhotoLoaded,
  onRemovePhoto,
}: AddVisitModalProps) {
  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h3 className="app-heading-3">Add visit</h3>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.formBody}>
            <input
              list="saved-locations"
              placeholder="Search or type location"
              value={locationName}
              onChange={(event) => onLocationNameChange(event.target.value)}
              required
            />
            <datalist id="saved-locations">
              {savedLocationNames.map((restaurant) => (
                <option value={restaurant.name} key={restaurant.id} />
              ))}
            </datalist>

            <input type="date" value={visitDate} onChange={(event) => onVisitDateChange(event.target.value)} required />

            <div className={styles.scaleField}>
              <label htmlFor="overall-scale">Rating</label>
              <div className={styles.scaleLabels}>
                <button
                  type="button"
                  className={`${styles.scaleIconButton} ${styles.scaleLabelStart}`}
                  onClick={() => onOverallRatingChange(0)}
                  aria-label="Set rating to sad"
                >
                  <SmileySadIcon weight={overallRating === 0 ? 'duotone' : 'light'} />
                </button>
                <button
                  type="button"
                  className={`${styles.scaleIconButton} ${styles.scaleLabelCenter}`}
                  onClick={() => onOverallRatingChange(2)}
                  aria-label="Set rating to neutral"
                >
                  <SmileyMehIcon weight={overallRating === 2 ? 'duotone' : 'light'} />
                </button>
                <button
                  type="button"
                  className={`${styles.scaleIconButton} ${styles.scaleLabelEnd}`}
                  onClick={() => onOverallRatingChange(4)}
                  aria-label="Set rating to happy"
                >
                  <SmileyIcon weight={overallRating === 4 ? 'duotone' : 'light'} />
                </button>
              </div>
              <input
                id="overall-scale"
                type="range"
                min={0}
                max={4}
                step={1}
                value={overallRating}
                onChange={(event) => onOverallRatingChange(Number(event.target.value))}
              />
            </div>

            <textarea placeholder="Visit notes (optional)" value={notes} onChange={(event) => onNotesChange(event.target.value)} />

            <div className={styles.itemEditor}>
              <h4 className="app-heading-4">Items</h4>
              <div className={styles.itemRow}>
                <input placeholder="Item" value={itemName} onChange={(event) => onItemNameChange(event.target.value)} />
                <button type="button" className={`${styles.iconButton} ${styles.primaryButton}`} onClick={onAddItem}>
                  <PlusIcon />
                </button>
              </div>

              <ul className={styles.list}>
                {items.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.secondaryButton}`}
                      onClick={() => onRemoveItem(index)}
                    >
                      <MinusIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.itemEditor}>
              <h4 className="app-heading-4">Photos</h4>
              <div className={styles.photoUploadRow}>
                <input
                  id="visit-photo-upload"
                  className={styles.visuallyHidden}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onAddPhoto}
                  aria-label="Choose photo from your device"
                />
                <label htmlFor="visit-photo-upload" className={`${styles.secondaryButton} ${styles.uploadButton}`}>
                  Upload photos
                </label>
              </div>

              <ul className={`${styles.list} ${styles.photoList}`}>
                {photos.map((photo) => (
                  <li key={photo.id} className={photo.isLoading ? styles.photoLoadingItem : ''}>
                    <Image
                      src={photo.previewUrl}
                      alt={photo.storagePath}
                      className={styles.photoPreview}
                      width={320}
                      height={320}
                      unoptimized
                      onLoad={() => onPhotoLoaded(photo.id)}
                      onError={() => onPhotoLoaded(photo.id)}
                    />
                    {photo.isLoading ? <span className={styles.photoLoadingOverlay}>Loading preview…</span> : null}
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.removePhotoButton}`}
                      onClick={() => onRemovePhoto(photo.id)}
                    >
                      <MinusIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.formFooter}>
            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton}>
                Save visit
              </button>
            </div>
            {message ? <p className={styles.message}>{message}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
