# Welcome to WDK Avalanche Starter Contributing Guide

Thank you for investing your time in contributing to the WDK Avalanche Starter!

This guide aims to provide an overview of the contribution workflow to help us make the contribution process effective for everyone involved.

## About the Project

WDK Avalanche Starter is a fully integrated Avalanche C-Chain development starter built on Scaffold-ETH 2, powered by the Tether Wallet Development Kit (WDK). This starter provides a complete development environment for building dApps on Avalanche Local, Fuji Testnet, and Mainnet.

Read the [README](README.md) to get an overview of the project.

### Vision

The goal of WDK Avalanche Starter is to provide developers with a production-ready foundation for building dApps on Avalanche using the WDK. We aim to:

- Maintain a clean, WDK-first architecture
- Provide excellent developer experience with modern tooling
- Support all Avalanche networks (Local, Fuji, Mainnet)
- Ensure robust security practices for wallet management
- Keep the starter kit minimal yet feature-complete

### Project Status

The project is under active development and maintained by [Dojo Coding](https://dojocoding.io).

You can view open Issues, follow the development process, and contribute to the project.

### Heritage

This project is built on [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) by [BuidlGuidl](https://buidlguidl.com/), adapted specifically for Avalanche and WDK. We're grateful for their incredible work in fostering open source development.

### Rules

1. All code contributions require an Issue to be created and discussed before submitting a Pull Request. This ensures proper discussion and alignment on proposed changes.
2. Contributors must be humans, not bots.
3. First-time contributions must not contain only spelling or grammatical fixes.
4. Changes to WDK integration or seed vault security require thorough review and testing.

## Getting Started

You can contribute to this repo in many ways:

- Solve open issues
- Report bugs or feature requests
- Improve the documentation
- Add examples or tutorials
- Enhance WDK integration
- Improve Avalanche network support

Contributions are made via Issues and Pull Requests (PRs). A few general guidelines for contributions:

- Search for existing Issues and PRs before creating your own.
- Contributions should only fix/add the functionality in the issue OR address style issues, not both.
- If you're running into an error, please give context. Explain what you're trying to do and how to reproduce the error.
- Please use the same formatting in the code repository. You can configure your IDE using the prettier/linting config files included in each package.
- If applicable, please edit the README.md file to reflect the changes.

## Development Guidelines

### WDK-Specific Guidelines

When contributing WDK-related code:

- All wallet operations must use WDK exclusively (no wagmi/viem for runtime blockchain operations)
- Follow the existing pattern in `contexts/WdkContext.tsx` for wallet state management
- Ensure seed phrases are always encrypted using the `seedVault.ts` utilities
- Never log or expose seed phrases or private keys
- Test on all three networks (Local, Fuji, Mainnet) when applicable

### Avalanche Network Testing

Before submitting a PR that affects network functionality:

1. Test on local Avalanche node (`yarn avalanche:up`)
2. Test on Fuji testnet (get testnet AVAX from faucets)
3. Verify network switching works correctly
4. Ensure proper chain ID handling (Local: 1337, Fuji: 43113, Mainnet: 43114)

### Security Considerations

For changes to security-sensitive areas:

- `services/seedVault.ts` - Seed phrase encryption/storage
- `contexts/WdkContext.tsx` - Wallet initialization and management
- Any cryptographic operations

Please:
- Explain the security implications in your PR description
- Add tests if applicable
- Request security review from maintainers

## Issues

Issues should be used to report problems, request a new feature, or discuss potential changes before a PR is created.

### Solve an Issue

Scan through our existing issues to find one that interests you.

If a contributor is working on the issue, they will be assigned to it. If you find an issue to work on, you are welcome to assign it to yourself and open a PR with a fix.

### Create a New Issue

If a related issue doesn't exist, you can open a new issue.

Some tips to follow when creating an issue:

- Provide as much context as possible. Over-communicate to give the most details to the reader.
- Include the steps to reproduce the issue or the reason for adding the feature.
- For bugs, specify which network you're on (Local/Fuji/Mainnet)
- For WDK issues, include WDK version and browser information
- Screenshots, videos, etc., are highly appreciated.

## Pull Requests

### Pull Request Process

We follow the ["fork-and-pull" Git workflow](https://github.com/susam/gitpr)

1. Fork the repo
2. Clone the project
3. Create a new branch with a descriptive name (e.g., `fix/wallet-unlock-error` or `feat/add-token-support`)
4. Commit your changes to the new branch
5. Push changes to your fork
6. Open a PR in our repository and tag one of the maintainers to review your PR

### Pull Request Guidelines

Here are some tips for a high-quality pull request:

- Create a title that accurately defines the work done (e.g., "Fix wallet unlock on Fuji testnet")
- Structure the description neatly with bullet points and screenshots
- Add the link to the issue if applicable
- Have a good commit message that summarizes the work done
- Include test results for all three networks if network-related
- Update README.md if you're adding new features or changing existing functionality

### Testing Requirements

Before submitting your PR:

- Run `yarn compile` to ensure contracts compile
- Run `yarn test` to ensure tests pass
- Test the frontend with `yarn start`
- Verify wallet operations work correctly
- Check for console errors or warnings

Once you submit your PR:

- We may ask questions, request additional information, or ask for changes before merging
- As you update your PR and apply changes, mark each conversation as resolved
- Be patient - security-related PRs require extra scrutiny

Once the PR is approved, we'll "squash-and-merge" to keep the git commit history clean.

## Getting Help

- Join our [Discord community](https://discord.gg/dojocoding)
- Check the [README](README.md) for setup and usage instructions
- Review [Avalanche documentation](https://docs.avax.network)
- Check [WDK documentation](https://docs.wallet.tether.io/)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and constructive in discussions
- Focus on what is best for the community
- Show empathy towards other community members
- Accept constructive criticism gracefully

Thank you for contributing to WDK Avalanche Starter! 🏔️
