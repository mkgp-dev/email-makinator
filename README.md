<div align="center">
  <a href="https://github.com/mkgp-dev/email-makinator">
    <img src="public/logo.svg" alt="Logo" width="150" height="150">
  </a>

<h3 align="center">email-makinator</h3>

  <p align="center">
    A modern browser extension that helps anyone create a polished email. 
    <br />
    <a href="https://github.com/mkgp-dev/email-makinator/issues/new?template=bug_report.md">Report a bug</a>
    &middot;
    <a href="https://github.com/mkgp-dev/email-makinator/issues/new?template=feature_request.md">Request a feature</a>
  </p>
</div>

> [!NOTE]
> I cannot afford the Chrome Web Store one-time publisher fee right now, ~~so this project is currently submitted to Firefox Add-ons for review first~~. To use the extension immediately on Chrome or Firefox, follow [INSTALLATION.md](./INSTALLATION.md) and install from the builds in GitHub Releases.

## Downloads

<table cellspacing="0" cellpadding="0">
  <tr>
    <td valign="center">
      <a align="center" href="#" disabled>
        <img src="https://user-images.githubusercontent.com/22908993/166417152-f870bfbd-1770-4c28-b69d-a7303aebc9a6.png" alt="Chrome web store" />
        <p align="center">Chrome Web Store</p>
      </a>
    </td>
    <td valign="center">
      <a href="https://addons.mozilla.org/en-US/firefox/addon/email-makinator/">
        <img src="https://user-images.githubusercontent.com/22908993/166417727-3481fef4-00e5-4cf0-bb03-27fb880d993c.png" alt="Firefox add-ons" />
        <p align="center">Firefox Add-ons</p>
      </a>
    </td>
  </tr>
</table>

## About the Project

Email Makinator started from a real, personal observation: someone close to me was struggling to write emails with the right tone and structure. Even though tools like ChatGPT help, free tiers can be limited, and subscriptions are not always practical for everyone.

I built Email Makinator to make email writing easier, more accessible, and less stressful. The goal is simple: help people write better emails across email platforms without worrying about complicated workflows, limits, or premium lock-ins. It currently starts with Gmail as the first supported provider.

This project is still in its early stage, but it is built with a long-term vision: make AI-assisted email writing feel natural, lightweight, and available to anyone.

### Features

- Generate new emails, improve existing drafts, or create replies with context.
- Revision flow for refining generated output without starting over.
- Settings popup for model selection and optional Pollinations API key.
- Cross-browser build support via WXT (Chrome and Firefox).

### Built With

- **WXT** for modern browser extension development and cross-browser builds.
- **React + TypeScript** for component architecture and type-safe logic.
- **Tailwind CSS** for utility-first styling.
- **Zustand** for lightweight dialog and UI state management.
- **Lucide React** for iconography.
- **Vitest** for unit and integration tests.
- **Pollinations AI API** for AI-powered email generation.

## Contributing

Contributions are welcome and appreciated.

If you want to help:

- **Report a bug** by opening an issue with clear reproduction steps.
- **Request a feature** by describing the use case and expected behavior.
- **Improve the codebase** by forking the repository and opening a pull request.

Please keep changes focused, tested, and aligned with the project goals.

## Special Credits

Special thanks to [Pollinations AI](https://pollinations.ai) for accessible AI model infrastructure.

## License

This is a source-available project. You can use it and modify it for personal, non-commercial purposes, but you may not redistribute it or claim it as your own. See the [LICENSE](./LICENSE) file for full details.
