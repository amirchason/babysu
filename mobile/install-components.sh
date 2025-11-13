#!/bin/bash

# BabySu Mobile - Component Dependencies Installer
# Run this script to install required dependencies for the component library

echo "🎵 BabySu Mobile - Installing Component Dependencies"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing required dependencies..."
echo ""

# Install prop-types for component validation
echo "Installing prop-types..."
npm install prop-types

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Import components in your screens:"
echo "   import { Button, Card, Avatar } from './components';"
echo ""
echo "2. Read the documentation:"
echo "   cat src/components/README.md"
echo ""
echo "3. View completion report:"
echo "   cat COMPONENTS_COMPLETED.md"
echo ""
echo "🎉 Your component library is ready to use!"
