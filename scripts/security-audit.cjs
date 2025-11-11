#!/usr/bin/env node

/**
 * Security Audit Script
 * 
 * This script scans the codebase for potential security vulnerabilities:
 * - Exposed API keys
 * - Hardcoded secrets
 * - Sensitive data in source code
 * - Common security anti-patterns
 * 
 * @author YakRooms Development Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Security patterns to detect
const securityPatterns = {
  apiKeys: {
    pattern: /(sk_live_[a-zA-Z0-9]{32,}|pk_live_[a-zA-Z0-9]{32,}|sk_test_[a-zA-Z0-9]{32,}|pk_test_[a-zA-Z0-9]{32,})/g,
    severity: 'CRITICAL',
    description: 'Stripe/Payment API Key',
    advice: 'Move to backend environment variables immediately'
  },
  awsKeys: {
    pattern: /(AKIA[0-9A-Z]{16})/g,
    severity: 'CRITICAL',
    description: 'AWS Access Key',
    advice: 'Revoke immediately and use IAM roles'
  },
  privateKeys: {
    pattern: /(-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----)/g,
    severity: 'CRITICAL',
    description: 'Private Key',
    advice: 'Remove immediately and rotate keys'
  },
  passwords: {
    pattern: /(password|passwd|pwd)\s*[:=]\s*["']([^"']{8,})["']/gi,
    severity: 'HIGH',
    description: 'Hardcoded Password',
    advice: 'Use environment variables or secure vault'
  },
  bearerTokens: {
    pattern: /(bearer\s+[a-zA-Z0-9\-._~+/]+=*)/gi,
    severity: 'HIGH',
    description: 'Hardcoded Bearer Token',
    advice: 'Remove and use secure token management'
  },
  secrets: {
    pattern: /(api[_-]?secret|client[_-]?secret|secret[_-]?key)\s*[:=]\s*["']([^"']{10,})["']/gi,
    severity: 'HIGH',
    description: 'Hardcoded Secret',
    advice: 'Move to environment variables'
  },
  databaseUrls: {
    pattern: /(mysql|postgresql|mongodb):\/\/([^:]+):([^@]+)@/gi,
    severity: 'HIGH',
    description: 'Database URL with Credentials',
    advice: 'Use connection pooling with env variables'
  },
  jwtSecrets: {
    pattern: /(jwt[_-]?secret)\s*[:=]\s*["']([^"']{10,})["']/gi,
    severity: 'HIGH',
    description: 'JWT Secret',
    advice: 'Move to secure backend configuration'
  }
};

// Files and directories to exclude from scanning
const excludePatterns = [
  /node_modules/,
  /dist/,
  /build/,
  /\.git/,
  /coverage/,
  /\.next/,
  /\.nuxt/,
  /\.cache/,
  /package-lock\.json/,
  /yarn\.lock/,
  /pnpm-lock\.yaml/,
  /\.min\.js$/,
  /\.map$/
];

// Results storage
const results = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: []
};

let filesScanned = 0;
let issuesFound = 0;

/**
 * Check if a file should be scanned
 */
function shouldScanFile(filePath) {
  // Check if file matches any exclude pattern
  if (excludePatterns.some(pattern => pattern.test(filePath))) {
    return false;
  }

  // Only scan text files
  const ext = path.extname(filePath).toLowerCase();
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.env',
    '.yaml', '.yml', '.xml', '.properties', '.config',
    '.txt', '.md', '.sh', '.bash', '.zsh'
  ];

  return textExtensions.includes(ext) || path.basename(filePath).startsWith('.env');
}

/**
 * Scan a file for security issues
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check each security pattern
    Object.entries(securityPatterns).forEach(([name, config]) => {
      const matches = content.matchAll(config.pattern);

      for (const match of matches) {
        // Find line number
        let lineNumber = 1;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount > match.index) {
            lineNumber = i + 1;
            break;
          }
        }

        const issue = {
          file: filePath,
          line: lineNumber,
          type: name,
          severity: config.severity,
          description: config.description,
          advice: config.advice,
          match: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
          context: lines[lineNumber - 1]?.trim().substring(0, 80)
        };

        issuesFound++;

        switch (config.severity) {
          case 'CRITICAL':
            results.critical.push(issue);
            break;
          case 'HIGH':
            results.high.push(issue);
            break;
          case 'MEDIUM':
            results.medium.push(issue);
            break;
          case 'LOW':
            results.low.push(issue);
            break;
          default:
            results.info.push(issue);
        }
      }
    });

    filesScanned++;
  } catch (error) {
    console.error(`${colors.red}Error scanning ${filePath}:${colors.reset}`, error.message);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!excludePatterns.some(pattern => pattern.test(fullPath))) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        if (shouldScanFile(fullPath)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error scanning directory ${dirPath}:${colors.reset}`, error.message);
  }
}

/**
 * Print severity-specific issues
 */
function printIssues(severity, issues, color) {
  if (issues.length === 0) return;

  console.log(`\n${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${color}${severity} SEVERITY ISSUES (${issues.length})${colors.reset}`);
  console.log(`${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  issues.forEach((issue, index) => {
    console.log(`\n${color}[${index + 1}] ${issue.description}${colors.reset}`);
    console.log(`  ${colors.cyan}File:${colors.reset} ${issue.file}:${issue.line}`);
    console.log(`  ${colors.cyan}Type:${colors.reset} ${issue.type}`);
    console.log(`  ${colors.yellow}⚠️  ${issue.advice}${colors.reset}`);
    if (issue.context) {
      console.log(`  ${colors.blue}Context:${colors.reset} ${issue.context}`);
    }
  });
}

/**
 * Print summary report
 */
function printSummary() {
  console.log(`\n${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.magenta}SECURITY AUDIT SUMMARY${colors.reset}`);
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  console.log(`\n  Files Scanned: ${filesScanned}`);
  console.log(`  Issues Found: ${issuesFound}`);
  console.log(`    ${colors.red}● CRITICAL: ${results.critical.length}${colors.reset}`);
  console.log(`    ${colors.yellow}● HIGH: ${results.high.length}${colors.reset}`);
  console.log(`    ${colors.cyan}● MEDIUM: ${results.medium.length}${colors.reset}`);
  console.log(`    ${colors.blue}● LOW: ${results.low.length}${colors.reset}`);

  if (issuesFound === 0) {
    console.log(`\n${colors.green}✓ No security issues detected!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Security issues require attention!${colors.reset}`);
  }
}

/**
 * Print recommendations
 */
function printRecommendations() {
  if (issuesFound === 0) return;

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}SECURITY RECOMMENDATIONS${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  console.log(`
1. ${colors.yellow}Environment Variables${colors.reset}
   - Store all secrets in .env files (backend only)
   - Never commit .env files to version control
   - Use .env.example for documentation

2. ${colors.yellow}Backend Integration${colors.reset}
   - Move all payment processing to backend
   - Use server-side API calls with stored keys
   - Return only redirect URLs to frontend

3. ${colors.yellow}Git Security${colors.reset}
   - Install git-secrets: npm install -g git-secrets
   - Set up pre-commit hooks
   - Review git history for exposed secrets

4. ${colors.yellow}Key Rotation${colors.reset}
   - Revoke any exposed keys immediately
   - Generate new keys and store securely
   - Enable IP whitelisting where possible

5. ${colors.yellow}Monitoring${colors.reset}
   - Enable GitHub secret scanning
   - Set up API usage alerts
   - Monitor for unusual activity
  `);
}

/**
 * Main execution
 */
function main() {
  const startTime = Date.now();

  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════════════╗
║                    YakRooms Security Audit Tool                        ║
║                         Version 1.0.0                                  ║
╚════════════════════════════════════════════════════════════════════════╝
  ${colors.reset}`);

  const projectRoot = process.argv[2] || process.cwd();
  console.log(`${colors.blue}Scanning:${colors.reset} ${projectRoot}\n`);

  // Start scanning
  scanDirectory(projectRoot);

  // Print results
  printIssues('CRITICAL', results.critical, colors.red);
  printIssues('HIGH', results.high, colors.yellow);
  printIssues('MEDIUM', results.medium, colors.cyan);
  printIssues('LOW', results.low, colors.blue);

  printSummary();
  printRecommendations();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.magenta}Completed in ${duration}s${colors.reset}\n`);

  // Exit with error code if critical or high severity issues found
  if (results.critical.length > 0 || results.high.length > 0) {
    process.exit(1);
  }
}

// Run the audit
main();

