# GitHub Copilot Metrics Dashboard

A comprehensive solution for visualizing GitHub Copilot usage metrics across your organization.

## Overview

The GitHub Copilot Metrics Dashboard is a modern web application built with Next.js that provides real-time insights into GitHub Copilot usage. It leverages the official [GitHub Copilot Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics?apiVersion=2022-11-28) and [GitHub Copilot User Management API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-user-management?apiVersion=2022-11-28) to collect and display actionable data.

![GitHub Copilot Metrics - Dashboard](/docs/dashboard.png "GitHub Copilot Metrics Dashboard")

## Features

### Interactive Dashboard

- **Advanced Filtering**: Filter metrics by date range, programming languages, and code editors
- **Flexible Time Frames**: Visualize data in daily, weekly, or monthly aggregations
- **Key Metrics**:
  - **Acceptance Average**: Percentage of code suggestions accepted by users
  - **Active Users**: Number of developers actively using Copilot
  - **Adoption Rate**: Ratio of active users to total licensed seats
  - **Language Breakdown**: Usage distribution across programming languages
  - **Editor Breakdown**: Usage distribution across code editors

### Seat Management

View and manage GitHub Copilot license assignments across your organization.

> This feature can be toggled using the `ENABLE_SEATS_FEATURE` environment variable (default: `true`).
> Seat data ingestion can be disabled by setting `ENABLE_SEATS_INGESTION` to `false`.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- GitHub Enterprise or Organization with Copilot licenses
- GitHub Personal Access Token with appropriate permissions

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/copilot-metrics-dashboard.git
   cd copilot-metrics-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```
   GITHUB_ENTERPRISE=your-enterprise-name  # not necessary if using Github Team plan
   GITHUB_ORGANIZATION=your-org-name
   GITHUB_TOKEN=your-github-token
   GITHUB_API_VERSION=2022-11-28
   GITHUB_API_SCOPE=organization  # or "enterprise"
   ENABLE_SEATS_FEATURE=true
   ENABLE_SEATS_INGESTION=true
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, Radix UI
- **Data Visualization**: Recharts
- **State Management**: Valtio
- **Form Handling**: React Hook Form, Zod
- **Testing**: Vitest, React Testing Library

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](https://opensource.microsoft.com/codeofconduct/) before submitting a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Security

For security issues, please refer to our [Security Policy](SECURITY.md).

## Support

For support, please check the [Support Guide](SUPPORT.md) or open an issue in this repository.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.
