#!/bin/bash

#
# Git Hooks Installation Script
# 
# This script installs pre-commit hooks to prevent accidental commits of:
# - API keys
# - Secrets
# - Credentials
# - Sensitive data
#
# Author: YakRooms Development Team
# Version: 1.0.0
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Git Security Hooks Installation                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get the git hooks directory
GIT_HOOKS_DIR=".git/hooks"

if [ ! -d "$GIT_HOOKS_DIR" ]; then
    echo -e "${RED}Error: Not a git repository or .git/hooks directory not found${NC}"
    exit 1
fi

# Create pre-commit hook
echo -e "${YELLOW}Installing pre-commit hook...${NC}"

cat > "$GIT_HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

#
# Pre-commit hook to prevent committing sensitive data
#

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}Running security checks...${NC}"

# Get list of files being committed
FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Patterns to detect
declare -A PATTERNS=(
    ["Stripe API Key"]="sk_live_[a-zA-Z0-9]{32,}|pk_live_[a-zA-Z0-9]{32,}"
    ["Picatic API Key"]="sk_live_[a-zA-Z0-9]{32,}"
    ["AWS Access Key"]="AKIA[0-9A-Z]{16}"
    ["Private Key"]="-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"
    ["Password"]="(password|passwd|pwd)[[:space:]]*[:=][[:space:]]*['\"][^'\"]{8,}['\"]"
    ["Bearer Token"]="[Bb]earer[[:space:]]+[a-zA-Z0-9\-._~+/]+={0,2}"
    ["API Secret"]="(api[_-]?secret|client[_-]?secret)[[:space:]]*[:=][[:space:]]*['\"][^'\"]{10,}['\"]"
    ["Database URL"]="(mysql|postgresql|mongodb)://[^:]+:[^@]+@"
)

ISSUES_FOUND=0

# Check each file
for FILE in $FILES; do
    # Skip binary files and certain file types
    if [[ $FILE == *".min.js" ]] || [[ $FILE == *".map" ]] || [[ $FILE == "package-lock.json" ]]; then
        continue
    fi

    # Check each pattern
    for PATTERN_NAME in "${!PATTERNS[@]}"; do
        PATTERN="${PATTERNS[$PATTERN_NAME]}"
        
        if git diff --cached --unified=0 "$FILE" | grep -qE "$PATTERN"; then
            echo -e "${RED}✗ ${PATTERN_NAME} detected in: ${FILE}${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    done
done

# Check for .env files
if echo "$FILES" | grep -qE "^\.env$|^\.env\."; then
    echo -e "${RED}✗ Attempting to commit .env file!${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for common secret files
if echo "$FILES" | grep -qE "secrets|credentials|\.pem$|\.key$|\.p12$"; then
    echo -e "${RED}✗ Attempting to commit potential secret file!${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -gt 0 ]; then
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                   COMMIT BLOCKED                               ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${YELLOW}Security issues detected in your commit.${NC}"
    echo -e "${YELLOW}Please review and remove sensitive data before committing.${NC}"
    echo ""
    echo -e "If you're certain these are false positives:"
    echo -e "  ${BLUE}git commit --no-verify${NC} (use with caution!)"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Security checks passed${NC}"
exit 0
EOF

# Make the hook executable
chmod +x "$GIT_HOOKS_DIR/pre-commit"

echo -e "${GREEN}✓ Pre-commit hook installed${NC}"

# Create commit-msg hook
echo -e "${YELLOW}Installing commit-msg hook...${NC}"

cat > "$GIT_HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash

#
# Commit message hook to warn about security-related commits
#

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check for security-related keywords
if echo "$COMMIT_MSG" | grep -qiE "api.?key|secret|password|credential|token"; then
    echo ""
    echo "⚠️  Warning: Your commit message contains security-related keywords"
    echo "   Please ensure you're not committing sensitive data"
    echo ""
fi

exit 0
EOF

chmod +x "$GIT_HOOKS_DIR/commit-msg"

echo -e "${GREEN}✓ Commit-msg hook installed${NC}"

# Test the installation
echo -e "\n${YELLOW}Testing installation...${NC}"

if [ -x "$GIT_HOOKS_DIR/pre-commit" ] && [ -x "$GIT_HOOKS_DIR/commit-msg" ]; then
    echo -e "${GREEN}✓ All hooks installed and executable${NC}"
else
    echo -e "${RED}✗ Hook installation failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║             Installation Complete                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Security hooks are now active!${NC}"
echo ""
echo "What's protected:"
echo "  ✓ API keys (Stripe, Picatic, AWS, etc.)"
echo "  ✓ Private keys and certificates"
echo "  ✓ Passwords and credentials"
echo "  ✓ Database connection strings"
echo "  ✓ Bearer tokens"
echo "  ✓ .env files"
echo ""
echo "To bypass (use with extreme caution):"
echo "  git commit --no-verify"
echo ""

exit 0

