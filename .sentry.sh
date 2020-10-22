sentry-cli releases --org elastos new -p wallet default --finalize
sentry-cli releases --org elastos -p wallet files default upload-sourcemaps www/ --rewrite --strip-common-prefix
