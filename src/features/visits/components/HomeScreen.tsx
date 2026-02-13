'use client';

import { AddVisitModal } from '@/features/visits/components/AddVisitModal';
import { LocationCards } from '@/features/visits/components/LocationCards';
import { VisitsTabs } from '@/features/visits/components/VisitsTabs';
import { useVisitsPage } from '@/features/visits/hooks/useVisitsPage';
import styles from '@/app/visits/visits.module.css';

export function HomeScreen() {
  const { viewData, actions } = useVisitsPage();

  return (
    <section className={styles.page}>
      <h1 className="app-heading-1">Home Screen</h1>
      <VisitsTabs tab={viewData.tab} onChange={actions.setTab} />

      <input
        className={styles.search}
        placeholder={viewData.tab === 'locations' ? 'Search locations' : 'Search wish list'}
        value={viewData.searchQuery}
        onChange={(event) => actions.setSearchQuery(event.target.value)}
      />

      {viewData.tab === 'locations' ? (
        <LocationCards restaurants={viewData.filteredLocations} emptyMessage="No saved locations yet." showStatus />
      ) : (
        <LocationCards restaurants={viewData.filteredWishlist} emptyMessage="No wish list locations yet." showStatus={false} />
      )}

      <button className={styles.fab} onClick={actions.openModal} aria-label="Add visit">
        +
      </button>

      <AddVisitModal
        open={viewData.showModal}
        message={viewData.message}
        savedLocationNames={viewData.savedLocations}
        locationName={viewData.locationName}
        visitDate={viewData.visitDate}
        overallRating={viewData.overallRating}
        notes={viewData.notes}
        itemName={viewData.itemName}
        items={viewData.items}
        photos={viewData.photos}
        onClose={actions.closeModal}
        onSubmit={actions.submitVisit}
        onLocationNameChange={actions.setLocationName}
        onVisitDateChange={actions.setVisitDate}
        onOverallRatingChange={actions.setOverallRating}
        onNotesChange={actions.setNotes}
        onItemNameChange={actions.setItemName}
        onAddItem={actions.addItem}
        onRemoveItem={actions.removeItem}
        onAddPhoto={actions.addPhotoFromBrowser}
        onPhotoLoaded={actions.markPhotoLoaded}
        onRemovePhoto={actions.removePhoto}
      />
    </section>
  );
}
