/**
 * Twitter / X Web SDK Integration & Universal Social Share Utility
 */

export interface ShareOptions {
  text: string;
  url?: string;
  hashtags?: string[];
  via?: string;
  title?: string;
}

/**
 * Share text or content directly to Twitter/X via Twitter Web Intent or Web SDK.
 */
export function shareToTwitter({ text, url, hashtags = ['AIArt', 'AuraStudio', 'GenerativeAI'], via }: ShareOptions) {
  const intentUrl = new URL('https://twitter.com/intent/tweet');
  
  // Format clean tweet text
  let tweetText = text.trim();
  if (tweetText.length > 220) {
    tweetText = tweetText.slice(0, 217) + '...';
  }

  intentUrl.searchParams.set('text', tweetText);
  if (url && !url.startsWith('data:')) {
    intentUrl.searchParams.set('url', url);
  }
  if (hashtags && hashtags.length > 0) {
    intentUrl.searchParams.set('hashtags', hashtags.join(','));
  }
  if (via) {
    intentUrl.searchParams.set('via', via);
  }

  // Open pop-up window for Twitter Intent
  const width = 580;
  const height = 450;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    intentUrl.toString(),
    'twitter-share-dialog',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );
}

/**
 * Universal Web Share API fallback for mobile / desktop native share sheets.
 */
export async function shareUniversal({ title, text, url }: ShareOptions): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Aura AI Studio Creation',
        text,
        url: url && !url.startsWith('data:') ? url : undefined
      });
      return true;
    } catch (e) {
      // User cancelled or share failed
      return false;
    }
  } else {
    // Fallback to Twitter Intent
    shareToTwitter({ text, url });
    return true;
  }
}
