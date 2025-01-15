# @sadsciencee/shopify

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


## Installation

```bash
pnpm add @sadsciencee/shopify
```

## Requirements

- Node.js 18+
- React 18+
- Shopify App Bridge V4
- Direct Access API enabled
- Runtime: Node.js or Cloudflare Workers

### Required
```bash
@shopify/app-bridge-react@^4.1.6
@shopify/polaris@^12.0.0
react@^18.2.0
react-dom@^18.2.0
````

## API Reference

### Modal

App Bridge V4 handles modals through native iframes, as opposed to the previous version which allowed 
React Portals. As a result there are some fairly finicky requirements to enable 
max modals or complex modals. You can't pass in initial state, or callbacks, bi-directional communication
is a *whole thing*

Not to fear though. This library takes care of most of that. There are still a few setup steps that
can't be avoided.

#### 1. Modal Root Route

Create a catch-all `/modal` route that renders server side. Copy your `/routes/app.tsx` file to `/routes/modal.tsx`, but remove the `<NavMenu>` component (App Bridge NavMenu conflicts with modals).

See `apps/example/app/routes/modal.tsx` for a working example you can copy.

#### 2. Set Up Modal Stub

Here is a super basic implementation.

```typescript jsx
import { ModalV4 } from '@sadsciencee/shopify/react';
<ModalV4
	/**
    * this should be the initial state of your title bar. You can update the disabled status and even hide/show buttons 
    * from your modal route with the `useParent` hook in step 3 
    */ 
	titleBar={{
		title: 'Products',
		primaryButton: {
			label: 'Save',
			disabled: true,
		},
        secondaryButton: {
            label: 'Reset',
            disabled: true,
        },
	}}
	/**
	* id and route are coupled to the id and route in step 3 
    */
	id={'uniqueId'}
	route={'products'}
	variant="max" // 'small' | 'base' | 'large' | 'max'
	/**
    * Render function for modal trigger element.
    */
	opener={({ onClick }) => <Button onClick={onClick}>Open Modal</Button>}
/>
```

#### 3. Individual Modal Routes

Create routes for each modal using the pattern `modal.modal-type.$id.tsx`. 
Here's a remix route file you can copy/paste. If you are using Next.js, I'm sure you'll figure it out.

```typescript jsx
import { BlockStack, Box, Card, Layout, Link, List, Page, Text } from '@shopify/polaris';
import { useParent } from '@sadsciencee/shopify/react';
import { useCallback } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const id = params.id ?? 'auto'
	return { id };
};

export default function YourModal() {
    const loaderData = useLoaderData<typeof loader>();
    /**
     * Pass in callbacks `onPrimaryAction` and `onSecondaryAction` so you can respond to
     * clicks from the buttons in the modal wrapper.
     */
    const onPrimaryAction = useCallback(() => {
        console.log('Primary Button Clicked');
    }, []);
    const onSecondaryAction = useCallback(() => {
        console.log('Secondary Button Clicked');
    }, [])
    /** 
    * `useParent` will return the following object which you can use to interact with the parent
    */
    const {
        /**
         * Send a message to the parent frame.
         * @example sendMessage({ userEmail: 'david@ucoastweb.com' });
         */
        sendMessage,
        /**
         * The initial state of the parent frame, at the time the modal was loaded.
         */
        parentState,
        /**
         * The initial state of the title bar in the parent frame, at the time the modal was loaded.
         */
        titleBarState,
        /**
         * Modify the title bar state - use this to change 'disabled' status or hide/remove buttons
         * This will completely override the title bar state, so make sure to pass in the existing state along with your changes.
         * @example setTitleBarState({ ...titleBarState, primaryButton: { disabled: false, label: titleBarState.primaryButton.label } });
         */
        setTitleBarState,
        /**
         * Whether the parent frame has finished loading the initial state. You may or may not
         * care about this.
         */
        loaded,
    } = useParent({
        id: loaderData.id,
        route: 'hello',
        onPrimaryAction,
        onSecondaryAction,
    });
    return (
        <Card>
            <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                    The app template comes with an additional page which demonstrates how to create
                    multiple pages within app navigation using{' '}
                    <Link
                        url="https://shopify.dev/docs/apps/tools/app-bridge"
                        target="_blank"
                        removeUnderline
                    >
                        App Bridge
                    </Link>
                    .
                </Text>
                <Text as="p" variant="bodyMd">
                    To create your own page and have it show up in the app navigation, add a page inside{' '}
                    <Code>app/routes</Code>, and a link to it in the <Code>&lt;NavMenu&gt;</Code>{' '}
                    component found in <Code>app/routes/app.jsx</Code>.
                </Text>
                <Box></Box>
            </BlockStack>
        </Card>
    );
}
````

Then add 

The main catch here is that your modal itself is going to 
be a separate route in your application. There are a few benefits here, since
if you are using Remix you can pass extra information into your modal without hoaving to 

##### Modal Opener
```typescript jsx
import { ModalV4 } from '@sadsciencee/shopify/react';
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

##### Inside Modal Route

#### Communicating With Your Modal

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
    id={'uniqueId'}
    route={'products'}
	variant="max"
    opener={({ onClick }) => <Button onClick={onClick}>Open Modal</Button>}
	sharedState={{
		howdy: "partner"
	}}
    onMessage={onMessage}
/>
```

### File Picker

Coming soon :)

### Autocomplete Search

Coming soon :)
