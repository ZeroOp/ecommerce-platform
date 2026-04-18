package com.redstore.product.service;

/**
 * Builds public, static object URLs for image buckets.
 *
 * <p>Product images, brand logos, and category icons live under prefixes that
 * are configured with an anonymous read-only bucket policy on MinIO (see
 * {@code infra/k8s/s3-storage/minio-depl.yaml}). That means clients can fetch
 * them directly at a stable URL — there is no need to presign every read.
 *
 * <p>The method is intentionally tolerant of legacy data: values that already
 * start with {@code http://} or {@code https://} are returned unchanged, which
 * keeps old rows working during the transition from keys to URLs.
 */
final class PublicObjectUrl {

    private PublicObjectUrl() {
    }

    static String build(String endpoint, String bucket, String keyOrUrl) {
        if (keyOrUrl == null || keyOrUrl.isBlank()) {
            return null;
        }
        String value = keyOrUrl.trim();
        if (value.startsWith("http://") || value.startsWith("https://")) {
            return value;
        }
        String base = stripTrailingSlash(endpoint);
        String cleanBucket = trimSlashes(bucket);
        String cleanKey = stripLeadingSlash(value);
        return base + "/" + cleanBucket + "/" + cleanKey;
    }

    private static String stripTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        int end = value.length();
        while (end > 0 && value.charAt(end - 1) == '/') {
            end--;
        }
        return value.substring(0, end);
    }

    private static String stripLeadingSlash(String value) {
        int start = 0;
        while (start < value.length() && value.charAt(start) == '/') {
            start++;
        }
        return value.substring(start);
    }

    private static String trimSlashes(String value) {
        return stripLeadingSlash(stripTrailingSlash(value));
    }
}
