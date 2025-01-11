type FileUploadResult = {
    success: boolean;
    file?: File;
    error?: string;
};

export type PreviewMediaSource = {
    format: "mp4" | "m3u8";
    mimeType: "application/x-mpegURL" | "video/mp4";
    url: string;
    width: number;
};

export type MimeType =
// Images
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp"
    | "image/svg+xml"

    // Audio
    | "audio/mpeg"
    | "audio/wav"
    | "audio/ogg"

    // Video
    | "video/mp4"
    | "video/webm"
    | "video/ogg"

    // Documents
    | "application/pdf"
    | "application/msword"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "application/vnd.ms-excel"
    | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    // Web
    | "text/html"
    | "text/css"
    | "text/javascript"
    | "application/json"
    | "application/xml"

    // Archives
    | "application/zip"
    | "application/x-7z-compressed"
    | "application/x-tar"
    | "application/x-rar-compressed";

export type ShopifyMediaContentType =
    | "EXTERNAL_VIDEO"
    | "IMAGE"
    | "MODEL_3D"
    | "VIDEO";

export type ShopifyMediaStatus =
    | "FAILED"
    | "PROCESSING"
    | "READY"
    | "UPLOADED";

type MediaContentType = 'IMAGE' | 'VIDEO' | 'MODEL_3D' | 'EXTERNAL_VIDEO';

type FileStatus = 'FAILED' | 'PROCESSING' | 'READY' | 'UPLOADED';

export type SearchFile = {
    id: string;
    filename: string;
    mimeType: MimeType;
    mediaContentType: MediaContentType;
    status: FileStatus;
    altText: string | null;
    width: number | null;
    height: number | null;
    url: string;
    src_500_1: string | null;
    src_500_2: string | null;
    src_500_3: string | null;
    src_1000_1: string | null;
    src_1000_2: string | null;
    src_1000_3: string | null;
    src_1500_1: string | null;
    src_1500_2: string | null;
    src_1500_3: string | null;
}

export type UploadedFile = {
    id: string;
    filename: string;
    mimeType: MimeType;
    mediaContentType: MediaContentType;
    status: "UPLOADED";
    altText: string | null;
    width: number | null;
    height: number | null;
    url: string;
    src_500_1: string;
    src_500_2: string | null;
    src_500_3: string | null;
    src_1000_1: string | null;
    src_1000_2: string | null;
    src_1000_3: string | null;
    src_1500_1: string | null;
    src_1500_2: string | null;
    src_1500_3: string | null;
}

export type FileUploadRouteResponse = {
    uploadedFiles: {
        id: string;
        filename: string;
        status: "FAILED" | "PROCESSING" | "READY" | "UPLOADED";
    }[];
    blockRevalidation: boolean;
    errors: {
        filename: string | undefined;
        error: string | undefined;
    }[];
};

export function filenameFromPreviewUrl(
    file: {
        __typename: string;
        filename: string | null;
        sources: PreviewMediaSource[] | null;
        url: string;
        image: {
            id: string;
            url: string;
        } | null;
        embedUrl?: string;
    },
    cropString?: string,
): {
    filename: string;
    extension: string;
} {
    // thanks to David Tierney from partner slack for this part (dt052901@gmail.com)
    let fileUrl = null;
    if (file.__typename === "GenericFile") {
        fileUrl = file.url;
    } else if (file.__typename === "MediaImage") {
        fileUrl = file.image?.url;
    } else if (file.__typename === "Video") {
        if (file.url) {
            fileUrl = file.url;
        } else {
            return {
                filename: file.filename ?? "",
                extension: "mp4",
            };
        }
    } else if (file.__typename === "Model3d") {
        return {
            filename: file.filename ?? "",
            extension: "",
        };
    } else if (file.__typename === "ExternalVideo") {
        return {
            filename: file.embedUrl ?? "",
            extension: file.embedUrl?.includes("youtube") ? "YOUTUBE" : "VIMEO",
        };
    }
    if (!fileUrl)
        return {
            filename: "",
            extension: "",
        };
    const parts = fileUrl.split("/files/");
    if (parts.length < 2) {
        return {
            filename: "",
            extension: "",
        };
    }
    const last_part = parts[parts.length - 1];
    const splitByQuery = last_part.split("?");

    const filenameWithExt = cropString
        ? splitByQuery[0].replace(cropString, "")
        : splitByQuery[0];
    const splitByDot = filenameWithExt.split(".");
    return {
        filename: splitByDot[0] ?? "",
        extension: splitByDot[1] ?? "",
    };
}
