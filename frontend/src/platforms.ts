export interface PlatformConfig {
  id: string;
  name: string;
  path: string;
  badge: string;
  title: string;
  metaDescription: string;
  keywords: string;
  heroHeadline: string;
  heroHighlight: string;
  heroSub: string;
  placeholder: string;
  sampleUrl: string;
  color: string;
  iconSymbol: string;
  howToSteps: { step: string; title: string; description: string }[];
  features: { title: string; description: string; icon: string }[];
  faqs: { question: string; answer: string }[];
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  home: {
    id: 'home',
    name: 'Universal',
    path: '/',
    badge: 'Universal Video Downloader',
    title: 'Clipora — Free Online Video Downloader (YouTube, TikTok, Instagram & More)',
    metaDescription: 'Download videos from YouTube, TikTok, Instagram, Twitter/X, Facebook, Reddit, and 1000+ sites in Full HD, 4K, MP4 or MP3. Fast, free, and no watermark.',
    keywords: 'video downloader, free video downloader, download video online, youtube downloader, tiktok downloader, instagram reels downloader, download mp4, convert to mp3',
    heroHeadline: 'Download Any Video Online.',
    heroHighlight: 'Fast, High Quality & Free.',
    heroSub: 'Paste any video link from YouTube, Instagram, TikTok, Twitter/X, Facebook, or Reddit. Save in Full HD, MP4, or MP3 instantly with zero watermark.',
    placeholder: 'Paste video link here from YouTube, Instagram, TikTok, X, Facebook…',
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#a78bfa',
    iconSymbol: '▶',
    howToSteps: [
      { step: '01', title: 'Copy the Video Link', description: 'Copy the URL of the video or reel from your browser address bar or app share button.' },
      { step: '02', title: 'Paste URL in Clipora', description: 'Paste the link into the input box above and click the Download button.' },
      { step: '03', title: 'Choose Quality & Format', description: 'Select your preferred video resolution (4K, 1080p, 720p) or audio MP3.' },
      { step: '04', title: 'Save to Your Device', description: 'Click Download to save the video directly to your PC, Mac, iPhone, or Android.' }
    ],
    features: [
      { title: '1000+ Platforms Supported', description: 'Download from YouTube, TikTok, Instagram, Twitter/X, Facebook, Reddit, Twitch, and more.', icon: 'globe' },
      { title: 'Full HD & 4K Quality', description: 'Preserve original video clarity with crisp 1080p, 2K, and 4K resolutions with high bitrate.', icon: 'film' },
      { title: 'No Watermarks Added', description: 'Export clean videos without annoying logos, stamps, or intrusive watermarks.', icon: 'sparkles' },
      { title: 'MP3 Audio Extraction', description: 'Extract crystal-clear 320kbps audio tracks from any video in one click.', icon: 'music' }
    ],
    faqs: [
      { question: 'Is Clipora free to use?', answer: 'Yes! Clipora is 100% free with no subscription, no hidden charges, and no account registration required.' },
      { question: 'What video qualities are supported?', answer: 'We support all resolutions made available by the host platform, including 4K (2160p), 1440p, 1080p Full HD, 720p HD, and 480p, as well as MP3 audio extraction.' },
      { question: 'Does Clipora store downloaded videos?', answer: 'No. Files are processed temporarily in server memory or cache for transfer and automatically wiped. We respect user privacy.' },
      { question: 'Can I download videos on mobile devices?', answer: 'Yes, Clipora is fully responsive and works directly inside Chrome, Safari, Firefox, and Edge on iOS and Android devices.' }
    ]
  },

  youtube: {
    id: 'youtube',
    name: 'YouTube',
    path: '/youtube-video-downloader',
    badge: 'YouTube Downloader HD & MP3',
    title: 'YouTube Video Downloader — Download YouTube Videos & Shorts in 1080p & 4K | Clipora',
    metaDescription: 'Free online YouTube video downloader. Save YouTube videos, Shorts, and audio in 1080p, 4K, 720p, MP4, and MP3 at high speed with no software required.',
    keywords: 'youtube video downloader, download youtube shorts, youtube to mp4, youtube to mp3, 1080p youtube download, 4k youtube downloader, clipora youtube',
    heroHeadline: 'Download YouTube Videos & Shorts.',
    heroHighlight: 'In Full HD, 4K & MP3.',
    heroSub: 'Save high-definition YouTube videos and Shorts to your PC, Mac, or phone. Choose between 4K, 1080p, 720p MP4 or high-fidelity 320kbps MP3 audio.',
    placeholder: 'Paste YouTube video or Shorts link (e.g. https://www.youtube.com/watch?v=…)',
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#ff3b4a',
    iconSymbol: '▶',
    howToSteps: [
      { step: '01', title: 'Copy YouTube URL', description: 'Open YouTube and copy the link from the address bar or Share button.' },
      { step: '02', title: 'Paste Link Above', description: 'Paste the YouTube link into the box at the top and hit Download.' },
      { step: '03', title: 'Pick Quality', description: 'Choose from 1080p Full HD, 720p, 4K, or extract MP3 audio.' },
      { step: '04', title: 'Download MP4 / MP3', description: 'Your file is processed and downloaded instantly to your storage.' }
    ],
    features: [
      { title: 'YouTube Shorts Support', description: 'Download both standard YouTube landscape videos and vertical YouTube Shorts seamlessly.', icon: 'film' },
      { title: '1080p & 4K Ultra HD', description: 'Download the maximum available quality with merged high-fidelity audio.', icon: 'sparkles' },
      { title: 'Fast YouTube to MP3', description: 'Convert YouTube music videos, podcasts, and speeches into 320kbps MP3 audio files.', icon: 'music' },
      { title: 'Video Segment Trimmer', description: 'Download just the clip or timestamp range you need without downloading the entire hour.', icon: 'scissors' }
    ],
    faqs: [
      { question: 'Can I download YouTube Shorts?', answer: 'Yes! Clipora fully supports YouTube Shorts. Simply copy the Shorts link and paste it above to download in full portrait resolution.' },
      { question: 'Can I convert YouTube videos to MP3?', answer: 'Yes! Select the Audio MP3 tab after pasting the link to download pure high-bitrate audio.' },
      { question: 'Is there a limit on YouTube video length?', answer: 'You can download videos up to 1 hour in length, or use our trim feature to extract specific clips from longer streams.' },
      { question: 'Do I need to install any extension or software?', answer: 'No software or browser extension is needed. Clipora runs entirely in your web browser.' }
    ]
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram',
    path: '/instagram-video-downloader',
    badge: 'Instagram Reels & Video Downloader',
    title: 'Instagram Video Downloader — Download Reels, Stories & Posts in HD | Clipora',
    metaDescription: 'Download Instagram Reels, videos, and Stories online in high resolution MP4. Free, fast, watermark-free Instagram video downloader for PC, iPhone, and Android.',
    keywords: 'instagram video downloader, download instagram reels, instagram story downloader, ig video download, instagram to mp4, save ig reels',
    heroHeadline: 'Download Instagram Reels & Videos.',
    heroHighlight: 'Original Quality, No Watermark.',
    heroSub: 'Save Instagram Reels, video posts, and IGTV clips in original crisp 1080p MP4. Quick, free, and works on all desktop and mobile devices.',
    placeholder: 'Paste Instagram Reel or Video URL (e.g. https://www.instagram.com/reel/…)',
    sampleUrl: 'https://www.instagram.com/reel/C_xyz123/',
    color: '#e1306c',
    iconSymbol: '◎',
    howToSteps: [
      { step: '01', title: 'Copy Instagram Link', description: 'Tap the three dots or Share icon on the Instagram post and choose "Copy Link".' },
      { step: '02', title: 'Paste in Clipora', description: 'Paste the copied Instagram link into the top input bar.' },
      { step: '03', title: 'Analyze & Select', description: 'Clipora fetches the high-definition MP4 stream automatically.' },
      { step: '04', title: 'Save to Gallery', description: 'Download the Reel directly to your Photos or Downloads folder.' }
    ],
    features: [
      { title: 'Instagram Reels in HD', description: 'Save trending Reels in full 1080x1920 vertical format with crystal clear sound.', icon: 'film' },
      { title: 'Audio Preservation', description: 'Includes original background music and voice tracks in high quality.', icon: 'music' },
      { title: 'No Account Required', description: 'Download public Instagram media without logging into your personal Instagram account.', icon: 'shield' },
      { title: 'iPhone & Android Ready', description: 'Smooth download directly into iOS Photos or Android gallery without third-party apps.', icon: 'sparkles' }
    ],
    faqs: [
      { question: 'Can I download Instagram Reels without a watermark?', answer: 'Yes! Instagram videos downloaded via Clipora do not have any added stamps or watermarks.' },
      { question: 'Do I need to log into Instagram?', answer: 'No, you never have to log in or share your Instagram credentials.' },
      { question: 'Can I download private Instagram accounts?', answer: 'Clipora only supports public posts and Reels that can be viewed without logging into a restricted account.' },
      { question: 'Where are Instagram videos saved on my phone?', answer: 'On iOS, they save to Files or Safari Downloads (and can be saved to Camera Roll). On Android, they go straight to your Downloads/Gallery.' }
    ]
  },

  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    path: '/tiktok-video-downloader',
    badge: 'TikTok Downloader (No Watermark)',
    title: 'TikTok Video Downloader Without Watermark — Free HD MP4 & MP3 | Clipora',
    metaDescription: 'Download TikTok videos without watermark in HD MP4 quality. Fast, free online TikTok downloader for mobile and desktop. Convert TikTok to MP3 easily.',
    keywords: 'tiktok video downloader, download tiktok without watermark, tiktok no watermark, save tiktok video, tiktok to mp4, tiktok mp3 download',
    heroHeadline: 'Download TikTok Videos.',
    heroHighlight: '100% Without Watermark.',
    heroSub: 'Save your favorite TikTok videos in clean Full HD MP4 without the floating TikTok logo or username stamp. Free and lightning fast.',
    placeholder: 'Paste TikTok video link (e.g. https://www.tiktok.com/@user/video/…)',
    sampleUrl: 'https://www.tiktok.com/@creator/video/1234567890',
    color: '#00f2fe',
    iconSymbol: '♪',
    howToSteps: [
      { step: '01', title: 'Copy TikTok Link', description: 'In the TikTok app, tap Share and select "Copy Link".' },
      { step: '02', title: 'Paste Above', description: 'Paste the link into Clipora’s top search bar.' },
      { step: '03', title: 'Select Format', description: 'Choose clean MP4 video (without watermark) or extract MP3 audio.' },
      { step: '04', title: 'Download Video', description: 'Save your watermark-free TikTok file in seconds.' }
    ],
    features: [
      { title: 'No Watermark Guaranteed', description: 'Removes the bouncing TikTok logo and creator handle overlay cleanly.', icon: 'sparkles' },
      { title: 'Full HD Quality', description: 'Downloads in the maximum resolution the creator uploaded (1080p/720p).', icon: 'film' },
      { title: 'Extract TikTok Sounds', description: 'Save viral TikTok sounds, audio trends, and songs as standalone MP3 files.', icon: 'music' },
      { title: 'Unlimited Downloads', description: 'No daily download caps or restrictive limits—download as many as you need.', icon: 'globe' }
    ],
    faqs: [
      { question: 'Does this remove the TikTok watermark?', answer: 'Yes! Clipora extracts the clean, watermark-free source video stream directly.' },
      { question: 'Can I download TikTok sounds or songs?', answer: 'Yes, select the Audio MP3 option after pasting your TikTok link to extract just the audio track.' },
      { question: 'Does it work for TikTok photo slide shows?', answer: 'If the post contains video or rendered slides, Clipora will fetch the video format.' },
      { question: 'Is TikTok downloader free?', answer: 'Yes, 100% free with no subscription or payment needed.' }
    ]
  },

  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    path: '/twitter-video-downloader',
    badge: 'Twitter / X Video Downloader',
    title: 'Twitter Video Downloader — Download X Videos & GIFs in HD MP4 | Clipora',
    metaDescription: 'Download Twitter (X) videos and GIFs online in high quality MP4. Fast, free X video downloader compatible with iPhone, Android, PC, and Mac.',
    keywords: 'twitter video downloader, x video downloader, download twitter videos, save x video, twitter to mp4, download twitter gif',
    heroHeadline: 'Download Twitter & X Videos.',
    heroHighlight: 'In Crisp HD MP4 Format.',
    heroSub: 'Save videos and animated GIFs from Twitter/X tweets to your phone or computer in highest quality MP4 with audio included.',
    placeholder: 'Paste Twitter / X tweet link (e.g. https://x.com/user/status/…)',
    sampleUrl: 'https://x.com/Twitter/status/1234567890',
    color: '#1da1f2',
    iconSymbol: '𝕏',
    howToSteps: [
      { step: '01', title: 'Copy Tweet URL', description: 'Click the Share icon under the tweet and select "Copy Link".' },
      { step: '02', title: 'Paste in Clipora', description: 'Paste the link into the URL bar at the top of this page.' },
      { step: '03', title: 'Choose Resolution', description: 'Pick your preferred MP4 resolution (1080p, 720p, or 480p).' },
      { step: '04', title: 'Download MP4', description: 'Click Download to save the video directly to your device.' }
    ],
    features: [
      { title: 'Multi-Resolution Options', description: 'Pick between 1080p, 720p, and smaller file sizes tailored to your storage.', icon: 'film' },
      { title: 'Twitter GIF to MP4', description: 'Convert looped Twitter GIFs into standard downloadable MP4 video files.', icon: 'sparkles' },
      { title: 'Audio Synchronized', description: 'Downloads video and sound perfectly synced without compression distortion.', icon: 'music' },
      { title: 'x.com & twitter.com', description: 'Fully supports both modern x.com links and legacy twitter.com URLs.', icon: 'globe' }
    ],
    faqs: [
      { question: 'Can I download videos from x.com and twitter.com?', answer: 'Yes, both domain formats are fully recognized and supported.' },
      { question: 'Can I download Twitter GIFs?', answer: 'Yes! Twitter converts GIFs into video loops; Clipora allows you to download them as standard MP4 files.' },
      { question: 'Can I download videos from private Twitter accounts?', answer: 'Only tweets from public accounts can be processed.' },
      { question: 'Why don\'t Twitter videos download through the app directly?', answer: 'Twitter does not offer a native download button for videos, which is why Clipora provides a fast web-based solution.' }
    ]
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook',
    path: '/facebook-video-downloader',
    badge: 'Facebook Video & Reels Downloader',
    title: 'Facebook Video Downloader — Download FB Reels & Videos in HD | Clipora',
    metaDescription: 'Free Facebook video downloader online. Save Facebook Reels, Watch videos, and public clips in 1080p Full HD MP4 quality. Fast and easy.',
    keywords: 'facebook video downloader, fb video download, download facebook reels, facebook watch downloader, fb to mp4, save facebook video',
    heroHeadline: 'Download Facebook Videos & Reels.',
    heroHighlight: 'In High Definition 1080p.',
    heroSub: 'Save Facebook Watch clips, viral Reels, and public post videos directly in MP4 format. Free, high speed, and works without an account.',
    placeholder: 'Paste Facebook video or Reel link (e.g. https://www.facebook.com/watch/…)',
    sampleUrl: 'https://www.facebook.com/watch/?v=123456789',
    color: '#1877f2',
    iconSymbol: 'f',
    howToSteps: [
      { step: '01', title: 'Copy Facebook Link', description: 'Click Share on the Facebook video and select "Copy Link".' },
      { step: '02', title: 'Paste Link', description: 'Paste the URL into the input field at the top of Clipora.' },
      { step: '03', title: 'Pick Quality', description: 'Select Full HD (1080p) or Standard Definition (SD).' },
      { step: '04', title: 'Save Video', description: 'Click Download to save the MP4 video to your computer or mobile.' }
    ],
    features: [
      { title: 'FB Reels & Watch', description: 'Supports standard Facebook posts, Watch channel videos, and portrait Reels.', icon: 'film' },
      { title: 'HD Quality Output', description: 'Download in clear 1080p or 720p HD with complete stereo audio.', icon: 'sparkles' },
      { title: 'Zero Compression Loss', description: 'Transfers the direct stream without re-compressing or degrading quality.', icon: 'shield' },
      { title: 'Fast Cloud Processing', description: 'Instant link inspection and download speeds powered by optimized servers.', icon: 'globe' }
    ],
    faqs: [
      { question: 'Can I download Facebook Reels?', answer: 'Yes! Both Facebook landscape videos and vertical Facebook Reels are fully supported.' },
      { question: 'Can I download private group Facebook videos?', answer: 'No, only public videos can be accessed and downloaded.' },
      { question: 'Is this Facebook downloader safe to use?', answer: 'Yes, 100% safe. We do not require your Facebook login or collect personal information.' },
      { question: 'Can I download Facebook live streams?', answer: 'You can download Facebook live videos once the stream has concluded and is posted as a recording.' }
    ]
  },

  reddit: {
    id: 'reddit',
    name: 'Reddit',
    path: '/reddit-video-downloader',
    badge: 'Reddit Video Downloader with Audio',
    title: 'Reddit Video Downloader with Sound — Save Reddit Videos in HD MP4 | Clipora',
    metaDescription: 'Download Reddit videos with sound online. Save v.redd.it videos and Reddit posts in HD MP4 with merged audio. Free and unlimited.',
    keywords: 'reddit video downloader, download reddit video with sound, reddit to mp4, v.redd.it downloader, save reddit video with audio, reddit downloader',
    heroHeadline: 'Download Reddit Videos with Sound.',
    heroHighlight: 'Merged HD MP4 with Audio.',
    heroSub: 'Reddit separates video and audio streams natively. Clipora automatically combines them into one unified, crystal-clear MP4 file with full sound.',
    placeholder: 'Paste Reddit post or v.redd.it link (e.g. https://www.reddit.com/r/…)',
    sampleUrl: 'https://www.reddit.com/r/videos/comments/123/sample/',
    color: '#ff4500',
    iconSymbol: '◉',
    howToSteps: [
      { step: '01', title: 'Copy Reddit Post', description: 'Click Share on Reddit and choose "Copy Link".' },
      { step: '02', title: 'Paste Above', description: 'Paste the Reddit link into the top URL bar.' },
      { step: '03', title: 'Automatic Merge', description: 'Clipora automatically merges the separate audio and video tracks.' },
      { step: '04', title: 'Download MP4', description: 'Download your full-sound MP4 video with one click.' }
    ],
    features: [
      { title: 'Sound Guaranteed', description: 'Never download a silent Reddit video again—audio is automatically merged.', icon: 'music' },
      { title: 'v.redd.it Support', description: 'Works with native Reddit video hosting as well as external links.', icon: 'film' },
      { title: 'Maximum Resolution', description: 'Select up to 1080p full resolution with high bitrate.', icon: 'sparkles' },
      { title: 'Quick Sharing', description: 'Downloaded MP4s are ready to share on WhatsApp, Discord, or Telegram.', icon: 'globe' }
    ],
    faqs: [
      { question: 'Why do Reddit videos normally download without sound?', answer: 'Reddit stores video and audio streams as separate files. Clipora automatically downloads both and combines them seamlessly into a single MP4 with sound.' },
      { question: 'Does this work on mobile Reddit apps?', answer: 'Yes! Tap Share > Copy Link in the Reddit app and paste it into Clipora in your mobile browser.' },
      { question: 'Can I download NSFW or blurred Reddit videos?', answer: 'Public Reddit videos are supported. We do not bypass Reddit age verification for restricted content.' },
      { question: 'Is there any watermark on Reddit downloads?', answer: 'No watermarks are added to your downloaded videos.' }
    ]
  },

  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    path: '/vimeo-video-downloader',
    badge: 'Vimeo Video Downloader Full HD',
    title: 'Vimeo Video Downloader — Download Vimeo Videos in 1080p & 4K | Clipora',
    metaDescription: 'Free online Vimeo video downloader. Download Vimeo videos in 4K, 1080p, 720p MP4 format. Fast, high-quality, and completely free.',
    keywords: 'vimeo video downloader, download vimeo video, vimeo to mp4, vimeo 1080p download, save vimeo video, online vimeo downloader',
    heroHeadline: 'Download Vimeo Videos in High Def.',
    heroHighlight: '4K & 1080p Studio Quality.',
    heroSub: 'Save cinematic Vimeo videos, short films, and portfolio presentations in uncompressed high-bitrate MP4 directly to your machine.',
    placeholder: 'Paste Vimeo video link (e.g. https://vimeo.com/123456789)',
    sampleUrl: 'https://vimeo.com/76979871',
    color: '#1ab7ea',
    iconSymbol: 'v',
    howToSteps: [
      { step: '01', title: 'Copy Vimeo URL', description: 'Copy the link from your browser or Vimeo share menu.' },
      { step: '02', title: 'Paste Link', description: 'Insert the link into the top input bar on Clipora.' },
      { step: '03', title: 'Choose 4K / 1080p', description: 'Pick your desired video resolution.' },
      { step: '04', title: 'Save File', description: 'Download your high-definition MP4 file.' }
    ],
    features: [
      { title: 'Cinema Grade Quality', description: 'Export Vimeo videos in 4K and 1080p with maximum visual fidelity.', icon: 'film' },
      { title: 'Audio Extraction', description: 'Download soundtracks and audio tracks in high-bitrate MP3 or M4A.', icon: 'music' },
      { title: 'High Speed Transfers', description: 'Utilizes high-bandwidth pipes to ensure speedy downloads.', icon: 'globe' },
      { title: 'No Registration', description: 'Free for everyone without having to sign up or create an account.', icon: 'shield' }
    ],
    faqs: [
      { question: 'Can I download private password-protected Vimeo videos?', answer: 'Only publicly accessible Vimeo videos can be inspected and downloaded.' },
      { question: 'What qualities are available for Vimeo?', answer: 'All resolutions uploaded by the creator, from 4K Ultra HD and 1080p down to 360p.' },
      { question: 'Can I trim Vimeo clips?', answer: 'Yes, you can use our built-in trim controls to download only a specific portion of the video.' },
      { question: 'Is Vimeo downloading free?', answer: 'Yes, Clipora is completely free to use.' }
    ]
  },

  twitch: {
    id: 'twitch',
    name: 'Twitch',
    path: '/twitch-clip-downloader',
    badge: 'Twitch Clip & VOD Downloader',
    title: 'Twitch Clip Downloader — Save Twitch Clips & Highlights in 1080p 60fps | Clipora',
    metaDescription: 'Download Twitch clips and stream highlights in 1080p 60fps MP4. Free online Twitch clip downloader with fast speeds and no software required.',
    keywords: 'twitch clip downloader, download twitch clips, save twitch vod, twitch to mp4, twitch 60fps download, twitch highlight downloader',
    heroHeadline: 'Download Twitch Clips & Highlights.',
    heroHighlight: 'In 1080p 60FPS Smooth Quality.',
    heroSub: 'Save epic gaming moments, tournament highlights, and funny Twitch clips in smooth 60fps MP4. Never lose your favorite stream memories.',
    placeholder: 'Paste Twitch clip URL (e.g. https://clips.twitch.tv/… or https://www.twitch.tv/…/clip/…)',
    sampleUrl: 'https://clips.twitch.tv/AwkwardSlickSpiderVoteNay',
    color: '#9146ff',
    iconSymbol: 'twitch',
    howToSteps: [
      { step: '01', title: 'Copy Twitch Clip Link', description: 'Click Share on any Twitch clip and copy the direct link.' },
      { step: '02', title: 'Paste in Clipora', description: 'Paste the clip URL into the top search bar.' },
      { step: '03', title: 'Select 60 FPS HD', description: 'Choose smooth 1080p or 720p 60 frames-per-second.' },
      { step: '04', title: 'Download MP4', description: 'Save the clip immediately to your device.' }
    ],
    features: [
      { title: '60 FPS Smooth Playback', description: 'Preserves the fast-paced 60 frames per second gaming smoothness.', icon: 'film' },
      { title: 'Instant Clip Fetching', description: 'Twitch clips are parsed and prepared in fractions of a second.', icon: 'sparkles' },
      { title: 'No Limits on Clips', description: 'Download as many tournament and streamer clips as you want.', icon: 'globe' },
      { title: 'Discord & TikTok Ready', description: 'Perfect size and format to upload directly into Discord or edit for TikTok.', icon: 'music' }
    ],
    faqs: [
      { question: 'Can I download 60fps Twitch clips?', answer: 'Yes! If the streamer broadcasted in 60fps, Clipora preserves the full 60fps rate in the downloaded MP4.' },
      { question: 'Can I download full Twitch VODs?', answer: 'Clips and highlights are supported. For extremely long multi-hour VODs, we recommend downloading clips or trimming sections.' },
      { question: 'Can I download subscriber-only Twitch VODs?', answer: 'Only publicly accessible Twitch content can be processed.' },
      { question: 'Is Twitch clip downloader free?', answer: 'Yes, 100% free with no account required.' }
    ]
  },

  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    path: '/pinterest-video-downloader',
    badge: 'Pinterest Video & Pin Downloader',
    title: 'Pinterest Video Downloader — Download Pins & Videos in HD MP4 | Clipora',
    metaDescription: 'Free online Pinterest video downloader. Save Pinterest videos, ideas, and Pins in HD MP4 with audio. Easy to use on iPhone, Android, and PC.',
    keywords: 'pinterest video downloader, download pinterest video, save pinterest pin, pinterest to mp4, download pinterest gif, pin video download',
    heroHeadline: 'Download Pinterest Videos & Pins.',
    heroHighlight: 'In HD MP4 with Sound.',
    heroSub: 'Save aesthetic Pinterest video pins, DIY tutorials, and recipe clips directly to your phone or laptop in high-definition MP4 with audio.',
    placeholder: 'Paste Pinterest pin link (e.g. https://www.pinterest.com/pin/… or https://pin.it/…)',
    sampleUrl: 'https://pin.it/sample123',
    color: '#bd081c',
    iconSymbol: 'p',
    howToSteps: [
      { step: '01', title: 'Copy Pin Link', description: 'Open Pinterest, tap the three dots or Share, and select "Copy link".' },
      { step: '02', title: 'Paste in Clipora', description: 'Paste your Pinterest link into the top search bar.' },
      { step: '03', title: 'Choose Resolution', description: 'Select 1080p or 720p HD MP4 format.' },
      { step: '04', title: 'Save Video', description: 'Save the pin video straight to your gallery.' }
    ],
    features: [
      { title: 'pin.it Shortlink Support', description: 'Supports both desktop pinterest.com URLs and mobile pin.it shortlinks.', icon: 'globe' },
      { title: 'Full Audio Included', description: 'Ensures background music and voiceover audio are fully included in the MP4.', icon: 'music' },
      { title: 'High Definition', description: 'Extracts the cleanest high-resolution master file stored on Pinterest servers.', icon: 'film' },
      { title: 'Mobile Friendly', description: 'Download directly to iPhone Camera Roll or Android Gallery without apps.', icon: 'sparkles' }
    ],
    faqs: [
      { question: 'Can I download pin.it short links?', answer: 'Yes! Clipora automatically resolves and unpacks pin.it short links.' },
      { question: 'Will the downloaded Pinterest video have sound?', answer: 'Yes! All Pinterest videos with audio tracks are downloaded with audio fully intact.' },
      { question: 'Can I download Pinterest GIFs?', answer: 'Yes, Pinterest animated GIFs can be downloaded as MP4 videos.' },
      { question: 'Is there any limit on Pinterest downloads?', answer: 'No, you can download unlimited Pinterest videos for free.' }
    ]
  },

  threads: {
    id: 'threads',
    name: 'Threads',
    path: '/threads-video-downloader',
    badge: 'Threads Video Downloader',
    title: 'Threads Video Downloader — Save Threads Videos in HD MP4 | Clipora',
    metaDescription: 'Download videos from Threads online in Full HD MP4 quality. Fast, free Threads video downloader for iPhone, Android, and desktop.',
    keywords: 'threads video downloader, download threads video, save threads post, threads to mp4, meta threads downloader',
    heroHeadline: 'Download Threads Videos in HD.',
    heroHighlight: 'Original Quality, Fast & Free.',
    heroSub: 'Save videos from Meta Threads posts directly in crisp MP4 format. No login required, watermark-free, and works on all devices.',
    placeholder: 'Paste Threads video link (e.g. https://www.threads.net/@user/post/…)',
    sampleUrl: 'https://www.threads.net/@user/post/123456789',
    color: '#ffffff',
    iconSymbol: '@',
    howToSteps: [
      { step: '01', title: 'Copy Threads Link', description: 'In the Threads app, tap the Share icon on the post and choose "Copy Link".' },
      { step: '02', title: 'Paste Above', description: 'Paste the link into Clipora\'s top search box.' },
      { step: '03', title: 'Choose MP4 Quality', description: 'Select high-definition video format.' },
      { step: '04', title: 'Download File', description: 'Save the Threads video directly to your device.' }
    ],
    features: [
      { title: 'HD Threads Video', description: 'Download in the highest bitrate uploaded to Meta Threads.', icon: 'film' },
      { title: 'No Account Needed', description: 'Download public Threads videos without logging in or connecting your account.', icon: 'shield' },
      { title: 'Clean MP4 Format', description: 'No extra watermarks or compression artifacts added.', icon: 'sparkles' },
      { title: 'Instant Mobile Downloads', description: 'Works smoothly on mobile Safari and Chrome on iOS and Android.', icon: 'globe' }
    ],
    faqs: [
      { question: 'Can I download Threads videos on my iPhone or Android?', answer: 'Yes! Just copy the post link in the Threads app and paste it into Clipora in your mobile browser.' },
      { question: 'Do I need an Instagram or Threads account?', answer: 'No account is needed. Public Threads posts can be downloaded instantly.' },
      { question: 'Are downloaded Threads videos watermarked?', answer: 'No, Clipora delivers clean, original-quality MP4 video without watermarks.' },
      { question: 'Is this Threads downloader free?', answer: 'Yes, 100% free with unlimited downloads.' }
    ]
  }
};

export const PLATFORM_LIST = [
  PLATFORMS.youtube,
  PLATFORMS.instagram,
  PLATFORMS.tiktok,
  PLATFORMS.twitter,
  PLATFORMS.facebook,
  PLATFORMS.reddit,
  PLATFORMS.vimeo,
  PLATFORMS.twitch,
  PLATFORMS.pinterest,
  PLATFORMS.threads
];
