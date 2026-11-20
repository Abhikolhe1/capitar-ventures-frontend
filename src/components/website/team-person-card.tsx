import './team-person-card.css';

import type { CSSProperties } from 'react';

import { useId, useState, useEffect } from 'react';

// Original Figma image-fill crops. The downloaded source images remain unmodified.
const portraits: Record<string, { image: string; crop: number[] }> = {
  rahul: {
    image: 'team-source.png',
    crop: [0.2585533857, 0.9314848185, 0.3577046394, 0.0685151741],
  },
  partner: { image: 'team-source.png', crop: [0.2775712311, 1, 0.6674522161, 0.0630528629] },
  bikramjit: {
    image: 'bikramjit-source.png',
    crop: [1.0559339523, 1.0694063902, -0.0279669687, -0.0694063976],
  },
};
export function TeamPersonCard({
  member,
  biography,
  artwork,
}: {
  member: { name: string; role: string; portrait?: string; image?: string; biography?: string; linkedinUrl?: string };
  biography: string;
  artwork: (name: string) => string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const bioId = useId();
  const source = member.image || (member.portrait ? artwork((portraits[member.portrait] || portraits.rahul).image) : undefined);
  useEffect(() => setFailed(false), [source]);
  const {
    crop: [sx, sy, x, y],
  } = portraits[member.portrait || 'rahul'] || portraits.rahul;
  const crop: CSSProperties = {
    width: `${100 / sx}%`,
    height: `${100 / sy}%`,
    left: `${(-100 * x) / sx}%`,
    top: `${(-100 * y) / sy}%`,
  };
  return (
    <article
      className="about-team-card"
      aria-label={`${member.name}, ${member.role}`}
      data-open={expanded}
      data-scroll-reveal="team-card"
    >
      <img
        className="about-team-highlight"
        src={artwork('team-white-highlight.png')}
        alt=""
        loading="lazy"
      />
      <div className="about-team-crop">
        {source && !failed ? <img
          src={source}
          onError={() => setFailed(true)}
          data-cms-portrait={member.image ? '' : undefined}
          style={member.image ? undefined : crop}
          alt={`${member.name}, ${member.role}, Capitar Ventures`}
          loading="lazy"
        /> : <span className="about-team-initials" aria-hidden="true">{member.name.split(/\s+/).map(word => word[0]).slice(0, 2).join('')}</span>}
      </div>
      <img
        className="about-team-shadow"
        src={artwork('team-shadow.png')}
        alt=""
        loading="lazy"
      />
      <img
        className="about-team-shadow about-team-shadow--hover"
        src={artwork('team-navy-shadow.png')}
        alt=""
        loading="lazy"
      />
      <div className="about-team-caption">
        <div className="about-team-identity">
        <button
          type="button"
          className="about-team-toggle"
          aria-label={`About ${member.name}, ${member.role}`}
          aria-expanded={expanded}
          aria-controls={bioId}
          onClick={() => setExpanded(!expanded)}
        >
          <span>
            <span className="about-team-name">{member.name}</span>
            <span className="about-team-role">{member.role}</span>
          </span>
        </button>
        {member.linkedinUrl ? (
          <a data-team-linkedin href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`}>
            <img src={artwork('linkedin.png')} width={18} height={18} alt="" />
          </a>
        ) : (
          <span data-team-linkedin aria-hidden="true"><img src={artwork('linkedin.png')} width={18} height={18} alt="" /></span>
        )}
        </div>
        <div className="about-team-bio" id={bioId}>
          <p>{member.biography || biography}</p>
        </div>
      </div>
    </article>
  );
}
