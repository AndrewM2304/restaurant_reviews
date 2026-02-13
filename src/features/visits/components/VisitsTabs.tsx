import type { TabKey } from '@/features/visits/models/visitDraft';
import styles from '@/app/visits/visits.module.css';

interface VisitsTabsProps {
  tab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function VisitsTabs({ tab, onChange }: VisitsTabsProps) {
  return (
    <div className={styles.tabs}>
      <span className={`${styles.tabThumb} ${tab === 'wishlist' ? styles.thumbRight : ''}`} aria-hidden="true" />
      <button
        className={`${styles.tab} ${tab === 'locations' ? styles.activeTab : ''}`}
        onClick={() => onChange('locations')}
        type="button"
      >
        Locations
      </button>
      <button
        className={`${styles.tab} ${tab === 'wishlist' ? styles.activeTab : ''}`}
        onClick={() => onChange('wishlist')}
        type="button"
      >
        Wish list
      </button>
    </div>
  );
}
