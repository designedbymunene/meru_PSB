# Maestro E2E Tests

This directory contains end-to-end tests for the Meru County PSB mobile application using [Maestro](https://maestro.mobile.dev).

## Quick Start

### Prerequisites

1. Install Maestro CLI:
   ```bash
   npm install -g @maestro-dev/tester
   ```

2. Set up test credentials (optional):
   ```bash
   export TEST_EMAIL="your-test-email@example.com"
   export TEST_PASSWORD="YourTestPassword123!"
   ```

### Running Tests

Run all tests:
```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/
```

Run specific category:
```bash
# Smoke tests only
maestro test --appId com.nickm101.merucountypsb .maestro/flows/smoke/

# Authentication tests
maestro test --appId com.nickm101.merucountypsb .maestro/flows/auth/

# Job application tests
maestro test --appId com.nickm101.merucountypsb .maestro/flows/applications/
```

Run single test:
```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/smoke/app-launch.yaml
```

## Test Structure

```
.maestro/
├── .maestro.yaml          # Base configuration
├── README.md              # This file
├── docs/
│   └── TEST_PLAN.md       # Comprehensive test plan documentation
└── flows/
    ├── helpers/           # Reusable helper flows
    ├── smoke/             # Smoke tests (critical path)
    ├── auth/              # Authentication tests
    ├── applications/      # Job application tests
    └── profile/           # Profile management tests
```

## Test ID Reference

All interactive components have `testID` props for reliable test selectors. See `docs/TEST_PLAN.md` for a complete reference of all testIDs.

## Environment Variables

- `TEST_EMAIL` - Email for test user (optional)
- `TEST_PASSWORD` - Password for test user (optional)
- `CLEAR_STORAGE` - Whether to clear app storage before tests

## Adding New Tests

1. Create a new `.yaml` file in the appropriate category folder
2. Follow the existing test patterns
3. Use helper flows via `runFlow:` directive
4. Document in `docs/TEST_PLAN.md`

## Resources

- [Maestro Documentation](https://maestro.mobile.dev)
- [Test Plan](./docs/TEST_PLAN.md)
- [Main Project README](../../README.md)
