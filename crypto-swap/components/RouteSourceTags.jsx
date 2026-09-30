'use client';

export default function RouteSourceTags({ route }) {
  if (!route) return null;
  return (
    <div className="route-source-tags">
      <span className="engine-tag">{route.engineName}</span>
      {route.simulated && <span className="est-tag">Est.</span>}
      {(route.dexSources || []).map((d) => (
        <span className="dex-tag" key={d}>{d}</span>
      ))}
      {route.bridgeName && <span className="bridge-tag">{route.bridgeName}</span>}
    </div>
  );
}
