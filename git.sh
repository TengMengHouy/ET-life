#!/bin/bash

echo "Select an option:"
echo "1) git push"
echo "2) git pull"
echo "3) git add (selectively)"
echo "4) git add (all changes)"
read -p "Enter your choice (1/2/3/4): " choice

case $choice in
    1)
        read -p "Enter commit message for push: " message
        git push
        ;;
    2)
        git pull
        ;;
    3)
        echo "Files available to add:"
        git status --porcelain | grep '^\?\?' | awk '{print $2}'   # List untracked files
        git status --porcelain | grep '^[MARC]' | awk '{print $2}'  # List modified, added, or removed files
        read -p "Enter the file(s) to add (or space-separated list): " files
        git add $files
        read -p "Enter commit message: " message
        git commit -m "$message"
        ;;
    4)
        git add .  # Add all changes
        read -p "Enter commit message: " message
        git commit -m "$message"
        ;;
    *)
        echo "Invalid option. Please select 1, 2, 3, or 4."
        ;;
esac