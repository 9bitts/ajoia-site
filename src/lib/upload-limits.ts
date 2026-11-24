export const IMAGE_MAX_BYTES = 20 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_MAX_LABEL = "20 MB";
export const VIDEO_MAX_LABEL = "8 MB";

export const BODY_TOO_LARGE = `O arquivo passou do limite. A foto pode ter até ${IMAGE_MAX_LABEL} e o vídeo até ${VIDEO_MAX_LABEL}. Escolha um arquivo menor e tente de novo.`;

function megabytes(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",");
}

function isVideo(file: { type: string; name: string }) {
  return file.type.startsWith("video/") || file.type === "video/mp4" || file.type === "video/webm";
}

/** Mensagem quando o arquivo não cabe. Vazio se o tamanho está dentro do limite. */
export function fileTooLargeMessage(file: { type: string; name: string; size: number }) {
  const video = isVideo(file);
  const max = video ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (file.size <= max) return "";
  if (video) {
    return `O vídeo “${file.name}” tem ${megabytes(file.size)} MB. O máximo para enviar é ${VIDEO_MAX_LABEL}. Para um vídeo maior, cole o link do YouTube.`;
  }
  return `A foto “${file.name}” tem ${megabytes(file.size)} MB. O máximo é ${IMAGE_MAX_LABEL}. Escolha uma foto menor e envie de novo.`;
}
