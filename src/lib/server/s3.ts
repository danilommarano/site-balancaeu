import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { randomUUID } from 'node:crypto';

const region = env.AWS_REGION || 'sa-east-1';
export const S3_BUCKET = env.S3_BUCKET || '';
export const S3_PUBLIC_BASE_URL = env.S3_PUBLIC_BASE_URL || `https://${S3_BUCKET}.s3.${region}.amazonaws.com`;

export const s3 = new S3Client({
	region,
	...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
		? {
				credentials: {
					accessKeyId: env.AWS_ACCESS_KEY_ID,
					secretAccessKey: env.AWS_SECRET_ACCESS_KEY
				}
			}
		: {})
});

export type UploadParams = {
	tenantId: string;
	category?: string;
	filename: string;
	contentType: string;
	body: Uint8Array | Buffer;
	visibility?: 'public' | 'private';
};

export type UploadResult = {
	s3Key: string;
	url: string;
};

export async function uploadToS3(params: UploadParams): Promise<UploadResult> {
	const { tenantId, category = 'general', filename, contentType, body, visibility = 'public' } = params;
	const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin';
	const safeName = `${randomUUID()}.${ext}`;
	const prefix = visibility === 'public' ? 'public' : 'private';
	const s3Key = `${prefix}/${tenantId}/${category}/${safeName}`;

	await s3.send(
		new PutObjectCommand({
			Bucket: S3_BUCKET,
			Key: s3Key,
			Body: body,
			ContentType: contentType,
			CacheControl: 'public, max-age=31536000, immutable'
		})
	);

	const url = `${S3_PUBLIC_BASE_URL}/${s3Key}`;
	return { s3Key, url };
}

export async function deleteFromS3(s3Key: string): Promise<void> {
	await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
}
