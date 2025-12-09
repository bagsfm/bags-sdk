/**
 * Image processing utilities for form-data compatibility
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ImageInput = File | Blob | Buffer | { value: Buffer; options: { filename: string; contentType: string } } | any;

export interface ImageFormDataOptions {
	filename?: string;
	contentType?: string;
}

/**
 * Converts various image input formats to a format compatible with form-data in Node.js
 *
 * @param image - The image input (File, Blob, Buffer, or other supported formats)
 * @param options - Optional filename and content type overrides
 * @returns Promise<{buffer: Buffer, filename: string, contentType: string}> - Data for form-data.append()
 */
export async function prepareImageForFormData(image: ImageInput, options: ImageFormDataOptions = {}): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
	// More robust type detection
	const isFile = image instanceof File || (image && typeof image === 'object' && 'name' in image && 'arrayBuffer' in image);
	const isBlob = image instanceof Blob || (image && typeof image === 'object' && 'arrayBuffer' in image && 'type' in image && !('name' in image));
	const isBlobLike = image && typeof image === 'object' && typeof image.arrayBuffer === 'function';

	if (isFile) {
		// Handle File objects
		try {
			const arrayBuffer = await image.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			return {
				buffer,
				filename: options.filename || image.name || 'token-image.png',
				contentType: options.contentType || image.type || 'image/png',
			};
		} catch (error) {
			console.error('Error processing File object:', error);
			throw new Error(`Failed to process File object: ${error instanceof Error ? error.message : String(error)}`);
		}
	} else if (isBlob || isBlobLike) {
		// Handle Blob objects with more robust conversion
		try {
			let buffer: Buffer;

			if (typeof image.arrayBuffer === 'function') {
				const arrayBuffer = await image.arrayBuffer();
				buffer = Buffer.from(arrayBuffer);
			} else if (typeof image.stream === 'function') {
				// Fallback for environments where arrayBuffer() isn't available
				const stream = image.stream();
				const chunks: Uint8Array[] = [];
				const reader = stream.getReader();

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					chunks.push(value);
				}

				const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
				const merged = new Uint8Array(totalLength);
				let offset = 0;
				for (const chunk of chunks) {
					merged.set(chunk, offset);
					offset += chunk.length;
				}
				buffer = Buffer.from(merged);
			} else {
				throw new Error('Blob object does not have arrayBuffer() or stream() method');
			}

			return {
				buffer,
				filename: options.filename || 'token-image.png',
				contentType: options.contentType || image.type || 'image/png',
			};
		} catch (error) {
			console.error('Error processing Blob object:', error);
			throw new Error(`Failed to process Blob object: ${error instanceof Error ? error.message : String(error)}`);
		}
	} else if (Buffer.isBuffer(image)) {
		// Handle Buffer objects
		return {
			buffer: image,
			filename: options.filename || 'token-image.png',
			contentType: options.contentType || 'image/png',
		};
	}

	// For legacy support - if it's already in the old format, extract the buffer
	if (image && typeof image === 'object' && 'value' in image && 'options' in image) {
		return {
			buffer: image.value,
			filename: image.options.filename || 'token-image.png',
			contentType: image.options.contentType || 'image/png',
		};
	}

	// For other formats, assume it's already a Buffer or compatible
	if (Buffer.isBuffer(image)) {
		return {
			buffer: image,
			filename: 'token-image.png',
			contentType: 'image/png',
		};
	}

	throw new Error(`Unsupported image format: ${typeof image}`);
}

/**
 * Detects the type of image input
 *
 * @param image - The image input to check
 * @returns string - The detected type
 */
export function detectImageInputType(image: ImageInput): string {
	if (image instanceof File) return 'File';
	if (image instanceof Blob) return 'Blob';
	if (Buffer.isBuffer(image)) return 'Buffer';
	if (image && typeof image === 'object' && 'value' in image && 'options' in image) return 'FormDataObject';

	if (image && typeof image === 'object') {
		const hasArrayBuffer = typeof image.arrayBuffer === 'function';
		const hasStream = typeof image.stream === 'function';
		const hasType = 'type' in image;
		const hasName = 'name' in image;

		if (hasArrayBuffer && hasType && hasName) return 'File-like';
		if (hasArrayBuffer && hasType && !hasName) return 'Blob-like';
		if (hasArrayBuffer || hasStream) return 'Stream-like';

		return `Object(${Object.keys(image).join(', ')})`;
	}

	return `${typeof image}`;
}
