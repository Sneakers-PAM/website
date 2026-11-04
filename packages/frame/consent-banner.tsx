/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { ReactNode } from "react";

// The cookie choice, in the frame's style: a small bar at the bottom of the
// page with Accept and Decline. It shows only when a site's consent store is
// asking (a visitor used a setting's switch before answering), so readers
// who never touch one never see it. Plain classes from site-frame.css, no
// framework beyond React.

export const ConsentBanner = ({
  onAccept,
  onDecline,
  children,
}: {
  onAccept: () => void;
  onDecline: () => void;
  children?: ReactNode;
}) => (
  <div aria-label="Cookie choice" className="frame-consent" role="region">
    <p className="frame-consent__text">
      {children ?? (
        <>
          Can this site remember your settings, such as the theme, on this device? They&apos;re kept
          in your browser&apos;s storage and used for nothing else: no tracking, no analytics.
        </>
      )}
    </p>
    <div className="frame-consent__actions">
      <button className="frame-consent__button" onClick={onDecline} type="button">
        Decline
      </button>
      <button
        className="frame-consent__button frame-consent__button--primary"
        onClick={onAccept}
        type="button"
      >
        Accept
      </button>
    </div>
  </div>
);
