#!/bin/bash

# Function to display colored text
color_text() {
    echo -e "\e[1;32m$1\e[0m"  # Green color for regular output
}

error_text() {
    echo -e "\e[1;31m$1\e[0m"  # Red color for error messages
}

info_text() {
    echo -e "\e[1;34m$1\e[0m"  # Blue color for informational messages
}

# Main menu
while true; do
    echo "Select an option:"
    echo "1) git add (selectively and commit)"
    echo "2) git add (all changes and commit)"
    echo "3) git status"
    echo "4) Manage Remotes"
    echo "5) Manage Branches"
    echo "6) Merge Branches"
    echo "7) Exit"

    read -p "Enter your choice (1-7): " choice

    case $choice in
        1)
            echo -e "Files available to add (untracked):"
            git status --porcelain | grep '^\?\?' | awk '{print $2}' | while read -r file; do
                color_text "$file"
            done

            echo -e "Files available to add (modified):"
            git status --porcelain | grep '^[MARC]' | awk '{print $2}' | while read -r file; do
                color_text "$file"
            done

            read -p "Enter the file(s) to add (or space-separated list): " -r files
            # Convert to an array to handle spaces
            IFS=' ' read -r -a file_array <<< "$files"
            files_to_add=()

            # Check if the files exist
            for file in "${file_array[@]}"; do
                if [[ -e $file ]]; then
                    files_to_add+=("$file")  # Add existing files to the array
                else
                    error_text "File '$file' does not exist."
                fi
            done

            # Only add files if there are valid ones
            if [ ${#files_to_add[@]} -gt 0 ]; then
                git add "${files_to_add[@]}"
                info_text "Added files: ${files_to_add[*]}"

                read -p "Enter commit message: " commit_message
                git commit -m "$commit_message"
                git push  # Automatically push changes
            else
                error_text "No valid files to add."
            fi
            ;;
        2)
            git add .
            info_text "All changes added."

            read -p "Enter commit message: " commit_message
            git commit -m "$commit_message"
            git push  # Automatically push changes
            ;;
        3)
            git status
            ;;
        4)
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
                    error_text "Invalid option for managing remotes."
                    ;;
            esac
            ;;
        5)
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
                    error_text "Invalid option for managing branches."
                    ;;
            esac
            ;;
        6)
            read -p "Enter the branch to merge into the current branch: " branch_to_merge
            git merge "$branch_to_merge"
            ;;
        7)
            echo "Exiting..."
            exit 0
            ;;
        *)
            error_text "Invalid option. Please select a number between 1 and 7."
            ;;
    esac
done