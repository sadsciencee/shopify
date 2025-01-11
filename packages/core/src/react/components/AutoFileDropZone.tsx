import { useCallback } from "react";
import { DropZone, BlockStack } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import type { FileUploadRouteResponse } from "~/routes/app.api.file-upload";
import { getUniqueId, type RouteResponse } from '@ucoast/shared';
import { useActionResult } from '~/hooks/useActionResult';
import { useFiles } from "./FileContext";

export type UploadFile = {
    id: string;
    file: File;
};

export const AutoFileDropZone = () => {
    const { addLocalFiles, completeUpload } = useFiles();
    const fetcher = useFetcher<RouteResponse<FileUploadRouteResponse>>();

    useActionResult({
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
            id: getUniqueId(),
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
