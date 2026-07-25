import { ImagePlus } from 'lucide-react';
import { processImageFile, type ImagePurpose } from '../../utils/images';

type ImageProcessor = (file: File, purpose: ImagePurpose) => Promise<string>;
export type ImageUploadHandler = (value: string) => void | Promise<void>;

export async function uploadImage(
  file: File,
  purpose: ImagePurpose,
  onUpload: ImageUploadHandler,
  process: ImageProcessor = processImageFile,
): Promise<void> {
  const image = await process(file, purpose);
  await onUpload(image);
}

const reportUploadError = (error: unknown) =>
  alert(error instanceof Error ? error.message : 'The image could not be uploaded.');

export function BackgroundUpload({ on }: { on: ImageUploadHandler }) {
  return (
    <label className="upload">
      Upload background image
      <span>
        <ImagePlus size={16} />
        Upload
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={async event => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            await uploadImage(file, 'background', on);
          } catch (error) {
            reportUploadError(error);
          } finally {
            event.currentTarget.value = '';
          }
        }}
      />
    </label>
  );
}

export function Upload({
  label,
  on,
  purpose = 'portrait',
}: {
  label: string;
  on: ImageUploadHandler;
  purpose?: ImagePurpose;
}) {
  return (
    <label className="upload">
      {label}
      <span>
        <ImagePlus size={16} />
        Upload
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={async event => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            await uploadImage(file, purpose, on);
          } catch (error) {
            reportUploadError(error);
          } finally {
            event.currentTarget.value = '';
          }
        }}
      />
    </label>
  );
}
