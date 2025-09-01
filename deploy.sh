#!/bin/bash

# GitHub Pages Deployment Script
# Run this locally to deploy the website to GitHub Pages

echo "================================"
echo "Deploying to GitHub Pages"
echo "================================"

# Configuration
GITHUB_USERNAME="iamkarmakazi115"
REPO_NAME="paulcastro-website"
BRANCH="main"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
read -p "Enter commit message: " commit_message
git commit -m "${commit_message:-'Update website'}"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin ${BRANCH}

echo "================================"
echo "Deployment complete!"
echo "Your website will be available at:"
echo "https://paulcastro.karmakazi.org"
echo "================================"