# Privacy Policy

Last updated: May 3, 2026

## Overview

Email Makinator is a browser extension that helps users draft emails with AI assistance.  
This policy explains what data is processed, when it is processed, and how it is used.

## Scope

Email Makinator currently supports Gmail as its first email provider.

## What Data Is Processed

Email Makinator may process the following data when you use it:

- Email prompt/instruction text you enter in the dialog.
- Draft content from the active Gmail composer (when needed for selected mode).
- Reply context from the active Gmail thread/composer (when needed for selected mode).
- Generated email output returned by the configured AI API endpoint.
- Extension settings stored locally:
  - selected model
  - optional Pollinations API key

## When Data Is Processed

Email Makinator is designed to process Gmail content only during user-initiated actions, such as:

- opening the Email Makinator dialog from the toolbar button
- selecting a mode
- submitting a request
- applying generated output back into the Gmail composer

## Where Data Is Sent

When you submit a generation request, relevant request payload data is sent to the configured API endpoint (`WXT_PUBLIC_API_BASE_URL`).

If you provide an optional Pollinations API key, it may be sent as an Authorization bearer token with that request.

## Local Storage

Email Makinator stores extension settings in browser extension local storage, including:

- preferred model
- optional Pollinations API key

No cloud sync is required for these settings by default.

## Data Sharing

Email Makinator does not sell personal data.  
Data is only transmitted as required to fulfill your AI generation request to the configured API service.

## Data Retention

- Extension settings remain in local browser storage until you change or remove them.
- Generated/request data retention on server side depends on the configured backend/API service policy.

## Security Notes

No software can guarantee absolute security.  
Users should avoid submitting highly sensitive information unless they trust the configured API service and environment.

## Third-Party Services

Email Makinator may interact with:

- Gmail (UI integration context)
- Pollinations AI ecosystem (if using related model/API key flow)
- A configured backend API endpoint for generation

Each third-party service may have its own privacy policy.

## Your Choices

You can:

- stop using the extension at any time
- remove extension settings from browser storage
- uninstall the extension
- avoid entering sensitive content

## Contact

For privacy questions or concerns, please open an issue in this repository:

`https://github.com/mkgp-dev/email-makinator/issues`
