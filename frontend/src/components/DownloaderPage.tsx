import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Film,
  Globe,
  Headphones,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Menu,
  Music,
  Play,
  Scissors,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
  Zap
} from 'lucide-react';
import { OnlineVideoPlayer } from '../components/OnlineVideoPlayer';
import { ThemeToggle } from '../components/ThemeToggle';
import { PLATFORM_LIST, type PlatformConfig } from '../platforms';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

interface VideoFormat {
  id: string;
  label: string;
  resolution?: string;
  height?: number;
  container: string;
  filesize?: number;
  filesizeFormatted?: string;
  isAudio?: boolean;
  formatNote?: string;
}

interface VideoMetadata {
  provider: string;
  url: string;
  videoId?: string;
  embedUrl?: string;
  streamUrl?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  durationFormatted?: string;
  uploader?: string;
  channel?: string;
  publishedAt?: string;
  captions?: string;
  captionLanguage?: string;
  formats: VideoFormat[];
  audioFormats: VideoFormat[];
  capabilities: {
    metadata: boolean;
    thumbnail: boolean;
    download: boolean;
    trim: boolean;
  };
}

interface DownloadJobState {
  id: string;
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'failed' | 'expired';
  progress: number;
  speed?: string;
  eta?: string;
  title?: string;
  filename?: string;
  filesizeFormatted?: string;
  error?: string;
}

interface DownloaderPageProps {
  platform: PlatformConfig;
}

export function DownloaderPage({ platform }: DownloaderPageProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'trim'>('video');
  const [activeJob, setActiveJob] = useState<DownloadJobState | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const [trimStart, setTrimStart] = useState('00:00:00');
  const [trimEnd, setTrimEnd] = useState('00:00:30');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [platformDropdown, setPlatformDropdown] = useState(false);
  const [copiedText, setCopiedText] = useState<'description' | 'captions' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when switching platforms
  useEffect(() => {
    setUrlError('');
    setDownloadError('');
    inputRef.current?.focus();
  }, [platform.id]);

  // Poll active download job
  useEffect(() => {
    if (!activeJob || ['completed', 'failed', 'expired'].includes(activeJob.status)) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/download/status/${activeJob.id}`);
        const data = await res.json();
        if (res.ok) {
          setActiveJob(data);
          // If just completed, auto-trigger browser download
          if (data.status === 'completed') {
            const downloadUrl = `${API}/api/download/file/${data.id}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = data.filename || 'video.mp4';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          setActiveJob(prev => prev ? { ...prev, status: 'failed', error: data.error } : null);
        }
      } catch {
        // Keep polling
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeJob?.id, activeJob?.status]);

  async function handleAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
    setUrlError('');
    setDownloadError('');
    setActiveJob(null);
    setMetadata(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError('Please paste a video link to download.');
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
      setUrlError('Please enter a valid HTTP or HTTPS video URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not fetch video information. Please verify the URL.');
      }
      setMetadata(data);
      if (data.duration && data.duration > 0) {
        setTrimStart('00:00:00');
        const endSec = Math.min(30, Math.floor(data.duration));
        setTrimEnd(`00:00:${String(endSec).padStart(2, '0')}`);
      }
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Could not reach Clipora server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setUrlError('');
        inputRef.current?.focus();
      }
    } catch {
      setUrlError('Clipboard permission blocked. Please paste directly into the box.');
    }
  }

  async function copyMetadataText(text: string, type: 'description' | 'captions') {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      window.setTimeout(() => setCopiedText(current => current === type ? null : current), 1800);
    } catch {
      setUrlError('Clipboard permission blocked. Please select and copy the text directly.');
    }
  }

  function handleClear() {
    setUrl('');
    setUrlError('');
    setMetadata(null);
    setActiveJob(null);
    inputRef.current?.focus();
  }

  async function startDownload(formatId: string, quality?: number, isAudio = false, useTrim = false) {
    if (!metadata) return;
    setDownloadError('');
    setActiveJob({
      id: '',
      status: 'downloading',
      progress: 5,
      speed: 'Connecting...',
      title: metadata.title
    });

    try {
      const body: any = {
        url: metadata.url,
        formatId,
        quality,
        audioOnly: isAudio
      };
      if (useTrim) {
        body.start = trimStart;
        body.end = trimEnd;
      }

      const res = await fetch(`${API}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start download process.');
      }

      setActiveJob({
        id: data.id,
        status: data.status,
        progress: data.progress || 5,
        speed: 'Connecting...',
        title: metadata.title
      });
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Could not start download.');
      setActiveJob(null);
    }
  }

  const renderFeatureIcon = (icon: string) => {
    switch (icon) {
      case 'globe': return <Globe size={20} />;
      case 'film': return <Film size={20} />;
      case 'sparkles': return <Sparkles size={20} />;
      case 'music': return <Music size={20} />;
      case 'scissors': return <Scissors size={20} />;
      case 'shield': return <ShieldCheck size={20} />;
      default: return <Zap size={20} />;
    }
  };

  return (
    <div className="app-shell">
      {/* TOPBAR NAVIGATION */}
      <header className="topbar">
        <div className="nav-wrap">
          <a href="/" className="brand" aria-label="Clipora Home">
            <span className="brand-mark">
              <Play size={18} fill="currentColor" />
            </span>
            <span>clipora<span className="brand-dot">.</span></span>
          </a>

          <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main Navigation">
            <a href="/" onClick={() => setMenuOpen(false)}>All Platforms</a>
            <a href="/youtube-video-downloader" onClick={() => setMenuOpen(false)}>YouTube</a>
            <a href="/instagram-video-downloader" onClick={() => setMenuOpen(false)}>Instagram</a>
            <a href="/tiktok-video-downloader" onClick={() => setMenuOpen(false)}>TikTok</a>
            <a href="/twitter-video-downloader" onClick={() => setMenuOpen(false)}>Twitter / X</a>

            <div className="platform-nav-dropdown-wrap">
              <button
                type="button"
                className="dropdown-toggle"
                onClick={() => setPlatformDropdown(!platformDropdown)}
                aria-expanded={platformDropdown}
              >
                More <ChevronDown size={14} />
              </button>
              {platformDropdown && (
                <div className="dropdown-menu">
                  {PLATFORM_LIST.map(p => (
                    <a
                      key={p.id}
                      href={p.path}
                      className={p.id === platform.id ? 'active' : ''}
                      onClick={() => {
                        setPlatformDropdown(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span>{p.name}</span>
                    </a>
                  ))}
                  <span className="dropdown-divider" />
                  <a href="/fair-use" onClick={() => setPlatformDropdown(false)}>Fair Use & Disclaimer</a>
                  <a href="/terms-of-service" onClick={() => setPlatformDropdown(false)}>Terms of Service</a>
                  <a href="/privacy-policy" onClick={() => setPlatformDropdown(false)}>Privacy Policy</a>
                </div>
              )}
            </div>
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO SECTION WITH TOP PROMINENT URL INPUT */}
        <section className="top-hero section-wrap">
          <div className="hero-badge">
            <span className="pulse-indicator" />
            <span>{platform.badge}</span>
          </div>

          <h1 className="hero-title">
            {platform.heroHeadline}<br />
            <span>{platform.heroHighlight}</span>
          </h1>

          <p className="hero-subtitle">
            {platform.heroSub}
          </p>

          {/* THE PROMINENT TOP INPUT BOX - FIRST THING USER SEES */}
          <div className="url-master-card" id="downloader-box">
            <form onSubmit={handleAnalyze} className="url-box-form">
              <div className="url-box-row">
                <Link2 className="url-box-icon" size={22} />
                <input
                  ref={inputRef}
                  id="video-url-input"
                  type="url"
                  className="url-box-input"
                  placeholder={platform.placeholder}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="Video link URL input"
                />

                {url && (
                  <button
                    type="button"
                    className="clear-icon-btn"
                    onClick={handleClear}
                    title="Clear URL"
                    aria-label="Clear URL"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  type="button"
                  className="quick-paste-btn"
                  onClick={handlePaste}
                  title="Paste link from clipboard"
                >
                  Paste
                </button>

                <button
                  type="submit"
                  className="primary-fetch-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="spin" size={18} />
                      <span>Fetching…</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine size={18} />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>

              {urlError && (
                <div className="url-error-alert" role="alert">
                  <span>{urlError}</span>
                </div>
              )}
            </form>

            {/* QUICK PLATFORM SHORTCUT PILLS */}
            <div className="supported-pills-bar">
              <span className="pills-label">Supported sites:</span>
              <div className="pills-scroll">
                {PLATFORM_LIST.map(p => (
                  <a
                    key={p.id}
                    href={p.path}
                    className={`platform-pill ${p.id === platform.id ? 'current' : ''}`}
                  >
                    <span>{p.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS & DOWNLOAD OPTIONS CARD (APPEARS WHEN VIDEO IS INSPECTED) */}
        {(metadata || activeJob || downloadError) && (
          <section className="section-wrap results-section" aria-live="polite">
            {downloadError && (
              <div className="download-error-box" role="alert">
                <span>{downloadError}</span>
              </div>
            )}

            {/* VIDEO METADATA & ONLINE PLAYER CARD */}
            {metadata && (
              <div className="media-ready-card">
                {/* ONLINE VIDEO PLAYER */}
                <OnlineVideoPlayer
                  title={metadata.title}
                  thumbnail={metadata.thumbnail}
                  durationFormatted={metadata.durationFormatted}
                  provider={metadata.provider}
                  embedUrl={metadata.embedUrl}
                  streamUrl={metadata.streamUrl}
                  apiBase={API}
                />

                <div className="media-preview-row">
                  <div className="media-info-column">
                    <span className="provider-tag">{metadata.provider.toUpperCase()}</span>
                    <h2 className="media-title">{metadata.title}</h2>
                    {metadata.uploader && (
                      <p className="media-author">By <strong>{metadata.uploader}</strong></p>
                    )}
                    {metadata.description && (
                      <div className="metadata-copy-section">
                        <div className="metadata-copy-header">
                          <h3>Description</h3>
                          <button type="button" className="metadata-copy-btn" onClick={() => copyMetadataText(metadata.description!, 'description')}>
                            {copiedText === 'description' ? <Check size={15} /> : <Copy size={15} />}
                            {copiedText === 'description' ? 'Copied' : 'Copy description'}
                          </button>
                        </div>
                        <p className="media-desc">{metadata.description}</p>
                      </div>
                    )}
                    <div className="metadata-copy-section">
                      <div className="metadata-copy-header">
                        <h3>{metadata.captionLanguage ? `${metadata.captionLanguage.toUpperCase()} captions` : 'Captions'}</h3>
                        {metadata.captions && (
                          <button type="button" className="metadata-copy-btn" onClick={() => copyMetadataText(metadata.captions!, 'captions')}>
                            {copiedText === 'captions' ? <Check size={15} /> : <Copy size={15} />}
                            {copiedText === 'captions' ? 'Copied' : 'Copy captions'}
                          </button>
                        )}
                      </div>
                      <p className="media-desc">{metadata.captions || 'Captions are not available for this video.'}</p>
                    </div>
                  </div>
                </div>

                {/* FORMAT / QUALITY SELECTION TABS */}
                <div className="format-tabs-wrap">
                  <div className="format-tabs-header">
                    <button
                      type="button"
                      className={`format-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                      onClick={() => setActiveTab('video')}
                    >
                      <Film size={16} /> Video (MP4)
                    </button>
                    <button
                      type="button"
                      className={`format-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
                      onClick={() => setActiveTab('audio')}
                    >
                      <Headphones size={16} /> Audio (MP3)
                    </button>
                    <button
                      type="button"
                      className={`format-tab-btn ${activeTab === 'trim' ? 'active' : ''}`}
                      onClick={() => setActiveTab('trim')}
                    >
                      <Scissors size={16} /> Trim Clip
                    </button>
                  </div>

                  {/* TAB 1: VIDEO QUALITIES */}
                  {activeTab === 'video' && (
                    <div className="tab-content-panel">
                      <div className="formats-grid">
                        {metadata.formats.map(fmt => (
                          <div key={fmt.id} className="format-item-card">
                            <div className="format-left">
                              <span className="format-res-badge">
                                {fmt.resolution || fmt.label}
                              </span>
                              <div className="format-meta-text">
                                <strong>{fmt.label}</strong>
                                <span className="format-ext-pill">MP4</span>
                                {fmt.filesizeFormatted && (
                                  <span className="format-size-text">{fmt.filesizeFormatted}</span>
                                )}
                                {fmt.formatNote && fmt.id !== 'best' && (
                                  <span className="format-size-text">{fmt.formatNote}</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="format-dl-btn"
                              onClick={() => startDownload(fmt.id, fmt.height, false, false)}
                              disabled={Boolean(activeJob && ['downloading', 'processing'].includes(activeJob.status))}
                            >
                              <ArrowDownToLine size={15} /> Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: AUDIO EXTRACT */}
                  {activeTab === 'audio' && (
                    <div className="tab-content-panel">
                      <div className="formats-grid">
                        {metadata.audioFormats.map(afmt => (
                          <div key={afmt.id} className="format-item-card audio-card">
                            <div className="format-left">
                              <span className="format-res-badge audio">
                                <Volume2 size={15} />
                              </span>
                              <div className="format-meta-text">
                                <strong>{afmt.label}</strong>
                                <span className="format-ext-pill">{afmt.container.toUpperCase()}</span>
                                <span className="format-size-text">{afmt.formatNote || 'High Bitrate'}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="format-dl-btn audio"
                              onClick={() => startDownload(afmt.id, undefined, true, false)}
                              disabled={Boolean(activeJob && ['downloading', 'processing'].includes(activeJob.status))}
                            >
                              <ArrowDownToLine size={15} /> Download Audio
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: REMOTE TRIM & DOWNLOAD */}
                  {activeTab === 'trim' && (
                    <div className="tab-content-panel trim-tab-panel">
                      <div className="trim-desc-box">
                        <Scissors size={18} />
                        <p>Download only a specific section of this video without downloading the whole stream.</p>
                      </div>

                      <div className="trim-inputs-grid">
                        <div className="trim-input-group">
                          <label htmlFor="trim-start-field">Start Timestamp</label>
                          <input
                            id="trim-start-field"
                            type="text"
                            value={trimStart}
                            onChange={e => setTrimStart(e.target.value)}
                            placeholder="00:00:00"
                          />
                        </div>

                        <div className="trim-input-group">
                          <label htmlFor="trim-end-field">End Timestamp</label>
                          <input
                            id="trim-end-field"
                            type="text"
                            value={trimEnd}
                            onChange={e => setTrimEnd(e.target.value)}
                            placeholder="00:00:30"
                          />
                        </div>

                        <div className="trim-action-cell">
                          <button
                            type="button"
                            className="primary-fetch-btn trim-btn"
                            onClick={() => startDownload('trim-best', 1080, false, true)}
                            disabled={Boolean(activeJob && ['downloading', 'processing'].includes(activeJob.status))}
                          >
                            <Scissors size={16} /> Cut & Download MP4
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIVE DOWNLOAD PROGRESS TRACKER */}
            {activeJob && (
              <div className="live-job-card" role="status">
                <div className="job-info-row">
                  <div className="job-icon-status">
                    {activeJob.status === 'completed' ? (
                      <span className="job-badge success"><Check size={20} /></span>
                    ) : activeJob.status === 'failed' ? (
                      <span className="job-badge error"><X size={20} /></span>
                    ) : (
                      <span className="job-badge running"><LoaderCircle className="spin" size={20} /></span>
                    )}
                  </div>

                  <div className="job-text-col">
                    <h3 className="job-title">
                      {activeJob.status === 'completed'
                        ? 'Download Ready!'
                        : activeJob.status === 'failed'
                        ? 'Download Failed'
                        : activeJob.status === 'processing'
                        ? 'Finalizing and merging audio/video…'
                        : 'Downloading from source…'}
                    </h3>
                    <p className="job-subtitle">
                      {activeJob.status === 'completed'
                        ? `${activeJob.filename || 'Your file'} has been saved to your downloads folder.`
                        : activeJob.status === 'failed'
                        ? (activeJob.error || 'The platform refused or throttled the connection.')
                        : `Progress: ${activeJob.progress}% ${activeJob.speed ? `· Speed: ${activeJob.speed}` : ''} ${activeJob.eta ? `· ETA: ${activeJob.eta}` : ''}`}
                    </p>
                  </div>

                  {activeJob.status === 'completed' && activeJob.id && (
                    <a
                      href={`${API}/api/download/file/${activeJob.id}`}
                      download={activeJob.filename || 'video.mp4'}
                      className="save-file-btn"
                    >
                      <ArrowDownToLine size={16} /> Save File
                    </a>
                  )}
                </div>

                {/* PROGRESS BAR */}
                {['downloading', 'processing'].includes(activeJob.status) && (
                  <div className="progress-track-bg">
                    <div
                      className="progress-fill-bar"
                      style={{ width: `${Math.max(5, activeJob.progress)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* HOW TO DOWNLOAD STEPS */}
        <section className="section-wrap how-it-works-section" id="how-to-download">
          <div className="section-header-centered">
            <span className="section-tag">STEP BY STEP</span>
            <h2>How to Download {platform.name} Videos</h2>
            <p>Save high-resolution video and audio in 4 quick and easy steps.</p>
          </div>

          <div className="steps-container-grid">
            {platform.howToSteps.map(step => (
              <div key={step.step} className="step-box-card">
                <div className="step-num-pill">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* KEY FEATURES */}
        <section className="features-container-section" id="features">
          <div className="section-wrap">
            <div className="section-header-centered">
              <span className="section-tag">FEATURES</span>
              <h2>Why Use Clipora for {platform.name}?</h2>
              <p>State-of-the-art video extraction with high speeds and zero degradation.</p>
            </div>

            <div className="features-quad-grid">
              {platform.features.map(f => (
                <div key={f.title} className="feature-block-card">
                  <div className="feature-block-icon">
                    {renderFeatureIcon(f.icon)}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUPPORTED PLATFORMS DIRECTORY FOR SEO & INTERNAL LINK EQUITY */}
        <section className="section-wrap platforms-directory-section">
          <div className="section-header-centered">
            <span className="section-tag">SUPPORTED WEBSITES</span>
            <h2>Download Videos from All Major Platforms</h2>
            <p>Explore our specialized video downloaders with platform-specific optimizations.</p>
          </div>

          <div className="platforms-cards-grid">
            {PLATFORM_LIST.map(p => (
              <a
                key={p.id}
                href={p.path}
                className={`platform-directory-card ${p.id === platform.id ? 'active-platform' : ''}`}
              >
                <div className="platform-card-top">
                  <span className="platform-card-symbol">{p.iconSymbol}</span>
                  <ExternalLink size={14} className="card-arrow" />
                </div>
                <h3>{p.name} Downloader</h3>
                <p>{p.badge}</p>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="section-wrap faq-container-section" id="faqs">
          <div className="section-header-centered">
            <span className="section-tag">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Got Questions About {platform.name} Downloads?</h2>
            <p>Everything you need to know about downloading {platform.name} videos safely and freely.</p>
          </div>

          <div className="faq-accordion-list">
            {platform.faqs.map((faq, idx) => (
              <div
                key={faq.question}
                className={`faq-accordion-item ${faqOpen === idx ? 'expanded' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  aria-expanded={faqOpen === idx}
                >
                  <span>{faq.question}</span>
                  {faqOpen === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {faqOpen === idx && (
                  <div className="faq-answer-body">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* RICH SEO FOOTER WITH DEEP INTERNAL LINKS */}
      <footer className="footer-full">
        <div className="section-wrap footer-inner">
          <div className="footer-col brand-col">
            <a href="/" className="brand">
              <span className="brand-mark">
                <Play size={16} fill="currentColor" />
              </span>
              <span>clipora<span className="brand-dot">.</span></span>
            </a>
            <p className="footer-motto">
              The premier free online video downloader. Fast, reliable, and watermark-free video downloads for all platforms.
            </p>
          </div>

          <div className="footer-col">
            <h4>Supported Platforms</h4>
            <ul className="footer-links-list">
              <li><a href="/youtube-video-downloader">YouTube Downloader</a></li>
              <li><a href="/instagram-video-downloader">Instagram Reels Downloader</a></li>
              <li><a href="/tiktok-video-downloader">TikTok Without Watermark</a></li>
              <li><a href="/twitter-video-downloader">Twitter / X Downloader</a></li>
              <li><a href="/facebook-video-downloader">Facebook Video Downloader</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>More Downloaders</h4>
            <ul className="footer-links-list">
              <li><a href="/reddit-video-downloader">Reddit Video Downloader</a></li>
              <li><a href="/vimeo-video-downloader">Vimeo Video Downloader</a></li>
              <li><a href="/twitch-clip-downloader">Twitch Clip Downloader</a></li>
              <li><a href="/pinterest-video-downloader">Pinterest Video Downloader</a></li>
              <li><a href="/threads-video-downloader">Threads Video Downloader</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <ul className="footer-links-list">
              <li><a href="/fair-use">Fair Use & Disclaimer</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="section-wrap footer-bottom-bar">
          <span>© {new Date().getFullYear()} Clipora. Built for lightning-fast media downloads.</span>
          <span className="safe-badge">
            <LockKeyhole size={13} /> 100% Free, Safe & Private
          </span>
        </div>
      </footer>
    </div>
  );
}
