// Browser-side background removal wrapper (lazy-loaded).

export async function removeBackground(
  file: Blob,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  const mod = await import("@imgly/background-removal");
  const removeBg = mod.removeBackground ?? mod.default;
  return removeBg(file, {
    progress: (_key: string, current: number, total: number) => {
      if (onProgress && total > 0) onProgress(current / total);
    },
  });
}
