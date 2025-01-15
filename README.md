# @sadsciencee/shopify-react

A collection of full stack patterns that I'm
tired of copy/pasting between apps for my clients.

The functionality enabled by this library assumes a
Shopify app with React and Polaris. A server-side framework like Remix
will be required for modal and filepicker functionality.

The following features are required for client side
fetching in the File Picker and Autocomplete Search. Please
make sure to upgrade your app to utilize these before attempting
to add this library.

- [direct access API](https://shopify.dev/docs/api/app-bridge-library)
- [App Bridge v4](https://shopify.dev/docs/api/app-bridge-library)

## Modals

React-friendly implementation of App Bridge V4 Modals, including Max Modals

### Basic Implementation

```typescript jsx
<ModalV4
	titleBar={{
		title: 'Products',
		primaryButton: {
			label: 'Delete',
			disabled: false,
		},
	}}
	id={'uniqueId'}
	route={'products'}
	variant="max" // 'small' | 'base' | 'large' | 'max'
	opener={({ onClick }) => <Button onClick={onClick}>Open Modal</Button>}
/>
```

### Advanced Implementation (all options)

```typescript jsx
// optionally create a shared message type that you use in both the portal and the parent. 
// this can contain whatever you want, shouldReply and shouldClose are not required fields

type ModalMessageType = {
	whatever: 'you',
    want: 'here',
    shouldReply: boolean,
    shouldClose: boolean,
}
const onMessage = useCallback((data: ModalMessageType, {close, reply}) => {
	// the provided reply callback allows you to respond to messages. this can be helpful if are triggering 
    // some operation from the modal that requires a success/fail response from the parent 
	if (shouldReply) {
		reply({info: 'no problem! here is the information'})
    }
	// if you want to auto-close the modal once the information has been passed from 
	if (shouldClose) {
		close()
    }
}, []);

<ModalV4
	titleBar={{
		title: 'Products',
		primaryButton: {
			label: 'Delete',
			disabled: false,
		},
	}}
	id={'hehehoho'}
	route={'hello'}
	variant="max"
    opener={({ onClick }) => <Button onClick={onClick}>Open Modal</Button>}
	sharedState={{
		howdy: "partner"
	}}
    onMessage={onMessage}
/>
```

## File Picker

WIP

## Autocomplete Search

Coming soon :)
