import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Download, 
  ExternalLink,
  MessageSquare,
  Globe,
  Tag
} from 'lucide-react';

export interface SocialShareData {
  title: string;
  content: string;
  imageUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'campaign';
  tags?: string[];
  url?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SocialShareData;
}

export function SocialShareModal({ isOpen, onClose, data }: SocialShareModalProps) {
  const [tweetText, setTweetText] = useState(() => {
    const text = data.content || data.title || '';
    const cleanText = text.length > 200 ? text.substring(0, 197) + '...' : text;
    const defaultTags = (data.tags && data.tags.length > 0) 
      ? data.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ') 
      : '#AIStudio #GenerativeAI #CreatorEconomy';
    return `${cleanText}\n\n${defaultTags}`;
  });

  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'linkedin' | 'reddit' | 'threads' | 'facebook'>('twitter');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const charLimit = 280;
  const remainingChars = charLimit - tweetText.length;

  const handleCopyText = () => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    setToastMsg('Post text copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setToastMsg(null);
    }, 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: tweetText,
          url: data.url || window.location.href,
        });
      } catch (e) {
        console.error('Share failed:', e);
      }
    } else {
      handleCopyText();
    }
  };

  const handlePostToTwitter = () => {
    const encodedText = encodeURIComponent(tweetText);
    const encodedUrl = data.url ? encodeURIComponent(data.url) : '';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}${encodedUrl ? `&url=${encodedUrl}` : ''}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePostToLinkedIn = () => {
    const targetUrl = data.url || window.location.href;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePostToReddit = () => {
    const encodedTitle = encodeURIComponent(data.title || tweetText.slice(0, 100));
    const redditUrl = `https://www.reddit.com/submit?title=${encodedTitle}&text=${encodeURIComponent(tweetText)}`;
    window.open(redditUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePostToThreads = () => {
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(tweetText)}`;
    window.open(threadsUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePostToFacebook = () => {
    const targetUrl = data.url || window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAICaptionRefine = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: 'Twitter Post / Viral Social Caption',
          prompt: `Turn this into an engaging, viral Twitter/X post under 250 characters with emojis and tech hashtags:\nTitle: ${data.title}\nContent: ${data.content}`
        })
      });
      const resData = await res.json();
      if (resData.content) {
        setTweetText(resData.content.trim());
        setToastMsg('✨ Generated viral social post draft!');
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Social Publishing & Sharing</h3>
              <p className="text-[11px] text-slate-400">Post pictures, articles, or campaigns directly to Twitter & social media</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Platform Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedPlatform('twitter')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                selectedPlatform === 'twitter'
                  ? 'bg-sky-500/20 border-sky-400/50 text-sky-300 shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter / X
            </button>

            <button
              onClick={() => setSelectedPlatform('linkedin')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                selectedPlatform === 'linkedin'
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              LinkedIn
            </button>

            <button
              onClick={() => setSelectedPlatform('reddit')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                selectedPlatform === 'reddit'
                  ? 'bg-orange-600/20 border-orange-500/50 text-orange-300 shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
              Reddit
            </button>

            <button
              onClick={() => setSelectedPlatform('threads')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                selectedPlatform === 'threads'
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Threads
            </button>

            <button
              onClick={() => setSelectedPlatform('facebook')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                selectedPlatform === 'facebook'
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Facebook
            </button>
          </div>

          {/* Attached Media / Document Card Preview */}
          {data.imageUrl && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center gap-4 p-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800">
                <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{data.title || 'Attached Media Asset'}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{data.content}</p>
                <div className="text-[10px] text-indigo-400 font-medium capitalize">Media type: {data.mediaType || 'Image'}</div>
              </div>
            </div>
          )}

          {/* Social Post Content Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Post Content / Tweet Body
              </label>

              <button
                onClick={handleAICaptionRefine}
                disabled={isGeneratingCaption}
                className="text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1 bg-indigo-950/60 hover:bg-indigo-900/60 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 text-indigo-400 ${isGeneratingCaption ? 'animate-spin' : ''}`} />
                {isGeneratingCaption ? 'Refining...' : 'AI Tweet Polish'}
              </button>
            </div>

            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
              placeholder="Write your tweet or social caption..."
            />

            {/* Character Count Indicator */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Include link, hashtags, or image reference</span>
              <span className={`font-bold ${remainingChars < 0 ? 'text-rose-400' : remainingChars < 20 ? 'text-amber-400' : 'text-slate-400'}`}>
                {remainingChars} chars remaining (Twitter)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {selectedPlatform === 'twitter' && (
              <button
                onClick={handlePostToTwitter}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Publish to Twitter / X
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {selectedPlatform === 'linkedin' && (
              <button
                onClick={handlePostToLinkedIn}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition"
              >
                <Globe className="w-4 h-4" />
                Share on LinkedIn
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {selectedPlatform === 'reddit' && (
              <button
                onClick={handlePostToReddit}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4" />
                Post to Reddit
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {selectedPlatform === 'threads' && (
              <button
                onClick={handlePostToThreads}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-sm shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition"
              >
                Publish on Threads
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {selectedPlatform === 'facebook' && (
              <button
                onClick={handlePostToFacebook}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
              >
                Share on Facebook
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyText}
                className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                {copied ? 'Copied to Clipboard' : 'Copy Post Text'}
              </button>

              <button
                onClick={handleNativeShare}
                className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                Native Web Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
