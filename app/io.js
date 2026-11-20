// io.js — moving progress in and out of the tracker: export downloads the saved
// state as a JSON file, import reads such a file back. All client-side; nothing
// leaves the browser except the file the player chooses to save.

export function exportProgress(store) {
  const blob = new Blob([JSON.stringify(store.exportData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-legend-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgress(store, file) {
  const text = await file.text();
  const data = JSON.parse(text);
  store.importData(data);
}
