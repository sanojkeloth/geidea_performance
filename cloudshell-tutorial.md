# Redeploy Geidea Dashboard

This tutorial pulls the latest code from this branch, rebuilds the Docker
image with Cloud Build, and re-deploys it to the existing Cloud Run service.

It reuses the **DASH_PASSWORD** that's already on the running service, so
you won't be prompted again.

## Step 1 — Run the redeploy

Click the **Copy to Cloud Shell** icon on the right of the box below to run
it instantly in the terminal:

```bash
bash redeploy.sh
```

That's it. The script prints the public URL when it finishes (typically 3–5
minutes). Hard-refresh the dashboard tab afterwards to clear cached assets.

---

## Optional — change the dashboard password

```bash
gcloud run services update geidea-dashboard --region us-central1 \
  --update-env-vars DASH_PASSWORD=new-strong-password
```

## Optional — view live logs

```bash
gcloud run services logs tail geidea-dashboard --region us-central1
```

## Optional — tear it down

```bash
gcloud run services delete geidea-dashboard --region us-central1
```
