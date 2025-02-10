import {
    BlockStack,
    Modal,
    Filters,
    InlineStack,
    ChoiceList,
    Box,
} from "@shopify/polaris";
import { useFiles } from "./FileContext";
import { AutoFileDropZone } from "./AutoFileDropZone";
import { FileSelectGallery } from "./FileSelectGallery";

type FileSelectModalProps = {
    activator: JSX.Element;
};

export const FileSelectModal = ({ activator }: FileSelectModalProps) => {
    const { state, closeModal, setSearchTerm, setFileTypes, resetSelection } =
        useFiles();

    const filters = [
        {
            key: "fileType",
            label: "File type",
            filter: (
                <ChoiceList
                    title="File type"
                    titleHidden
                    choices={[
                        { label: "Images", value: "IMAGE" },
                        { label: "Videos", value: "VIDEO" },
                    ]}
                    selected={state.search.fileTypes}
                    onChange={setFileTypes}
                    allowMultiple
                />
            ),
            pinned: true,
        },
    ];

    return (
        <Modal
            activator={activator}
            open={state.isModalOpen}
            onClose={closeModal}
            title="Select file"
            size="large"
            primaryAction={{
                content: "Done",
                onAction: closeModal,
                disabled: state.selectedFileIds.length < 1,
            }}
            secondaryActions={[
                {
                    content: "Cancel",
                    onAction: () => {
                        resetSelection();
                        closeModal();
                    },
                },
            ]}
        >
            <div className={"upload__filters"}>
                <Box
                    paddingBlockStart="100"
                    paddingInline={"400"}
                    paddingBlockEnd={"200"}
                >
                    <InlineStack>
                        <Filters
                            queryValue={state.search.searchTerm}
                            filters={filters}
                            onQueryChange={setSearchTerm}
                            onQueryClear={() => setSearchTerm("")}
                            onClearAll={() => {
                                setFileTypes([]);
                                setSearchTerm("");
                            }}
                            closeOnChildOverlayClick={true}
                        />
                    </InlineStack>
                </Box>
            </div>
            <Box paddingBlockEnd="400" paddingInline={"400"}>
                <BlockStack gap="400">
                    <AutoFileDropZone />
                    <FileSelectGallery />
                </BlockStack>
            </Box>
        </Modal>
    );
};
