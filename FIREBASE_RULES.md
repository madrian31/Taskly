# Firebase Realtime Database Rules Configuration

## Current Issue
Getting "Permission denied" error when trying to read/write events or tasks. This is because the database rules are too restrictive.

## How to Fix

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your project: **sample-login-d3ee5**
3. Go to **Realtime Database** (left menu)
4. Click on **Rules** tab

### Step 2: Update Rules

**Copy and paste this ENTIRE JSON into your Rules tab:**

```json
{
  "rules": {
    "users": {
      ".read": "auth.uid != null",
      "$uid": {
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'administrator'"
      }
    },
    "events": {
      ".read": "auth.uid != null",
      ".write": "auth.uid != null",
      ".indexOn": ["userId"],
      "$eventId": {
        ".validate": "newData.hasChildren(['title', 'startDate', 'startTime'])"
      }
    },
    "tasks": {
      "$ownerUid": {
        ".read": "$ownerUid === auth.uid",
        ".write": "$ownerUid === auth.uid",
        ".indexOn": ["createdAt"],
        "$taskId": {
          ".read": "$ownerUid === auth.uid || data.child('collaborators').child(auth.uid).val() === true",
          ".write": "$ownerUid === auth.uid || data.child('collaborators').child(auth.uid).val() === true"
        }
      }
    },
    "userTasks": {
      "$collabUid": {
        ".read": "$collabUid === auth.uid",
        "$ownerUid": {
          ".write": "auth.uid === $ownerUid || auth.uid === $collabUid",
          "$taskId": {
            ".validate": "newData.val() === true || newData.val() === null"
          }
        }
      }
    }
  }
}
```

### Step 3: Click "Publish"

### What These Rules Do:

✅ **Users**: All authenticated users can read user list (for collaborator dropdown), only self or admin can write  
✅ **Events**: Authenticated users can read/write events  
✅ **Tasks**: 
  - Owner can read/write all their tasks
  - Collaborators can read/write specific tasks where they are listed in `collaborators` node
✅ **userTasks** (collaboration mapping):
  - Each user can read their own mappings at `/userTasks/{theirUid}`
  - Task owner can write to `/userTasks/{collabUid}/{ownerUid}/{taskId}` to grant access

## Alternative: For Development/Testing Only

If you want to allow ALL authenticated users (less secure but easier to test):

```json
{
  "rules": {
    ".read": "auth.uid != null",
    ".write": "auth.uid != null"
  }
}
```

⚠️ **WARNING**: Only use for development! Switch to proper rules for production.

## After Updating Rules

1. **Publish** the rules in Firebase Console
2. **Refresh** the Tasks page in your browser
3. **Sign in** as the owner, add a collaborator
4. **Sign in** as the collaborator — they should now see the shared task

## Troubleshooting

If collaborator still can't see the task:

1. **Check Database entries exist** (Firebase Console → Data tab):
   - `/tasks/{ownerUid}/{taskId}/collaborators/{collabUid}` should be `true`
   - `/userTasks/{collabUid}/{ownerUid}/{taskId}` should be `true`

2. **Check Console for errors** — open browser DevTools (F12) → Console tab and look for `permission_denied`

3. **Try the dev rules** (the simple `.read`/`.write` auth.uid != null) to confirm the code works, then switch back to production rules
