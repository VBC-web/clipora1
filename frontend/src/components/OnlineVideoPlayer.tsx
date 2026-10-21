import { useState } from 'react';
import { Play, RotateCcw, Volume2, Maximize, Eye } from 'lucide-react';

interface OnlineVideoPlayerProps {
  title: string;
  thumbnail?: string;
  durationFormatted?: string;
  provider: string;
  embedUrl?: string;
  streamUrl?: string;
  apiBase: string;
}

export function OnlineVideoPlayer({
  title,
  thumbnail,
  durationFormatted,
  provider,
  embedUrl,
  streamUrl,
  apiBase
}: OnlineVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Determine streaming source
  const proxyStreamUrl = streamUrl
    ? `${apiBase}/api/stream?url=${encodeURIComponent(streamUrl)}`
    : undefined;

  const startPlaying = () => {
    setHasError(false);
    setIsPlaying(true);
  };

  return (
    <div className="online-player-container">
      <div className="player-header-bar">
        <div className="player-header-left">
          <span className="live-player-dot" />
          <span className="player-header-title">Online Video Player</span>
          <span className="player-provider-badge">{provider.toUpperCase()}</span>
        </div>

        {isPlaying && (
          <button
            type="button"
            className="player-switch-view-btn"
            onClick={() => setIsPlaying(false)}
            title="Switch back to poster preview"
          >
            <RotateCcw size={13} /> Reset Player
          </button>
        )}
      </div>

      <div className="player-screen-wrap">
        {!isPlaying ? (
          // POSTER & PLAY TRIGGER OVERLAY
          <div className="player-poster-wrapper" onClick={startPlaying}>
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="player-poster-img" />
            ) : (
              <div className="player-poster-placeholder" />
            )}

            <div className="player-overlay-gradient" />

            <div className="player-center-action">
              <button
                type="button"
                className="big-play-trigger-btn"
                aria-label={`Play ${title} online`}
                onClick={startPlaying}
              >
                <Play size={28} fill="currentColor" className="play-triangle" />
              </button>
              <span className="play-hint-text">Click to Play Online Video</span>
            </div>

            <div className="player-bottom-meta">
              <span className="player-duration-pill">
                {durationFormatted || 'Video Preview'}
              </span>
              <span className="player-ready-pill">
                <Eye size={12} /> Ready to stream
              </span>
            </div>
          </div>
        ) : (
          // ACTIVE VIDEO PLAYER
          <div className="active-player-wrapper">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={title}
                className="responsive-video-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : streamUrl ? (
              <video
                controls
                autoPlay
                playsInline
                poster={thumbnail}
                className="responsive-html5-video"
                onError={() => setHasError(true)}
              >
                {/* Try direct stream first */}
                <source src={streamUrl} type="video/mp4" />
                {/* Fallback to server streaming proxy */}
                {proxyStreamUrl && <source src={proxyStreamUrl} type="video/mp4" />}
                Your browser does not support HTML5 video playback.
              </video>
            ) : (
              <div className="player-fallback-card">
                <Volume2 size={32} />
                <p>Direct video preview stream is not supported for this specific link.</p>
                <p className="fallback-sub">Please select one of the high-quality MP4 download options below.</p>
                <button
                  type="button"
                  className="player-switch-view-btn"
                  onClick={() => setIsPlaying(false)}
                >
                  <RotateCcw size={14} /> Back to Preview
                </button>
              </div>
            )}

            {hasError && (
              <div className="player-error-overlay">
                <p>Could not stream this video directly due to host restrictions.</p>
                <small>Use the download options below to save and play the file locally.</small>
                <button
                  type="button"
                  className="player-switch-view-btn"
                  onClick={() => setIsPlaying(false)}
                >
                  Return to Preview
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="player-footer-info">
        <p className="player-video-title">{title}</p>
        <div className="player-controls-note">
          <span><Maximize size={12} /> Fullscreen supported</span>
          <span>•</span>
          <span>No plugins needed</span>
        </div>
      </div>
    </div>
  );
}
