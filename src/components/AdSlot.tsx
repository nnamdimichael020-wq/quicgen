export type AdSlotPlacement = 'tool-below' | 'tool-inline' | 'content-inline';
export type AdSlotVariant = 'leaderboard' | 'rectangle' | 'inline';

type AdSlotProps = {
  /** Stable id an ad network can target when one is added later. */
  placement: AdSlotPlacement;
  /** Controls the reserved height of the zone. */
  variant?: AdSlotVariant;
};

/**
 * A clearly-labelled, reserved ad placement zone.
 *
 * No ad network, iframe or tracking pixel is loaded here — the markup and
 * spacing simply reserve room so AdSense / EthicalAds / Carbon can be dropped
 * in later without shifting the page or crowding the tool UI. Tool input never
 * reaches this region: all processing stays client-side.
 */
export default function AdSlot({ placement, variant = 'leaderboard' }: AdSlotProps) {
  return (
    <aside className={`ad-slot ad-slot-${variant}`} aria-label="Advertisement" data-ad-placement={placement}>
      <span className="ad-slot-label">Advertisement</span>
      <div className="ad-slot-frame" data-ad-slot={placement}>
        <p>Reserved for a privacy-respecting ad. QuicGen’s tools stay free — and nothing here can see what you type.</p>
      </div>
    </aside>
  );
}
