# Folder Suggestion Feature

## Overview
AI-powered folder suggestions appear automatically when a user selects a file for upload, helping organize files intelligently.

## Implementation Details

### API Integration
- **Endpoint**: `POST /api/folders/folder-suggestion`
- **Request Body**:
  ```json
  {
    "name": "long time no see full song.mp3",
    "type": "audio"
  }
  ```
- **Response**:
  ```json
  {
    "suggestedFolders": ["Music", "Audio", "Songs"]
  }
  ```

### User Flow

1. **File Selection**: User selects a file in the upload modal
2. **API Call**: Automatically sends file name and type to suggestion endpoint
3. **Loading State**: Shows AI analysis loader with sparkle icon
4. **Folder Display**: Shows suggested folders in beautiful card UI
   - **3 folders** = New folder suggestions (will create on selection)
   - **1 folder** = Existing folder (will move file there)
5. **Selection**: User clicks a folder card to select it
6. **Visual Feedback**: Selected folder shows checkmark and purple glow

### UI/UX Features

- **Smart Labeling**:
  - Multiple suggestions: "SUGGESTED_FOLDERS" + "Create new folder"
  - Single result: "EXISTING_FOLDER" + "Move to existing"
  
- **Visual Design**:
  - Purple gradient theme for AI suggestions
  - Sparkles icon to indicate AI-powered feature
  - Smooth hover effects and transitions
  - Clear selection state with checkmark
  - Folder/FolderPlus icons differentiate existing vs new

- **Loading States**:
  - Spinner with "AI analyzing file..." message
  - Non-blocking (user can still proceed without selection)

### Files Modified

1. **`client/src/hooks/useChunkUpload.js`**:
   - Added `suggestedFolders`, `loadingSuggestions`, `selectedFolder` states
   - Made `handleFileChange` async
   - Added `fetchFolderSuggestions()` function
   - Exported new states and handlers

2. **`client/src/components/UploadModal.jsx`**:
   - Added folder suggestion UI section
   - Imported `Folder`, `FolderPlus`, `Sparkles` icons
   - Added loading state display
   - Added folder card grid with selection logic

3. **`client/src/pages/UploadPage.jsx`**:
   - Destructured new states from `useChunkUpload`
   - Passed props to `UploadModal`

4. **`client/src/pages/FolderPage.jsx`**:
   - Destructured new states from `useChunkUpload`
   - Passed props to `UploadModal`

## Usage Example

```javascript
// When user selects "birthday-party.mp4":
// API receives: { name: "birthday-party.mp4", type: "video/mp4" }
// API returns: { suggestedFolders: ["Videos", "Events", "Memories"] }
// UI shows 3 purple cards with FolderPlus icons

// When user selects "invoice-2024.pdf" and "Documents" folder exists:
// API receives: { name: "invoice-2024.pdf", type: "application/pdf" }
// API returns: { suggestedFolders: ["Documents"] }
// UI shows 1 purple card with Folder icon labeled "Move to existing"
```

## Next Steps (Optional Enhancements)

1. **Folder Creation**: Integrate selected folder with actual folder creation API
2. **Auto-move**: Automatically move uploaded file to selected folder
3. **Remember Preference**: Cache user's folder choice for similar files
4. **Manual Override**: Allow user to skip suggestion and choose manually
5. **Confidence Score**: Show AI confidence level for each suggestion

## Testing

To test the feature:
1. Open the upload modal
2. Select any file
3. Watch for the AI loading indicator
4. See suggested folders appear
5. Click a folder to select it (checkmark appears)
6. Proceed with upload

The feature gracefully handles API failures by silently clearing suggestions without blocking the upload flow.
