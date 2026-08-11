import type { SupabaseClient } from '@supabase/supabase-js';
import { normaliseData } from '../store';
import type { Data } from '../types';
import { getCloudClient } from './cloudAuth';

type WorkspaceRow = {
  workspace_data: unknown;
  updated_at: string;
};

export type CloudWorkspace = {
  data: Data;
  updatedAt: string;
};

export async function loadCloudWorkspace(
  accountId: string,
  cloudClient: SupabaseClient = getCloudClient(),
): Promise<CloudWorkspace | undefined> {
  const { data, error } = await cloudClient
    .from('user_workspaces')
    .select('workspace_data, updated_at')
    .eq('user_id', accountId)
    .maybeSingle();

  if (error) throw new Error('Your cloud workspace could not be loaded.');
  if (!data) return undefined;

  const row = data as WorkspaceRow;
  return { data: normaliseData(row.workspace_data), updatedAt: row.updated_at };
}

export async function saveCloudWorkspace(
  accountId: string,
  data: Data,
  cloudClient: SupabaseClient = getCloudClient(),
): Promise<string> {
  const updatedAt = new Date().toISOString();
  const { error } = await cloudClient
    .from('user_workspaces')
    .upsert({
      user_id: accountId,
      workspace_data: data,
      schema_version: 1,
      updated_at: updatedAt,
    }, { onConflict: 'user_id' });

  if (error) throw new Error('Your latest changes could not be synced to the cloud.');
  return updatedAt;
}
