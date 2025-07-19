# Robot Framework Test Suite

End-to-end test suite for the FitApp using Robot Framework and Selenium.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd robot-tests/
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your test credentials:
   ```
   TEST_EMAIL=your-test-email@example.com
   TEST_PASSWORD=your-test-password
   TEST_USERNAME=your-test-username
   BASE_URL=http://localhost:3000
   ```

3. **Ensure the webapp is running:**
   ```bash
   cd ../webapp/
   npm run dev
   ```

## Running Tests

```bash
# Run all tests
robot --outputdir reports/ tests/

# Run specific test file
robot --outputdir reports/ tests/exercises/exercise_tests.robot

# Run with specific browser
robot --variable BROWSER:Firefox --outputdir reports/ tests/

# Run in headless mode
robot --variable HEADLESS:True --outputdir reports/ tests/
```

## Project Structure

```
robot-tests/
├── tests/                    # Test suites organized by feature
│   ├── auth/                 # Authentication tests
│   ├── exercises/            # Exercise management tests
│   ├── routines/             # Routine management tests
│   ├── workouts/             # Workout execution tests
│   └── profile/              # Profile management tests
├── keywords/                 # Custom keywords for each feature
├── resources/                # Common resources and variables
├── reports/                  # Test execution results (gitignored)
├── screenshots/              # Screenshots captured during tests (gitignored)
├── archive/                  # Legacy files and documentation
│   ├── legacy-tests/         # Old test files
│   ├── documentation/        # Historical documentation
│   └── old-screenshots/      # Archived screenshots
├── .env.example             # Environment variable template
└── requirements.txt         # Python dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_EMAIL` | Primary test account email | Required |
| `TEST_PASSWORD` | Primary test account password | Required |
| `TEST_USERNAME` | Primary test account username | Required |
| `BASE_URL` | Application base URL | http://localhost:3000 |
| `INVALID_EMAIL` | Invalid email for negative tests | invalid@example.com |
| `INVALID_PASSWORD` | Invalid password for negative tests | wrongpassword |

## Security Note

Never commit real credentials to version control. Always use the `.env` file for sensitive data.

## Legacy Files

Historical test files and documentation have been moved to the `archive/` directory for reference.