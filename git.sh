#!/bin/bash

# Function to display colored text
color_text() {
    echo -e "\e[1;32m$1\e[0m"  # Green color
}

# Main menu
while true; do
    echo "Select an option:"
    echo "1) git push"
    echo "2) git pull"
    echo "3) git add (selectively and auto-push)"
    echo "4) git add (all changes and auto-push)"
    echo "5) Manage Remotes"
    echo "6) Manage Branches"
    echo "7) Merge Branches"
    echo "8) Exit"

    read -p "Enter your choice (1-8): " choice

    case $choice in
        1)
            read -p "Enter commit message for push: " message
            git push
            ;;
        2)
            git pull
            ;;
        3)
            echo -e "Files available to add (untracked):"
            git status --porcelain | grep '^\?\?' | awk '{print $2}' | while read -r file; do
                color_text "$file"
            done

            echo -e "Files available to add (modified):"
            git status --porcelain | grep '^[MARC]' | awk '{print $2}' | while read -r file; do
                color_text "$file"
            done

            read -p "Enter the file(s) to add (or space-separated list): " files
            git add $files
            read -p "Enter commit message: " message
            git commit -m "$message"
            git push
            ;;
        4)
            git add .
            read -p "Enter commit message: " message
            git commit -m "$message"
            git push
            ;;
        5)
            echo "Manage Remote Repositories:"
            echo "1) Add Remote"
            echo "2) Remove Remote"
            echo "3) List Remotes"
            read -p "Enter your choice (1-3): " remote_choice

            case $remote_choice in
                1)
                    read -p "Enter remote name: " remote_name
                    read -p "Enter remote URL: " remote_url
                    git remote add "$remote_name" "$remote_url"
                    ;;
                2)
                    read -p "Enter remote name to remove: " remote_name
                    git remote remove "$remote_name"
                    ;;
                3)
                    git remote -v
                    ;;
                *)
                    echo "Invalid option for managing remotes."
                    ;;
            esac
            ;;
        6)
            echo "Manage Branches:"
            echo "1) List Branches"
            echo "2) Create New Branch"
            echo "3) Switch Branch"
            read -p "Enter your choice (1-3): " branch_choice

            case $branch_choice in
                1)
                    git branch
                    ;;
                2)
                    read -p "Enter new branch name: " branch_name
                    git branch "$branch_name"
                    ;;
                3)
                    read -p "Enter branch name to switch to: " branch_name
                    git checkout "$branch_name"
                    ;;
                *)
                    echo "Invalid option for managing branches."
                    ;;
            esac
            ;;
        7)
            read -p "Enter the branch to merge into the current branch: " branch_to_merge
            git merge "$branch_to_merge"
            ;;
        8)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option. Please select a number between 1 and 8."
            ;;
    esac
done