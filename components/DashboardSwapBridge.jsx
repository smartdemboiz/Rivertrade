"use client";

import { useState } from "react";
import SwapBridge from "@/components/SwapBridge";

export default function DashboardSwapBridge() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {!isOpen && (
        <section className="dashboard-section-view" aria-labelledby="dashboard-swapbridge-title">
          <div className="dashboard-section-view-head">
            <div>
              <p className="eyebrow">RiverTrade account</p>
              <h2 id="dashboard-swapbridge-title">Swapbridge</h2>
              <p>Compare routes and swap supported assets across chains.</p>
            </div>
            <button className="button" type="button" onClick={() => setIsOpen(true)}>
              Open Swapbridge
            </button>
          </div>
        </section>
      )}
      {isOpen && <SwapBridge mode="Swapbridge" onClose={() => setIsOpen(false)} />}
    </>
  );
}
