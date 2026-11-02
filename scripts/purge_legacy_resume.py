"""Best-effort removal of retired resume versions and CloudFront caches."""
import json
import os
import time

import boto3
from botocore.exceptions import ClientError

bucket = os.environ["AWS_S3_BUCKET"]
retired = "docs/haydencardwellcybersecurityengineer-pub.pdf"
s3 = boto3.client("s3")
report = {"retired_object_deleted": False, "versions_deleted": 0, "invalidations": [], "limitations": []}

s3.delete_object(Bucket=bucket, Key=retired)
report["retired_object_deleted"] = True
try:
    objects = []
    for page in s3.get_paginator("list_object_versions").paginate(Bucket=bucket, Prefix=retired):
        for item in page.get("Versions", []) + page.get("DeleteMarkers", []):
            if item["Key"] == retired:
                objects.append({"Key": retired, "VersionId": item["VersionId"]})
    for start in range(0, len(objects), 1000):
        response = s3.delete_objects(Bucket=bucket, Delete={"Objects": objects[start:start + 1000], "Quiet": True})
        if response.get("Errors"):
            raise RuntimeError("Some legacy object versions could not be deleted")
    report["versions_deleted"] = len(objects)
except ClientError as error:
    report["limitations"].append("S3 version purge: " + error.response["Error"]["Code"])

cloud = boto3.client("cloudfront")
try:
    for page in cloud.get_paginator("list_distributions").paginate():
        for distribution in page.get("DistributionList", {}).get("Items", []):
            aliases = distribution.get("Aliases", {}).get("Items", [])
            origins = distribution.get("Origins", {}).get("Items", [])
            matches = "haydencardwell.com" in aliases or "www.haydencardwell.com" in aliases
            matches = matches or any(origin.get("DomainName", "").startswith(bucket + ".") for origin in origins)
            if matches:
                result = cloud.create_invalidation(
                    DistributionId=distribution["Id"],
                    InvalidationBatch={"Paths": {"Quantity": 1, "Items": ["/*"]}, "CallerReference": str(time.time_ns())},
                )
                item = {"distribution": distribution["Id"], "invalidation": result["Invalidation"]["Id"]}
                report["invalidations"].append(item)
                cloud.get_waiter("invalidation_completed").wait(
                    DistributionId=item["distribution"], Id=item["invalidation"],
                    WaiterConfig={"Delay": 10, "MaxAttempts": 24},
                )
                item["completed"] = True
    if not report["invalidations"]:
        report["limitations"].append("No matching CloudFront distribution was visible to the deployment account")
except ClientError as error:
    report["limitations"].append("CloudFront cache purge: " + error.response["Error"]["Code"])

print("PRIVACY_CLEANUP_RESULT " + json.dumps(report))
