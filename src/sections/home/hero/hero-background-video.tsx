import type { Theme, SxProps } from '@mui/material/styles';

import { useRef, useState, useEffect } from 'react';

import { Box } from '@mui/material';

type Props = { src: string; fallbackSrc: string; poster?: string; sx: SxProps<Theme>; retryOnInteraction?: boolean };

export function HeroBackgroundVideo({ src, fallbackSrc, poster, sx, retryOnInteraction = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  const activeSrc = failedSrc === src ? fallbackSrc : src;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const play = () => {
      if (document.visibilityState !== 'visible' || !video.paused) return;
      // Set the DOM property before play, including after a CMS source change.
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {
        // The poster remains visible if the browser prevents autoplay.
      });
    };
    play();
    video.addEventListener('canplay', play);
    document.addEventListener('visibilitychange', play);
    if (retryOnInteraction) {
      document.addEventListener('pointerdown', play);
      document.addEventListener('keydown', play);
      window.addEventListener('pageshow', play);
    }
    return () => {
      video.removeEventListener('canplay', play);
      document.removeEventListener('visibilitychange', play);
      if (retryOnInteraction) {
        document.removeEventListener('pointerdown', play);
        document.removeEventListener('keydown', play);
        window.removeEventListener('pageshow', play);
      }
    };
  }, [activeSrc, retryOnInteraction]);

  return (
    <Box
      ref={videoRef}
      component="video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      src={activeSrc}
      onError={() => setFailedSrc(src)}
      sx={sx}
    />
  );
}
