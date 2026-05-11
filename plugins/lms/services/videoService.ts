import { ILesson } from '../models/Lesson';

interface UploadUrlResponse {
  uploadUrl: string;
  externalId: string;
  provider: 's3' | 'cloudflare' | 'mux';
}

/**
 * Scalable Video Delivery Service
 * Unified interface for S3, Cloudflare Stream, or Mux.
 */
export const videoService = {
  async getStreamingUrl(lesson: ILesson | any): Promise<string | undefined> {
    const topicVideoUrl = lesson?.topics?.[0]?.videoUrl || lesson?.topic?.videoUrl || '';
    const videoProvider = lesson?.videoProvider;
    const videoExternalId = lesson?.videoExternalId;
    const videoUrl = topicVideoUrl || lesson?.videoUrl || '';

    if (videoProvider === 'mux') {
      return `https://stream.mux.com/${videoExternalId}.m3u8`;
    }

    if (videoProvider === 'cloudflare') {
      return `https://customer-f33.cloudflarestream.com/${videoExternalId}/manifest/video.m3u8`;
    }

    // Default or Local
    return videoUrl;
  },

  async generateUploadUrl(tenantId: string, fileName: string): Promise<UploadUrlResponse> {
    // Mocking signed URL generation for S3/R2
    const bucket = process.env.VIDEO_BUCKET || 'lms-videos';
    const key = `${tenantId}/${Date.now()}-${fileName}`;
    return {
      uploadUrl: `https://${bucket}.s3.amazonaws.com/${key}?signed=true`,
      externalId: key,
      provider: 's3'
    };
  }
};
