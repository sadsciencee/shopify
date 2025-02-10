import { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import { useFetcher } from '@remix-run/react';
import { useDirectAccess } from '../hooks/public/useDirectAccess';

import {
	type FileUploadRouteResponse,
	type PreviewMediaSource,
	type SearchFile,
	type ShopifyMediaContentType,
	type ShopifyMediaStatus,
	type MimeType,
	filenameFromPreviewUrl,
	type UploadedFile,
} from '../../shared/filePicker';

type FileTree = Record<string, UploadedFile>;

export type LocalFile = {
	id: string;
	filename: string;
	url: string;
	isUploading: boolean;
};

type SearchState = {
	sortKey: 'CREATED_AT' | 'FILENAME' | 'ID' | 'ORIGINAL_UPLOAD_SIZE' | 'RELEVANCE';
	sortDirection: 'ASC' | 'DESC';
	fileTypes: ('IMAGE' | 'VIDEO')[];
	searchTerm: string;
	results: FileSearchNode[];
	isLoading: boolean;
};

type FileProviderState = {
	savedFiles: FileTree;
	searchFiles: Record<string, SearchFile>;
	localFiles: Record<string, LocalFile>;
	selectedFileIds: string[];
	completedUploads: LocalFile[];
	isModalOpen: boolean;
	search: SearchState;
};

export type FileSearchNode = {
	__typename: string;
	createdAt: string;
	id: string;
	alt: string | null;
	mimeType: MimeType;
	status: ShopifyMediaStatus;
	filename: string | null;
	preview: {
		image: {
			id: string;
			url: string;
			altText: string | null;
		} | null;
	};
	sources: PreviewMediaSource[] | null;
	mediaContentType: ShopifyMediaContentType;
	url: string | null;
	image: {
		id: string;
		url: string;
		altText: string | null;
		width: number;
		height: number;
		urlRetina1: string | null;
		urlRetina2: string | null;
		urlRetina3: string | null;
		url1000: string | null;
		url1000Retina2: string | null;
		url1000Retina3: string | null;
		url1500: string | null;
		url1500Retina2: string | null;
		url1500Retina3: string | null;
	} | null;
	embedUrl: string | null;
};

type FileSelectionCallback = (file: { id: string }) => void;

type FileContextType = {
	// File Data Operations
	addLocalFiles: (files: { filename: string; url: string }[]) => void;
	completeUpload: (response: FileUploadRouteResponse) => void;

	// Search Operations
	setSearchTerm: (term: string) => void;
	setFileTypes: (types: ('IMAGE' | 'VIDEO')[]) => void;
	setSortKey: (key: SearchState['sortKey']) => void;
	setSortDirection: (direction: 'ASC' | 'DESC') => void;
	selectSearchFile: (file: FileSearchNode) => void;
	selectUploadedFile: (file: LocalFile) => void;

	// Selection Operations
	selectFile: (id: string) => void;
	deselectFile: (id: string) => void;
	resetSelection: () => void;
	subscribeToSelection: (callback: FileSelectionCallback) => () => void;

	// Modal Operations
	openModal: (selectedId?: string) => void;
	closeModal: () => void;

	// Getters
	getFileById: (id: string) => UploadedFile | SearchFile | LocalFile | undefined;

	getFileUrlById: (id: string) => string;

	getUploadingFiles: () => {
		id: string;
		filename: string;
		url: string;
		isUploading: true;
	}[];

	// State Access
	state: {
		selectedFileIds: string[];
		hasUploadingFiles: boolean;
		isModalOpen: boolean;
		completedUploads: LocalFile[];
		search: {
			results: FileSearchNode[];
			isLoading: boolean;
			searchTerm: string;
			fileTypes: ('IMAGE' | 'VIDEO')[];
			sortKey: SearchState['sortKey'];
			sortDirection: 'ASC' | 'DESC';
		};
	};
};

const cleanMediaImageId = (gid: string): string => {
	return gid.replace('gid://shopify/MediaImage/', '');
};

const createSearchQuery = (fileTypes: ('IMAGE' | 'VIDEO')[], searchTerm?: string): string => {
	/*const typeQuery =
        fileTypes.length === 0
            ? `(media_type:IMAGE OR media_type:VIDEO)`
            : `(${fileTypes.map((type) => `media_type:${type}`).join(" OR ")})`;*/

	const typeQuery = 'media_type:IMAGE';

	return searchTerm ? `${searchTerm} ${typeQuery}` : typeQuery;
};

const FileContext = createContext<FileContextType | null>(null);

export const FileProvider = ({
	children,
	initialFiles,
}: {
	children: ReactNode;
	initialFiles: FileTree;
}) => {
	const [state, setState] = useState<FileProviderState>({
		savedFiles: initialFiles,
		searchFiles: {},
		localFiles: {},
		selectedFileIds: [],
		isModalOpen: false,
		completedUploads: [],
		search: {
			sortKey: 'CREATED_AT',
			sortDirection: 'DESC',
			fileTypes: [],
			searchTerm: '',
			results: [],
			isLoading: false,
		},
	});

	const {
		executeQuery,
		loading,
		value: searchValue,
		resetQueryCache,
	} = useDirectAccess<{
		files: { nodes: FileSearchNode[] };
	}>();

	const [selectionCallbacks] = useState(() => new Set<FileSelectionCallback>());

	const subscribeToSelection = useCallback(
		(callback: FileSelectionCallback) => {
			selectionCallbacks.add(callback);
			return () => {
				selectionCallbacks.delete(callback);
			};
		},
		[selectionCallbacks],
	);

	const importFetcher = useFetcher();

	// Effect to execute search when params change
	useEffect(() => {
		if (!state.isModalOpen) return;

		void executeQuery({
			query: `query GetRecentFiles($query: String, $first: Int!, $sortKey: FileSortKeys, $reverse: Boolean) {
        files(query: $query, first: $first, sortKey: $sortKey, reverse: $reverse) {
          nodes {
            id
            __typename
            ... on MediaImage {
			mimeType
			status
			createdAt
			updatedAt
			mediaContentType
			preview {
                image {
                    id
                    url
                    altText
                }
			}
			image {
				url
				altText
				width
				height
				urlRetina1: url(transform: { maxWidth: 500, scale: 1 })
				urlRetina2: url(transform: { maxWidth: 500, scale: 2 })
				urlRetina3: url(transform: { maxWidth: 500, scale: 3 })
				url1000: url(transform: { maxWidth: 1000, scale: 1 })
				url1000Retina2: url(transform: { maxWidth: 1000, scale: 2 })
				url1000Retina3: url(transform: { maxWidth: 1000, scale: 3 })
				url1500: url(transform: { maxWidth: 1500, scale: 1 })
				url1500Retina2: url(transform: { maxWidth: 1500, scale: 2 })
				url1500Retina3: url(transform: { maxWidth: 1500, scale: 3 })
			}
		}
          }
        }
      }`,
			variables: {
				query: createSearchQuery(state.search.fileTypes, state.search.searchTerm),
				first: 250,
				sortKey: state.search.sortKey,
				reverse: state.search.sortDirection === 'DESC',
			},
		});
	}, [
		state.isModalOpen,
		state.search.searchTerm,
		state.search.fileTypes,
		state.search.sortKey,
		state.search.sortDirection,
		executeQuery,
	]);

	const getFileById = useCallback(
		(id: string) => {
			return state.savedFiles[id] || state.searchFiles[id] || state.localFiles[id];
		},
		[state],
	);

	const getFileUrlById = useCallback(
		(id: string) => {
			return getBestAvailableImageUrl(
				state.savedFiles[id] || state.searchFiles[id] || state.localFiles[id],
			);
		},
		[state],
	);

	const addLocalFiles = useCallback((files: { filename: string; url: string }[]) => {
		setState((prev) => ({
			...prev,
			localFiles: {
				...prev.localFiles,
				...Object.fromEntries(
					files.map(({ filename, url }) => [
						filename,
						{
							id: filename,
							filename,
							url,
							isUploading: true,
						},
					]),
				),
			},
		}));
	}, []);

	const completeUpload = useCallback((response: FileUploadRouteResponse) => {
		setState((prev) => {
			const newLocalFiles = { ...prev.localFiles };
			const newCompletedUploads = [...prev.completedUploads];
			response.uploadedFiles.forEach((file) => {
				const localFile = newLocalFiles[file.filename];
				if (localFile) {
					const update = {
						...localFile,
						id: file.id,
						isUploading: false,
					};
					newLocalFiles[file.filename] = update; // marks old as uploaded
					newLocalFiles[file.id] = update; // makes available by id
					newCompletedUploads.push(update);
				}
			});

			return {
				...prev,
				localFiles: newLocalFiles,
				completedUploads: newCompletedUploads,
			};
		});
	}, []);

	const mapSearchFileToInternal = (file: FileSearchNode): SearchFile | null => {
		// If no image data is present, skip this file
		if (!file.image) return null;

		return {
			id: cleanMediaImageId(file.id),
			filename: file.filename || '',
			mimeType: file.mimeType,
			mediaContentType: file.mediaContentType,
			status: file.status,
			altText: file.alt === null ? '' : file.alt,
			width: file.image.width,
			height: file.image.height,
			url: file.image.url,
			src_500_1: file.image.urlRetina1,
			src_500_2: file.image.urlRetina2,
			src_500_3: file.image.urlRetina3,
			src_1000_1: file.image.url1000,
			src_1000_2: file.image.url1000Retina2,
			src_1000_3: file.image.url1000Retina3,
			src_1500_1: file.image.url1500,
			src_1500_2: file.image.url1500Retina2,
			src_1500_3: file.image.url1500Retina3,
		};
	};
	const getUploadingFiles = useCallback(() => {
		return Object.values(state.localFiles)
			.filter((file): file is typeof file & { isUploading: true } => file.isUploading)
			.map((file) => ({
				id: file.id,
				filename: file.filename,
				url: file.url,
				isUploading: true as const,
			}));
	}, [state.localFiles]);

	const selectSearchFile = useCallback(
		(file: FileSearchNode) => {
			const searchFile = mapSearchFileToInternal(file);
			if (!searchFile) return;

			const cleanId = cleanMediaImageId(file.id);
			setState((prev) => ({
				...prev,
				searchFiles: {
					...prev.searchFiles,
					[cleanId]: searchFile,
				},
				selectedFileIds: [cleanId],
			}));

			// Notify subscribers
			selectionCallbacks.forEach((callback) => callback(file));

			importFetcher.submit(
				JSON.stringify({
					id: cleanId,
					filename: filenameFromPreviewUrl(file)?.filename ?? 'New File',
				}),
				{
					method: 'POST',
					encType: 'application/json',
					action: '/app/api/file-import',
					preventScrollReset: true,
				},
			);
		},
		[selectionCallbacks],
	);

	const selectUploadedFile = useCallback(
		(file: LocalFile) => {
			const cleanId = cleanMediaImageId(file.id);
			setState((prev) => ({
				...prev,
				selectedFileIds: [cleanId],
			}));

			selectionCallbacks.forEach((callback) => callback(file));

			importFetcher.submit(
				JSON.stringify({
					id: cleanId,
					filename: filenameFromPreviewUrl(file)?.filename ?? 'New File',
				}),
				{
					method: 'POST',
					encType: 'application/json',
					action: '/app/api/file-import',
					preventScrollReset: true,
				},
			);
		},
		[selectionCallbacks],
	);

	const deselectFile = useCallback(
		(id: string) => {
			const cleanId = cleanMediaImageId(id);
			setState((prev) => ({
				...prev,
				selectedFileIds: [],
			}));
			selectionCallbacks.forEach((callback) => callback({ id: cleanId }));
		},
		[selectionCallbacks],
	);

	const closeModal = useCallback(() => {
		setState((prev) => ({
			...prev,
			isModalOpen: false,
			selectedFileIds: [], // Clear selections
		}));
	}, []);

	return (
		<FileContext.Provider
			value={{
				addLocalFiles,
				completeUpload,
				setSearchTerm: (term: string) =>
					setState((prev) => ({
						...prev,
						search: { ...prev.search, searchTerm: term },
					})),
				setFileTypes: (types: ('IMAGE' | 'VIDEO')[]) =>
					setState((prev) => ({
						...prev,
						search: { ...prev.search, fileTypes: types },
					})),
				setSortKey: (key: SearchState['sortKey']) =>
					setState((prev) => ({
						...prev,
						search: { ...prev.search, sortKey: key },
					})),
				setSortDirection: (direction: 'ASC' | 'DESC') =>
					setState((prev) => ({
						...prev,
						search: { ...prev.search, sortDirection: direction },
					})),
				selectSearchFile,
				selectUploadedFile,
				selectFile: (id: string) =>
					setState((prev) => ({
						...prev,
						selectedFileIds: [...prev.selectedFileIds, id],
					})),
				deselectFile,
				resetSelection: () =>
					setState((prev) => ({
						...prev,
						selectedFileIds: [],
					})),
				subscribeToSelection,
				openModal: (selectedId?: string) =>
					setState((prev) => ({
						...prev,
						selectedFileIds: selectedId ? [selectedId] : [],
						isModalOpen: true,
					})),
				closeModal,
				getFileById,
				getFileUrlById,
				getUploadingFiles,
				state: {
					selectedFileIds: state.selectedFileIds,
					hasUploadingFiles: Object.values(state.localFiles).some((f) => f.isUploading),
					completedUploads: state.completedUploads,
					isModalOpen: state.isModalOpen,
					search: {
						...state.search,
						results: searchValue?.files.nodes ?? [],
						isLoading: loading,
					},
				},
			}}
		>
			{children}
		</FileContext.Provider>
	);
};
export const useFiles = () => {
	const context = useContext(FileContext);
	if (!context) {
		throw new Error('useFiles must be used within a FileProvider');
	}
	return context;
};

// helpers to get url

type ImageSource = SearchFile | LocalFile;

// Type guards
const isLocalFile = (file: ImageSource): file is LocalFile => {
	return 'isUploading' in file;
};

const isUploadedFile = (file: ImageSource): file is UploadedFile => {
	return 'src_500_3' in file || 'src_500_2' in file || 'src_500_1' in file;
};

function getBestAvailableImageUrl(file: ImageSource | undefined): string {
	if (!file) {
		console.error('No file provided to getBestAvailableImageUrl');
		return '';
	}
	// Local file has only url
	if (isLocalFile(file)) {
		return file.url;
	}

	// Uploaded file has retina options
	if (isUploadedFile(file)) {
		if (file.src_500_3) return file.src_500_3;
		if (file.src_500_2) return file.src_500_2;
		if (file.src_500_1) return file.src_500_1;
	}

	// SearchFile or fallback for UploadedFile
	return file.url;
}
