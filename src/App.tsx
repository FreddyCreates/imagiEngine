import React, { useState } from 'react';
import { Navigation, TabType } from './components/Navigation';
import { HomeStudio } from './components/HomeStudio';
import { ImageStudio } from './components/ImageStudio';
import { VideoStudio } from './components/VideoStudio';
import { ThreeStudio } from './components/ThreeStudio';
import { PortfolioStudio } from './components/PortfolioStudio';
import { DocumentStudio } from './components/DocumentStudio';
import { AIEnginesStudio } from './components/AIEnginesStudio';
import { GeneratedImage, VideoReel } from './types/creator';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeReferenceImage, setActiveReferenceImage] = useState<string | null>(null);
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);

  const handleNavigateToVideoMotion = (imageUrl: string) => {
    setVideoSourceImage(imageUrl);
    setActiveTab('video');
  };

  // Sample initial creator showcase assets
  const [images, setImages] = useState<GeneratedImage[]>([
    {
      id: 'img_sample_1',
      url: 'https://picsum.photos/seed/airport_futuristic/1024/1024',
      prompt: 'Futuristic architectural airport terminal with floating supersonic jets at golden hour sunset, photorealistic 8k',
      style: 'photorealistic',
      aspectRatio: '1:1',
      createdAt: Date.now() - 3600000
    },
    {
      id: 'img_sample_2',
      url: 'https://picsum.photos/seed/cyberpunk_warrior/1024/1024',
      prompt: 'Cyberpunk game protagonist with holographic tactical helmet, Unreal Engine 5 render',
      style: '3d-game',
      aspectRatio: '1:1',
      createdAt: Date.now() - 7200000
    },
    {
      id: 'img_sample_3',
      url: 'https://picsum.photos/seed/scientific_research/1024/768',
      prompt: 'Clean medical research lab with AI visualizer, high tech scientific diagram',
      style: 'research',
      aspectRatio: '4:3',
      createdAt: Date.now() - 10800000
    }
  ]);

  const [reels, setReels] = useState<VideoReel[]>([
    {
      id: 'reel_sample_1',
      title: 'Supersonic Aircraft Flyby',
      prompt: 'Cinematic 3D flight of jet aircraft over glowing cyber city at night',
      aspectRatio: '9:16',
      durationSeconds: 5,
      frames: [
        'https://picsum.photos/seed/reel_frame1/720/1280',
        'https://picsum.photos/seed/reel_frame2/720/1280',
        'https://picsum.photos/seed/reel_frame3/720/1280',
        'https://picsum.photos/seed/reel_frame4/720/1280'
      ],
      thumbnailUrl: 'https://picsum.photos/seed/reel_frame1/720/1280',
      createdAt: Date.now() - 1800000
    }
  ]);

  const handleAddImage = (newImg: GeneratedImage) => {
    setImages((prev) => [newImg, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleAddReel = (newReel: VideoReel) => {
    setReels((prev) => [newReel, ...prev]);
  };

  const handleDeleteReel = (id: string) => {
    setReels((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCaptureSnapshot = (dataUrl: string) => {
    setActiveReferenceImage(dataUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveReference={!!activeReferenceImage}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'home' && (
          <HomeStudio
            images={images}
            reels={reels}
            onNavigateToTab={setActiveTab}
            onAddImage={handleAddImage}
          />
        )}

        {activeTab === 'images' && (
          <ImageStudio
            images={images}
            onAddImage={handleAddImage}
            onDeleteImage={handleDeleteImage}
            activeReferenceImage={activeReferenceImage}
            onClearReference={() => setActiveReferenceImage(null)}
            onNavigateToVideoMotion={handleNavigateToVideoMotion}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            reels={reels}
            images={images}
            onAddReel={handleAddReel}
            onDeleteReel={handleDeleteReel}
            initialSourceImage={videoSourceImage}
          />
        )}

        {activeTab === 'three' && (
          <ThreeStudio
            onCaptureSnapshot={handleCaptureSnapshot}
            onNavigateToImageStudio={() => setActiveTab('images')}
          />
        )}

        {activeTab === 'doc' && (
          <DocumentStudio />
        )}

        {activeTab === 'engines' && (
          <AIEnginesStudio />
        )}

        {activeTab === 'portfolios' && (
          <PortfolioStudio
            images={images}
            reels={reels}
          />
        )}
      </main>
    </div>
  );
}

