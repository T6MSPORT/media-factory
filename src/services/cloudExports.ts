import type { ExportRecord, Project } from '../types';
import type { PngExportResult } from '../utils/export';
import { getCloudClient } from './cloudAuth';

const BUCKET = 'media-exports';

export async function uploadCloudExport(
  accountId: string,
  project: Project,
  result: PngExportResult,
): Promise<ExportRecord> {
  const id = crypto.randomUUID();
  const storagePath = `${accountId}/${id}.png`;
  const { error } = await getCloudClient().storage
    .from(BUCKET)
    .upload(storagePath, result.blob, { contentType: 'image/png', upsert: false });
  if (error) throw new Error('The PNG downloaded, but its cloud copy could not be saved.');
  return {
    id,
    storagePath,
    fileName: result.fileName,
    projectName: project.name,
    template: project.template,
    format: project.format,
    createdAt: new Date().toISOString(),
  };
}

export async function cloudExportUrl(storagePath: string): Promise<string> {
  const { data, error } = await getCloudClient().storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) throw new Error('This export could not be opened.');
  return data.signedUrl;
}

export async function deleteCloudExport(storagePath: string): Promise<void> {
  const { error } = await getCloudClient().storage.from(BUCKET).remove([storagePath]);
  if (error) throw new Error('This export could not be deleted.');
}
