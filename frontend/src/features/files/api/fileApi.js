import { apiClient } from '../../../services/apiClient';

function filenameFromDisposition(header, fallback) {
  if (!header) return fallback;
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch) return decodeURIComponent(utfMatch[1]);
  const quoted = header.match(/filename="([^"]+)"/i);
  if (quoted) return quoted[1];
  const plain = header.match(/filename=([^;]+)/i);
  return plain ? plain[1].trim() : fallback;
}

export const fileApi = {
  listByProject: (projectId, params) => apiClient.get(`/projects/${projectId}/files`, { params }),
  listAll: () => apiClient.get('/files'),
  upload: (projectId, formData, onUploadProgress) =>
    apiClient.post(`/projects/${projectId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  download: async (id, fallbackName = 'download') => {
    const response = await apiClient.get(`/files/${id}/download`, {
      responseType: 'blob',
      rawResponse: true,
    });
    const blob = response.data;
    if (blob?.type === 'application/json') {
      const text = await blob.text();
      const payload = JSON.parse(text);
      throw new Error(payload.message || 'Unable to download the file.');
    }
    const filename = filenameFromDisposition(response.headers['content-disposition'], fallbackName);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  },
  remove: (id) => apiClient.delete(`/files/${id}`),
};
