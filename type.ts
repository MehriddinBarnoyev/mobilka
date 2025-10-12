import { EmbedInfo, OfflineEmbedInfo } from 'vdocipher-rn-bridge/type';
import { VideoItemWithPlayback } from './types/videoType';

export type DownloadData = {
  mediaId: string;
  otp: string;
  playbackInfo: string;
  enableAutoResume?: boolean;
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  NativeControls: { embedInfo: EmbedInfo | OfflineEmbedInfo };
  JSControls: { embedInfo: EmbedInfo | OfflineEmbedInfo };
  Downloads: undefined;
  VideoScreen: VideoItemWithPlayback;
  Playlist: { groupId: any; title: string };
  Protection: undefined;
  EditProfile: undefined;
  Offerta: undefined;
  HomeGroup: { id: any; title: string };
  MyDownloads: undefined;
  Otp: {
    username: string;
    password: string;
    response: {
      id: string;
      code: string | null;
      callBackUrl: string;
    };
  };
  SearchedVideos: { title: string; videos: VideoItemWithPlayback[] };
  CreatePinCodeScreen: undefined;
  ChangePasswordForce: undefined;
  DevicesScreen: undefined;
  GroupDetail: { id: number; title: string };
  PlaylistDetail: { id: number; title: string };
  VideoPlayer: { id: number; url: string; title: string ; coverImageUrl: string | null };

};

export type ErrorDescription = {
  errorCode: number;
  errorMsg: string;
  httpStatusCode: number;
};
