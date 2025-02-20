import { useCallback } from "react";
import { DropZone, BlockStack } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import { type RouteResponse } from '../../../shared/result';
import { useFiles } from "../../providers/FileContext";
import { useFetcherResult } from '../../hooks/public/useFetcherResult';

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

export type UploadFile = {
    id: string;
    file: File;
};

export const AutoFileDropZone = () => {
    const { addLocalFiles, completeUpload } = useFiles();
    const fetcher = useFetcher<RouteResponse<FileUploadRouteResponse>>();

    useFetcherResult({
        fetcher,
        onSubmitComplete: () => {
            // No-op - state handled in context
        },
        afterSuccess: (data) => {
            console.log('afterSuccess', data)
            completeUpload(data as FileUploadRouteResponse);
        },
    });

    const handleUpload = useCallback((media: UploadFile[]) => {
        const formData = new FormData();
        const localFiles: { filename: string; url: string; }[] = [];

        media.forEach((image) => {
            formData.append(image.id, image.file);
            formData.append(`id-${image.id}`, image.id);
            localFiles.push({
                filename: image.file.name,
                url: URL.createObjectURL(image.file),
            });
        });

        // Add local files to context first
        addLocalFiles(localFiles);

        // Then start upload
        fetcher.submit(formData, {
            method: "post",
            action: "/app/api/file-upload",
            encType: "multipart/form-data",
        });
    }, [fetcher, addLocalFiles]);

    const handleDrop = useCallback((_droppedFiles: File[], acceptedFiles: File[]) => {
        const acceptedFilesWithId = acceptedFiles.map((file: File) => ({
            file,
            id: crypto.randomUUID(),
        }));

        if (acceptedFilesWithId?.length) {
            handleUpload(acceptedFilesWithId);
        }
    }, [handleUpload]);

    return (
        <BlockStack gap="400">
            <DropZone onDrop={handleDrop} allowMultiple={false}>
                <DropZone.FileUpload
                    actionTitle="Add media"
                    actionHint="Drag and drop images, videos, 3D models, and files"
                />
            </DropZone>
        </BlockStack>
    );
};
