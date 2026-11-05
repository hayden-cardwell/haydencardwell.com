"""Refresh this website's CloudFront cache after deploying to S3."""
import json
import subprocess


def aws(*args):
    result = subprocess.run(
        ["aws", *args, "--output", "json"], check=True, capture_output=True, text=True
    )
    return json.loads(result.stdout)


def main():
    distributions = aws("cloudfront", "list-distributions")
    matching = [
        distribution["Id"]
        for distribution in distributions.get("DistributionList", {}).get("Items", [])
        if {"haydencardwell.com", "www.haydencardwell.com"}
        & set(distribution.get("Aliases", {}).get("Items", []))
    ]
    if not matching:
        raise RuntimeError("No CloudFront distribution found for haydencardwell.com")
    for distribution_id in matching:
        result = aws(
            "cloudfront", "create-invalidation",
            "--distribution-id", distribution_id, "--paths", "/*",
        )
        invalidation_id = result["Invalidation"]["Id"]
        print(f"Refreshing CloudFront distribution {distribution_id}: {invalidation_id}", flush=True)
        subprocess.run(
            ["aws", "cloudfront", "wait", "invalidation-completed",
             "--distribution-id", distribution_id, "--id", invalidation_id],
            check=True,
        )
        print(f"CloudFront cache refreshed: {distribution_id}", flush=True)


if __name__ == "__main__":
    main()
