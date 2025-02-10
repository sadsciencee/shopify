import { InlineGrid, Image, Box, InlineStack, Text, Icon } from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';
import { useFiles, type FileSearchNode, type LocalFile } from '../../providers/FileContext';
import { filenameFromPreviewUrl } from '../../../shared/filePicker';

type FilePreviewProps = {
	url?: string | null;
	altText?: string | null;
};

const FilePreview = ({ url, altText }: FilePreviewProps) => (
	<Box padding="100" borderRadius="200" overflowX="hidden" overflowY="hidden" shadow="border-inset">
		<Box borderRadius="100" width="100px" minHeight="100px" overflowX="hidden" overflowY="hidden">
			{url ? (
				<Image
					source={url}
					alt={altText ?? ''}
					width={'100%'}
					height={'100%'}
					style={{
						display: 'block',
						objectFit: 'cover',
						width: '100%',
						height: '100%',
						aspectRatio: '1',
					}}
				/>
			) : (
				<div
					style={{
						height: '100px',
						width: '100px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon source={NoteIcon} />
				</div>
			)}
		</Box>
	</Box>
);

type FileMetadataProps = {
	filename: string;
	extension: string;
	isUploading?: boolean;
};

const FileMetadata = ({ filename, extension, isUploading }: FileMetadataProps) => (
	<Box paddingBlock="150" maxWidth="100px" overflowX="hidden">
		<Box paddingBlockStart="100" paddingInline="0" maxWidth="100%" overflowX="hidden">
			<Text as="p" variant="bodySm" alignment="center" breakWord={false} truncate={true}>
				{isUploading ? 'Uploading...' : filename}
			</Text>
		</Box>
		<Box>
			<Text as="p" variant="bodySm" tone="subdued" alignment="center">
				{extension.toUpperCase()}
			</Text>
		</Box>
	</Box>
);

type FileThumbnailProps = {
	file:
		| FileSearchNode
		| { id: string; url: string; filename: string; isUploading: true }
		| LocalFile;
	selected: boolean;
	onSelect?: () => void;
};

const FileThumbnail = ({ file, selected, onSelect }: FileThumbnailProps) => {
	const { filename, extension } =
		'isUploading' in file || file.url === null
			? { filename: file.filename, extension: 'jpg' }
			: filenameFromPreviewUrl(file, '_250x250_crop_center');

	return (
		<button
			onClick={onSelect}
			className={`hover-box semantic-button ${selected ? 'selected' : ''}`}
			title={`${selected ? 'Deselect' : 'Select'} ${filename}`}
			type={'button'}
		>
			<InlineStack align="center">
				<Box>
					<FilePreview
						url={'isUploading' in file ? file.url : file.preview.image?.url}
						altText={'isUploading' in file ? 'Uploading...' : file.preview.image?.altText}
					/>
					<FileMetadata
						filename={filename}
						extension={extension}
						isUploading={'isUploading' in file && file.isUploading}
					/>
				</Box>
			</InlineStack>
		</button>
	);
};

export const FileSelectGallery = () => {
	const { state, selectSearchFile, deselectFile, getUploadingFiles, selectUploadedFile } =
		useFiles();

	const fileIdSet = new Set(state.selectedFileIds);
	const uploadingFiles = getUploadingFiles();

	return (
		<InlineGrid gap="100" columns={{ xs: 3, md: 4, lg: 6 }}>
			{/* Uploading files */}
			{uploadingFiles.map((file) => (
				<FileThumbnail key={`uploading_${file.id}`} file={file} selected={true} />
			))}

			{/* Search results */}
			{state.completedUploads.map((file) => {
				const cleanId = file.id.replace('gid://shopify/MediaImage/', '');
				const selected = fileIdSet.has(cleanId);

				return (
					<FileThumbnail
						key={cleanId}
						file={file}
						selected={selected}
						onSelect={() => {
							if (selected) {
								deselectFile(cleanId);
							} else {
								selectUploadedFile(file);
							}
						}}
					/>
				);
			})}
			{state.search.results.map((file) => {
				const cleanId = file.id.replace('gid://shopify/MediaImage/', '');
				const selected = fileIdSet.has(cleanId);

				return (
					<FileThumbnail
						key={cleanId}
						file={file}
						selected={selected}
						onSelect={() => {
							if (selected) {
								deselectFile(cleanId);
							} else {
								selectSearchFile(file);
							}
						}}
					/>
				);
			})}
		</InlineGrid>
	);
};
