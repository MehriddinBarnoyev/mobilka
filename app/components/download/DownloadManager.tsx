import {useEffect, useState} from 'react';
import {VdoDownload} from 'vdocipher-rn-bridge';
import type {
  DownloadStatus,
  DownloadOptions,
  Track,
} from 'vdocipher-rn-bridge/type';

export function useDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadStatus[]>([]);

  useEffect(() => {
    refreshDownloads();

    const unsubscribes = [
      VdoDownload.addEventListener('onQueued', refreshDownloads),
      VdoDownload.addEventListener('onChanged', refreshDownloads),
      VdoDownload.addEventListener('onCompleted', refreshDownloads),
      VdoDownload.addEventListener('onFailed', refreshDownloads),
      VdoDownload.addEventListener('onDeleted', refreshDownloads),
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const refreshDownloads = () => {
    VdoDownload.query()
      .then(setDownloads)
      .catch((err: any) => console.warn('Download query error:', err));
  };

  const getValidSelections = (tracks: Track[]): number[] => {
    const selections: number[] = [];

    const videoIndex = tracks.findIndex(track => track.type === 'video');
    const audioIndex = tracks.findIndex(track => track.type === 'audio');

    if (videoIndex !== -1) selections.push(videoIndex);
    if (audioIndex !== -1) selections.push(audioIndex);

    // ✨ Enforce VdoCipher rule: max 2 tracks
    return selections.slice(0, 2);
  };

  const downloadVideo = async (otp: string, playbackInfo: string) => {
    try {
      const {
        downloadOptions,
        enqueue,
      }: {
        downloadOptions: DownloadOptions;
        enqueue: (args: {selections: number[]}) => Promise<void>;
      } = await VdoDownload.getDownloadOptions({otp, playbackInfo});

      const selections = getValidSelections(downloadOptions.availableTracks);

      if (selections.length === 0) {
        console.warn('No valid audio/video tracks found for download');
        return;
      }

      await enqueue({selections});
      console.log('Download started successfully');
    } catch (err) {
      console.warn('Download error:', err);
    }
  };

  const removeDownload = async (mediaId: string) => {
    try {
      await VdoDownload.remove([mediaId]);
      console.log('Download removed:', mediaId);
    } catch (err) {
      console.warn('Failed to remove download:', mediaId, err);
    }
  };

  const getDownloadStatusById = (mediaId: string) => {
    return downloads.find(d => d.mediaInfo.mediaId === mediaId);
  };

  return {
    downloads,
    downloadVideo,
    removeDownload,
    getDownloadStatusById,
  };
}
