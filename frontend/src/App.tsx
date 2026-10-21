import { Routes, Route, Navigate } from 'react-router-dom';
import { PLATFORMS } from './platforms';
import { DownloaderPage } from './pages/DownloaderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DownloaderPage platform={PLATFORMS.home} />} />
      <Route path="/youtube-video-downloader" element={<DownloaderPage platform={PLATFORMS.youtube} />} />
      <Route path="/instagram-video-downloader" element={<DownloaderPage platform={PLATFORMS.instagram} />} />
      <Route path="/tiktok-video-downloader" element={<DownloaderPage platform={PLATFORMS.tiktok} />} />
      <Route path="/twitter-video-downloader" element={<DownloaderPage platform={PLATFORMS.twitter} />} />
      <Route path="/x-video-downloader" element={<DownloaderPage platform={PLATFORMS.twitter} />} />
      <Route path="/facebook-video-downloader" element={<DownloaderPage platform={PLATFORMS.facebook} />} />
      <Route path="/reddit-video-downloader" element={<DownloaderPage platform={PLATFORMS.reddit} />} />
      <Route path="/vimeo-video-downloader" element={<DownloaderPage platform={PLATFORMS.vimeo} />} />
      <Route path="/twitch-clip-downloader" element={<DownloaderPage platform={PLATFORMS.twitch} />} />
      <Route path="/pinterest-video-downloader" element={<DownloaderPage platform={PLATFORMS.pinterest} />} />
      <Route path="/threads-video-downloader" element={<DownloaderPage platform={PLATFORMS.threads} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
