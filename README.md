# haydencardwell.com

This repo holds all the files that are used for [my static website in AWS](https://haydencardwell.com "my static website in AWS"). 

The files themselves are [synced into an S3 bucket using GitHub actions](.github/workflows/ImprovedS3Sync.yml "synced into an S3 bucket using GitHub actions"), and then a CloudFront distribution is used to serve them with TLS.

If you wanted to, I think you could get fancy and say this is a basic form of CI/CD, but I really just set this up because I was tired of not being able to easily update my personal website without downloading and re-uploading the static files. 
